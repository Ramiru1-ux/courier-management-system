/**
 * Authoritative server-side validation for the `shipments` list saved
 * through /api/app-data (see controllers/appDataController.js).
 *
 * This is NOT the same as validators/shipmentValidator.js - that one
 * validates the request body shape for the separate, unused
 * routes/shipmentRoutes.js REST module (ObjectId refs, packageType,
 * deliveryType - a different data model entirely). The real shipment
 * record that every frontend page actually reads and writes has the shape
 * seeded in frontend/src/context/StoreContext.js (senderName, recipientName,
 * recipientPhone, recipientCity, branch, serviceType, weight, codAmount,
 * status, driverId, history, ...), so it needs its own validator matching
 * that real shape - built from the same shared primitives
 * (validators/validatorHelpers.js) for consistency with the rest of the
 * project.
 *
 * Required fields and enums below were taken directly from the existing
 * business logic, not invented: recipientName/recipientPhone/recipientCity
 * are the exact fields frontend/src/pages/shipments/CreateShipmentPage.jsx
 * already requires before submitting; serviceType's options come from that
 * same form's <select>; the status enum comes from
 * frontend/src/utils/shipmentStatus.js (STATUS_META, the single source of
 * truth every page already agrees on).
 */
const { validationError, required, optionalString, number, oneOf, personName, postalText } = require("./validatorHelpers");
const { STATUSES, FAILURE_REASONS, checkTransition } = require("../config/shipmentWorkflow");

const SERVICE_TYPES = ["Standard", "Express", "Priority", "Same-Day", "Regional"];

/** Validates one shipment record. Throws a validationError (400, with a
 * `field` naming exactly which one) on the first problem found.
 *
 * `context.drivers` (the current, authoritative `cms_drivers` rows) and
 * `context.currentById` (the current `cms_shipments` rows keyed by id) are
 * optional - when supplied they enable the two cross-record business rules
 * below (driver-reference validity, suspended-driver assignment); the
 * per-field checks above them run either way. */
function validateShipmentRecord(item, index, context = {}) {
	const path = (field) => `shipments[${index}].${field}`;

	if (!item || typeof item !== "object" || Array.isArray(item)) {
		throw validationError(`shipments[${index}] must be an object`, `shipments[${index}]`);
	}

	required(item.id, path("id"));
	optionalString(required(item.trackingNumber, path("trackingNumber")), path("trackingNumber"), 40);
	optionalString(required(item.recipientName, path("recipientName")), path("recipientName"), 120);
	optionalString(required(item.recipientPhone, path("recipientPhone")), path("recipientPhone"), 30);
	optionalString(required(item.recipientCity, path("recipientCity")), path("recipientCity"), 80);
	optionalString(required(item.branch, path("branch")), path("branch"), 120);

	// Free-text field rules, the same ones the booking forms apply as people
	// type (frontend/src/utils/textValidation.js): a person or company name is
	// letters only, while an address, city or branch name takes digits but
	// never the symbols @$%^&*()_+.
	//
	// Checked ONLY on a value that is new or has just changed - the same
	// reasoning as the suspended-driver rule below. Every save re-sends the
	// whole list, so validating stored values too would let these rules
	// retro-invalidate records created before them and reject every future
	// save of the entire collection, not just the record at fault.
	const storedItem = context.currentById?.get(String(item.id));
	const justEntered = (field) => !storedItem || storedItem[field] !== item[field];
	if (justEntered("recipientName")) personName(item.recipientName, path("recipientName"));
	if (justEntered("senderName")) personName(item.senderName, path("senderName"));
	if (justEntered("recipientCity")) postalText(item.recipientCity, path("recipientCity"), { maxLength: 80 });
	if (justEntered("recipientAddress")) postalText(item.recipientAddress, path("recipientAddress"));
	if (justEntered("senderAddress")) postalText(item.senderAddress, path("senderAddress"));
	if (justEntered("branch")) postalText(item.branch, path("branch"), { maxLength: 120 });

	oneOf(item.serviceType || "Standard", path("serviceType"), SERVICE_TYPES);
	oneOf(item.status, path("status"), STATUSES);

	// The failed / RTO workflow is enforced HERE, server-side, against the
	// status this shipment currently has in MongoDB - never against whatever
	// the client claims it was. Without this a role could put a shipment into
	// any state it liked simply by sending that value in the shipments list:
	// a driver could close off a return as completed, or a failed delivery
	// could jump straight past the return journey.
	//
	// Only runs when the status actually changed, so re-saving an untouched
	// record can never be rejected by a rule added after it was created.
	const previousStatus = storedItem ? storedItem.status : null;
	if (item.status !== previousStatus) {
		const problem = checkTransition(previousStatus, item.status, context.role);
		if (problem) {
			throw validationError(`${path("status")}: ${problem}`, path("status"));
		}
	}

	// A failed delivery must say why. The reason is stored on the shipment as
	// a real field, not only buried in a history line, so the merchant's
	// Failed/RTO list can show it and it can be reported on.
	if (item.status === "DELIVERY_FAILED") {
		if (item.status !== previousStatus || item.failureReason !== undefined) {
			oneOf(required(item.failureReason, path("failureReason")), path("failureReason"), FAILURE_REASONS);
		}
	}
	if (item.failedAt !== undefined && item.failedAt !== null && Number.isNaN(Date.parse(item.failedAt))) {
		throw validationError(`${path("failedAt")} must be a valid date`, path("failedAt"));
	}
	if (item.rtoInitiatedAt !== undefined && item.rtoInitiatedAt !== null && Number.isNaN(Date.parse(item.rtoInitiatedAt))) {
		throw validationError(`${path("rtoInitiatedAt")} must be a valid date`, path("rtoInitiatedAt"));
	}
	if (item.rtoCompletedAt !== undefined && item.rtoCompletedAt !== null && Number.isNaN(Date.parse(item.rtoCompletedAt))) {
		throw validationError(`${path("rtoCompletedAt")} must be a valid date`, path("rtoCompletedAt"));
	}

	// A shipment with zero or negative weight, or a negative COD amount,
	// cannot exist in reality - COD of exactly 0 is valid (a prepaid
	// shipment, which several real seed records already use).
	number(item.weight, path("weight"), { min: 0.001 });
	number(item.codAmount === undefined || item.codAmount === null ? 0 : item.codAmount, path("codAmount"), { min: 0 });

	const hasDriverId = item.driverId !== null && item.driverId !== undefined && item.driverId !== "";
	if (hasDriverId) {
		optionalString(item.driverId, path("driverId"), 60);

		if (context.drivers) {
			const driver = context.drivers.find((d) => d.id === item.driverId);
			if (!driver) {
				throw validationError(`${path("driverId")} does not reference an existing driver`, path("driverId"));
			}
			// Only block a NEW assignment to a suspended driver - a shipment
			// that already had this driverId before this save (e.g. it was
			// delivered, then the driver was later suspended for an
			// unrelated reason) must stay exactly as it is; re-validating an
			// unrelated field on every save would let a driver's later
			// suspension silently retro-invalidate their entire delivery
			// history.
			const currentItem = context.currentById?.get(String(item.id));
			const isNewAssignment = !currentItem || currentItem.driverId !== item.driverId;
			if (isNewAssignment && driver.accountStatus === "Suspended") {
				throw validationError(`${path("driverId")} refers to a suspended driver and cannot be assigned`, path("driverId"));
			}

			// A driver who switched themselves Offline cannot be given new
			// work. Uses the driver's status as stored in MongoDB right now,
			// so it also catches a dispatcher whose screen is out of date.
			// 409 tells the frontend to reload fresh data (StoreContext.js).
			if (isNewAssignment && driver.status === "Offline") {
				const error = validationError(`${driver.name || item.driverId} is offline and cannot be assigned. Please choose an available driver.`, path("driverId"));
				error.statusCode = 409;
				throw error;
			}
		}
	}

	if (item.createdAt !== undefined && item.createdAt !== null && Number.isNaN(Date.parse(item.createdAt))) {
		throw validationError(`${path("createdAt")} must be a valid date`, path("createdAt"));
	}

	if (item.history !== undefined && !Array.isArray(item.history)) {
		throw validationError(`${path("history")} must be an array`, path("history"));
	}
}

/** Validates the whole shipments array about to be persisted. Throws on the
 * first invalid record (with its index/field named) - the caller is
 * expected to reject the entire request before anything is saved.
 *
 * Also enforces list-wide tracking-number uniqueness: `items` here is
 * always the FULL final shipments list about to be written (for a scoped
 * role, roleScope.reconcileScopedWrite() has already merged their edits
 * back into everyone else's untouched records before this runs), so a
 * simple case-insensitive scan across the whole array reliably catches a
 * new/edited shipment colliding with ANY existing tracking number, not just
 * ones the same requester can see. */
function validateShipmentsList(items, context = {}) {
	if (!Array.isArray(items)) {
		throw validationError("shipments must be an array", "shipments");
	}
	items.forEach((item, index) => validateShipmentRecord(item, index, context));

	const seen = new Map();
	items.forEach((item, index) => {
		const key = String(item.trackingNumber || "").trim().toLowerCase();
		if (!key) return;
		if (seen.has(key)) {
			throw validationError(
				`shipments[${index}].trackingNumber "${item.trackingNumber}" is already used by another shipment (duplicate of shipments[${seen.get(key)}])`,
				`shipments[${index}].trackingNumber`
			);
		}
		seen.set(key, index);
	});
}

module.exports = { validateShipmentsList, SERVICE_TYPES, STATUSES };
