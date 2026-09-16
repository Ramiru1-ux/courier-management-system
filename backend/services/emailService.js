const { sendEmail, transporter } = require("../config/emailConfig");

const send = (options) => sendEmail(options);
const verifyEmailConnection = () => transporter.verify();

module.exports = { send, sendEmail: sendEmail, verifyEmailConnection, transporter };
