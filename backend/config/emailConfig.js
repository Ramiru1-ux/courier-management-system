const nodemailer = require("nodemailer");
const env = require("./env");

const emailConfig = {
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"Courier Management System" <${env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email send error:", error.message);
    throw error;
  }
};

module.exports = {
  transporter,
  sendEmail,
};