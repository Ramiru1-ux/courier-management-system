const { sendSms } = require("../config/smsConfig");
const send = (options) => sendSms(options);
module.exports = { send, sendSms, sendShipmentUpdate: ({ to, trackingNumber, status }) => send({ to, message: `Shipment ${trackingNumber} status: ${status}` }) };
