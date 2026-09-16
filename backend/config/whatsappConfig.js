const axios = require("axios");
const env = require("./env");

const whatsappConfig = {
  provider: env.WHATSAPP_PROVIDER,

  twilio: {
    accountSid: env.TWILIO_WHATSAPP_SID,
    authToken: env.TWILIO_WHATSAPP_TOKEN,
    phoneNumber: env.TWILIO_WHATSAPP_NUMBER,
  },

  meta: {
    accessToken: env.META_WHATSAPP_TOKEN,
    phoneNumberId: env.META_WHATSAPP_PHONE_NUMBER_ID,
    version: env.META_WHATSAPP_VERSION,
    baseUrl: env.META_WHATSAPP_BASE_URL,
  },
};

const sendWhatsAppMessage = async ({ to, message, provider = whatsappConfig.provider }) => {
  if (!to || !message) {
    throw new Error("WhatsApp recipient and message are required");
  }

  if (provider === "twilio") {
    const twilio = require("twilio");
    const client = twilio(
      whatsappConfig.twilio.accountSid,
      whatsappConfig.twilio.authToken
    );

    return client.messages.create({
      body: message,
      from: `whatsapp:${whatsappConfig.twilio.phoneNumber}`,
      to: `whatsapp:${to}`,
    });
  }

  if (provider === "meta") {
    const url = `${whatsappConfig.meta.baseUrl}/${whatsappConfig.meta.version}/${whatsappConfig.meta.phoneNumberId}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${whatsappConfig.meta.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }

  throw new Error("WhatsApp provider not configured");
};

module.exports = {
  whatsappConfig,
  sendWhatsAppMessage,
};