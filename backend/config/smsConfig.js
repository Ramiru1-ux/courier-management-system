const axios = require("axios");
const env = require("./env");

const smsConfig = {
  provider: env.SMS_PROVIDER,

  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    phoneNumber: env.TWILIO_PHONE_NUMBER,
  },

  msg91: {
    apiKey: env.MSG91_API_KEY,
    senderId: env.MSG91_SENDER_ID,
    baseUrl: env.MSG91_BASE_URL,
  },

  textlocal: {
    apiKey: env.TEXTLOCAL_API_KEY,
    sender: env.TEXTLOCAL_SENDER,
    baseUrl: env.TEXTLOCAL_BASE_URL,
  },
};

const sendSms = async ({ to, message, provider = smsConfig.provider }) => {
  if (!to || !message) {
    throw new Error("SMS recipient and message are required");
  }

  if (provider === "twilio") {
    const twilio = require("twilio");
    const client = twilio(
      smsConfig.twilio.accountSid,
      smsConfig.twilio.authToken
    );

    return client.messages.create({
      body: message,
      from: smsConfig.twilio.phoneNumber,
      to,
    });
  }

  if (provider === "msg91") {
    const url = `${smsConfig.msg91.baseUrl}/send.php`;
    const response = await axios.get(url, {
      params: {
        au: smsConfig.msg91.apiKey,
        sender: smsConfig.msg91.senderId,
        route: "4",
        country: "88",
        message,
        mobiles: to,
      },
    });

    return response.data;
  }

  if (provider === "textlocal") {
    const response = await axios.post(
      smsConfig.textlocal.baseUrl,
      {
        apikey: smsConfig.textlocal.apiKey,
        sender: smsConfig.textlocal.sender,
        numbers: to,
        message,
      }
    );

    return response.data;
  }

  throw new Error("SMS provider not configured");
};

module.exports = {
  smsConfig,
  sendSms,
};