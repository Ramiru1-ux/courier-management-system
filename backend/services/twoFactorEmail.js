const env = require("../config/env");
const emailService = require("./emailService");

/** SMTP can only be used when all three of these are set in backend/.env. */
const isEmailConfigured = () => Boolean(env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASS);

const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

/**
 * Emails a sign-in verification code to the account's own email address.
 *
 * - SMTP configured: the code is emailed. If the provider rejects it (wrong
 *   app password, bad address...) this throws, and the sign-in is refused.
 * - SMTP NOT configured yet, outside production: the code is printed in the
 *   BACKEND terminal only, so the team can still sign in while setting up the
 *   mailbox. It is never sent to the browser.
 * - SMTP NOT configured in production: this throws and the sign-in is refused.
 */
async function sendTwoFactorCodeEmail({ name, email, code, expiresInMinutes }) {
	if (!isEmailConfigured()) {
		if (env.NODE_ENV !== "production") {
			console.warn(
				`\n[2FA] Email is not configured (EMAIL_USER / EMAIL_PASS in backend/.env), so the code was NOT emailed.\n` +
				`[2FA] Development only - verification code for ${email}: ${code} (valid ${expiresInMinutes} min)\n`
			);
			return;
		}
		throw new Error("Email is not configured - set EMAIL_HOST, EMAIL_USER and EMAIL_PASS in backend/.env");
	}

	const safeName = escapeHtml(name || "there");
	const subject = `${code} is your EgoTECHWORLD verification code`;
	const text = [
		`Hi ${name || "there"},`,
		"",
		`Your EgoTECHWORLD Courier CMS verification code is: ${code}`,
		"",
		`This code expires in ${expiresInMinutes} minutes and can be used only once.`,
		"If you did not try to sign in, please change your password and tell your administrator.",
		"",
		"EGOTECHWORLD (PVT) LTD",
		"https://www.egotechworld.com/",
	].join("\n");

	const html = `
		<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#12213F">
			<h2 style="margin:0 0 4px;font-size:18px">EgoTECHWORLD Courier CMS</h2>
			<p style="margin:0 0 20px;color:#697086;font-size:13px">Sign-in verification</p>
			<p style="font-size:14px">Hi ${safeName}, use this code to finish signing in:</p>
			<div style="margin:18px 0;padding:14px 18px;background:#FCF3E2;border:1px solid #F5A524;border-radius:10px;font-size:28px;font-weight:700;letter-spacing:.18em;text-align:center">${code}</div>
			<p style="font-size:13px;color:#697086">This code expires in ${expiresInMinutes} minutes and can be used only once.
				If you did not try to sign in, change your password and tell your administrator.</p>
			<p style="font-size:12px;color:#9AA1B4;margin-top:22px">&copy; EGOTECHWORLD (PVT) LTD, Sri Lanka &middot; <a href="https://www.egotechworld.com/" style="color:#D9860F">egotechworld.com</a></p>
		</div>`;

	await emailService.send({ to: email, subject, text, html });
}

module.exports = { sendTwoFactorCodeEmail, isEmailConfigured };
