/**
 * Wires the notificationsOutbox blob (cms_notifications_outbox - the real,
 * persisted, event-triggered log created in StoreContext.js pushNotification())
 * to the ALREADY-BUILT, ALREADY-REAL provider integrations that existed in
 * this codebase but were only ever reachable from the dead legacy REST
 * module tree: services/smsService.js (Twilio/MSG91/TextLocal, via
 * config/smsConfig.js), services/emailService.js (real SMTP via nodemailer,
 * config/emailConfig.js), services/whatsappService.js (Twilio/Meta Business
 * API, config/whatsappConfig.js). All three make genuine outbound network
 * calls with real SDKs/HTTP requests - nothing here is reimplemented or
 * simulated.
 *
 * Every credential is read from process.env (via config/env.js) and never
 * hardcoded. In THIS environment none of those variables are populated, so
 * every dispatch attempt below will genuinely and correctly report
 * "not_configured" - that is the honest, expected result without a real
 * provider account, not a bug to work around.
 */
const env = require("../config/env");
const smsService = require("./smsService");
const emailService = require("./emailService");
const whatsappService = require("./whatsappService");

const REQUIRED_ENV_VARS = {
	SMS: {
		twilio: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
		msg91: ["MSG91_API_KEY", "MSG91_SENDER_ID"],
		textlocal: ["TEXTLOCAL_API_KEY", "TEXTLOCAL_SENDER"],
	},
	Email: { smtp: ["EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS"] },
	WhatsApp: {
		twilio: ["TWILIO_WHATSAPP_SID", "TWILIO_WHATSAPP_TOKEN", "TWILIO_WHATSAPP_NUMBER"],
		meta: ["META_WHATSAPP_TOKEN", "META_WHATSAPP_PHONE_NUMBER_ID"],
	},
};

/** Which env vars would need to be set for this channel to actually deliver
 * - used both to decide whether to attempt a send and to tell an admin
 * exactly what is missing, without ever printing a secret's value. */
function requiredEnvVarsFor(channel) {
	if (channel === "SMS") return REQUIRED_ENV_VARS.SMS[env.SMS_PROVIDER] || Object.values(REQUIRED_ENV_VARS.SMS).flat();
	if (channel === "Email") return REQUIRED_ENV_VARS.Email.smtp;
	if (channel === "WhatsApp") return REQUIRED_ENV_VARS.WhatsApp[env.WHATSAPP_PROVIDER] || Object.values(REQUIRED_ENV_VARS.WhatsApp).flat();
	return [];
}

function isChannelConfigured(channel) {
	return requiredEnvVarsFor(channel).every((key) => Boolean(env[key]));
}

/** Attempts a REAL external delivery for one outbox entry. Never throws -
 * every outcome (not configured, provider rejected it, provider succeeded)
 * is returned as data so the caller can persist it as-is. */
async function dispatchExternalNotification({ channel, to, body }) {
	if (!isChannelConfigured(channel)) {
		return { delivered: false, attempted: false, reason: "not_configured", missingEnvVars: requiredEnvVarsFor(channel) };
	}
	try {
		if (channel === "SMS") {
			await smsService.send({ to, message: body });
			return { delivered: true, attempted: true };
		}
		if (channel === "Email") {
			await emailService.send({ to, subject: "Courier Management System notification", text: body });
			return { delivered: true, attempted: true };
		}
		if (channel === "WhatsApp") {
			await whatsappService.send({ to, message: body });
			return { delivered: true, attempted: true };
		}
		return { delivered: false, attempted: false, reason: `unsupported_channel:${channel}` };
	} catch (error) {
		// A real provider (misconfigured credentials, invalid recipient,
		// network failure) rejected or failed the send - report it as a
		// failed attempt, never as a silent success.
		return { delivered: false, attempted: true, reason: error?.message || "provider_error" };
	}
}

module.exports = { dispatchExternalNotification, isChannelConfigured, requiredEnvVarsFor };
