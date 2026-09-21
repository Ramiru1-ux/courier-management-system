const { getAppModel, stripInternals } = require("../models/appData");
const { validationError, required, optionalString, number } = require("../validators/validatorHelpers");

/**
 * Everything here reads the authoritative cms_* collections through
 * models/appData.js.
 *
 * This file used to ALSO require models/Shipment.js and expose generic CRUD
 * handlers built on it. That model writes to a separate `shipments`
 * collection - a second home for the entity the whole application already
 * keeps in cms_shipments - and simply requiring it made Mongoose create that
 * duplicate collection on every server start. The handlers it backed
 * (trackShipment, getTracking, getShipmentTracking) were not reachable from
 * the frontend: the public tracking page only calls
 * GET /tracking/:trackingNumber, plus the complaint and review endpoints
 * below, all of which use cms_* data. The import and those handlers are
 * therefore gone, leaving one source of truth for a shipment.
 */

/** Finds the real, authoritative shipment doc for a tracking number, or
 * null. Shared by every public (unauthenticated) endpoint below so they all
 * agree on exactly one lookup rule - case-insensitive exact match against
 * cms_shipments.trackingNumber, the same field the merchant/admin/dispatcher
 * apps show as "the" tracking number (StoreContext.js nextTrackingNumber(),
 * CreateShipmentPage.jsx). Never matches against MongoDB _id or the
 * internal shipment `id` (SH-xxxx) - those are not customer-facing values. */
async function findPublicShipment(trackingNumber) {
	const raw = String(trackingNumber || "").trim();
	if (!raw) return null;
	const ShipmentModel = getAppModel("shipments");
	const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const doc = await ShipmentModel.findOne({ trackingNumber: { $regex: `^${escaped}$`, $options: "i" } }).lean();
	return doc ? stripInternals(doc) : null;
}

/**
 * GET /api/tracking/:trackingNumber - public shipment tracking.
 *
 * This is the ONLY endpoint the public "/track" page and the customer
 * portal's tracking page are allowed to call before/without a full
 * authenticated session - it deliberately does not go anywhere near
 * GET /api/app-data (which now requires a signed-in account, see
 * appDataRoutes.js). It reads directly from the authoritative cms_shipments
 * collection (the same one the app's real data lives in - see
 * models/appData.js) and returns only the handful of fields a public
 * tracking page needs, never sender/recipient contact details, COD amount,
 * branch, or any other shipment/customer field, and never anything from
 * any other collection except a driver's FIRST NAME ONLY (never phone,
 * email, vehicle, id, or any other driver field) when one is assigned -
 * enough for "your delivery rider is John" without exposing anything a
 * public, unauthenticated caller should not see.
 */
const getTrackingByNumber = async (req, res) => {
	try {
		const shipment = await findPublicShipment(req.params.trackingNumber);
		if (!shipment) {
			return res.status(404).json({ success: false, message: "No shipment found for that tracking number" });
		}

		let driverFirstName = null;
		if (shipment.driverId) {
			const DriverModel = getAppModel("drivers");
			const driver = await DriverModel.findOne({ id: shipment.driverId }).lean();
			if (driver?.name) driverFirstName = String(driver.name).trim().split(/\s+/)[0];
		}

		return res.status(200).json({
			success: true,
			data: {
				trackingNumber: shipment.trackingNumber,
				status: shipment.status,
				recipientName: shipment.recipientName || "",
				recipientCity: shipment.recipientCity || "",
				serviceType: shipment.serviceType || "",
				driverFirstName,
				history: Array.isArray(shipment.history) ? shipment.history.map((event) => ({ label: event.label, time: event.time })) : [],
			},
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: error?.message || "Tracking lookup failed" });
	}
};

/** New documents inserted directly (not through the blob's saveList()
 * full-array-replace) need an __order that sorts them predictably without
 * touching every existing row. Both the complaints and ratings lists are
 * always rendered newest-first (StoreContext.js prepends: `[entry,
 * ...current.list]`), so a new row needs the SMALLEST __order in the
 * collection - one less than the current minimum guarantees that
 * regardless of how many rows already exist, without a second write. */
async function nextOrderBefore(Model) {
	const [first] = await Model.find({}).sort({ __order: 1 }).limit(1).lean();
	return (typeof first?.__order === "number" ? first.__order : 0) - 1;
}

/**
 * POST /api/tracking/:trackingNumber/complaint - lets the person tracking a
 * shipment file a complaint about it WITHOUT an account, exactly like the
 * lookup above. Writes a real row into cms_complaints (the same collection
 * and shape admin/SupportPage.jsx and customer/ComplaintsPage.jsx already
 * read - see StoreContext.js's `complaints` seed/addComplaint()), tagged
 * `source: "public_portal"` so it's clearly traceable to an unauthenticated
 * submission versus one filed by a logged-in staff/customer account.
 */
const submitComplaint = async (req, res) => {
	try {
		const shipment = await findPublicShipment(req.params.trackingNumber);
		if (!shipment) {
			return res.status(404).json({ success: false, message: "No shipment found for that tracking number" });
		}

		const name = optionalString(required(req.body?.name, "name"), "name", 120);
		const email = optionalString(required(req.body?.email, "email"), "email", 160);
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			throw validationError("email must be a valid email address", "email");
		}
		const category = optionalString(required(req.body?.category, "category"), "category", 80);
		const description = optionalString(required(req.body?.description, "description"), "description", 2000);

		const Model = getAppModel("complaints");
		const order = await nextOrderBefore(Model);
		const doc = {
			id: `CMP-PUB-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
			reference: shipment.trackingNumber,
			customer: name,
			email,
			category,
			description,
			status: "OPEN",
			source: "public_portal",
			createdAt: new Date().toISOString(),
			__order: order,
		};
		await Model.create(doc);

		return res.status(201).json({ success: true, message: "Complaint submitted", data: stripInternals(doc) });
	} catch (error) {
		if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message, field: error.field });
		return res.status(500).json({ success: false, message: "Failed to submit complaint" });
	}
};

/**
 * POST /api/tracking/:trackingNumber/review - lets the recipient rate the
 * driver and delivery experience once (and only once) the shipment is
 * DELIVERED, without an account. Reuses the EXISTING cms_ratings collection
 * (see StoreContext.js addRating(), admin/SupportPage.jsx's per-driver
 * average) rather than a new one - `stars` keeps its original meaning
 * (rider/staff rating) so every existing reader of this collection keeps
 * working unchanged; `deliveryRating`, `customerName`, `customerEmail` and
 * `trackingNumber` are additive fields new readers can use.
 *
 * The DELIVERED check happens here, server-side - a customer cannot submit
 * a review for a shipment that has not actually reached that status by
 * calling this endpoint directly, no matter what the frontend UI allows.
 */
const submitReview = async (req, res) => {
	try {
		const shipment = await findPublicShipment(req.params.trackingNumber);
		if (!shipment) {
			return res.status(404).json({ success: false, message: "No shipment found for that tracking number" });
		}
		if (shipment.status !== "DELIVERED") {
			return res.status(409).json({ success: false, message: "A review can only be submitted once this shipment has been delivered" });
		}

		const name = optionalString(required(req.body?.name, "name"), "name", 120);
		const email = optionalString(required(req.body?.email, "email"), "email", 160);
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			throw validationError("email must be a valid email address", "email");
		}
		const riderRating = number(req.body?.riderRating, "riderRating", { min: 1, max: 5, integer: true });
		const deliveryRating = number(req.body?.deliveryRating, "deliveryRating", { min: 1, max: 5, integer: true });
		const comment = optionalString(req.body?.comment, "comment", 2000) || "";

		const Model = getAppModel("ratings");
		const order = await nextOrderBefore(Model);
		const doc = {
			id: `RTG-PUB-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
			shipmentId: shipment.id,
			trackingNumber: shipment.trackingNumber,
			driverId: shipment.driverId || null,
			stars: riderRating,
			deliveryRating,
			customerName: name,
			customerEmail: email,
			comment,
			source: "public_portal",
			createdAt: new Date().toISOString(),
			__order: order,
		};
		await Model.create(doc);

		return res.status(201).json({ success: true, message: "Review submitted", data: stripInternals(doc) });
	} catch (error) {
		if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message, field: error.field });
		return res.status(500).json({ success: false, message: "Failed to submit review" });
	}
};

module.exports = {
	getTrackingByNumber,
	submitComplaint,
	submitReview,
};
