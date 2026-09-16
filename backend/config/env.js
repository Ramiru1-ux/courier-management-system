const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const toNumber = (value, defaultValue) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : defaultValue;
};

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: toNumber(process.env.PORT, 5000),

  MONGO_URI:
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/courier_management_system",

  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_here",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: toNumber(process.env.EMAIL_PORT, 587),
  EMAIL_SECURE: toBoolean(process.env.EMAIL_SECURE, false),
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",

  PAYMENT_PROVIDER: (process.env.PAYMENT_PROVIDER || "stripe").toLowerCase(),
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  SSLCOMMERZ_STORE_ID: process.env.SSLCOMMERZ_STORE_ID || "",
  SSLCOMMERZ_STORE_PASSWORD: process.env.SSLCOMMERZ_STORE_PASSWORD || "",
  SSLCOMMERZ_SANDBOX: toBoolean(process.env.SSLCOMMERZ_SANDBOX, true),
  SSLCOMMERZ_SUCCESS_URL:
    process.env.SSLCOMMERZ_SUCCESS_URL || "http://localhost:5000/payment/success",
  SSLCOMMERZ_FAIL_URL:
    process.env.SSLCOMMERZ_FAIL_URL || "http://localhost:5000/payment/failure",
  SSLCOMMERZ_CANCEL_URL:
    process.env.SSLCOMMERZ_CANCEL_URL || "http://localhost:5000/payment/cancel",
  SSLCOMMERZ_API_URL:
    process.env.SSLCOMMERZ_API_URL || "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
  FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY || "",
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY || "",
  FLUTTERWAVE_ENCRYPTION_KEY: process.env.FLUTTERWAVE_ENCRYPTION_KEY || "",
  FLUTTERWAVE_BASE_URL: process.env.FLUTTERWAVE_BASE_URL || "https://api.flutterwave.com/v3",

  SMS_PROVIDER: (process.env.SMS_PROVIDER || "twilio").toLowerCase(),
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "",
  MSG91_API_KEY: process.env.MSG91_API_KEY || "",
  MSG91_SENDER_ID: process.env.MSG91_SENDER_ID || "",
  MSG91_BASE_URL: process.env.MSG91_BASE_URL || "https://api.msg91.com/api/v5",
  TEXTLOCAL_API_KEY: process.env.TEXTLOCAL_API_KEY || "",
  TEXTLOCAL_SENDER: process.env.TEXTLOCAL_SENDER || "",
  TEXTLOCAL_BASE_URL: process.env.TEXTLOCAL_BASE_URL || "https://api.textlocal.in/send/",

  WHATSAPP_PROVIDER: (process.env.WHATSAPP_PROVIDER || "twilio").toLowerCase(),
  TWILIO_WHATSAPP_SID: process.env.TWILIO_WHATSAPP_SID || "",
  TWILIO_WHATSAPP_TOKEN: process.env.TWILIO_WHATSAPP_TOKEN || "",
  TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || "",
  META_WHATSAPP_TOKEN: process.env.META_WHATSAPP_TOKEN || "",
  META_WHATSAPP_PHONE_NUMBER_ID: process.env.META_WHATSAPP_PHONE_NUMBER_ID || "",
  META_WHATSAPP_VERSION: process.env.META_WHATSAPP_VERSION || "v17.0",
  META_WHATSAPP_BASE_URL: process.env.META_WHATSAPP_BASE_URL || "https://graph.facebook.com",

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};

module.exports = env;