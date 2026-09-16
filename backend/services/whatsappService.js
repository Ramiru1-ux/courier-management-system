const { sendWhatsAppMessage } = require("../config/whatsappConfig");

const send = (options) => sendWhatsAppMessage(options);
const sendShipmentUpdate = ({ to, trackingNumber, status }) => send({ to, message: `Shipment ${trackingNumber} status: ${status}` });

module.exports = { send, sendWhatsAppMessage: sendWhatsAppMessage, sendShipmentUpdate };
