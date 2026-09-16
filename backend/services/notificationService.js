const Notification = require("../models/Notification");
const { sendEmail } = require("./emailService");
const createNotification = (data) => Notification.create(data);
const notify = async ({ channel = "in_app", ...data }) => { if (channel === "email") return sendEmail({ to: data.to, subject: data.title, text: data.message }); if (channel === "in_app") return createNotification(data); return { queued: true, channel, data }; };
module.exports = { createNotification, notify, sendNotification: notify };
