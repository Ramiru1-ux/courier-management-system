const env = require("./env");

const paymentGatewayConfig = {
  provider: env.PAYMENT_PROVIDER,

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },

  sslcommerz: {
    storeId: env.SSLCOMMERZ_STORE_ID,
    storePassword: env.SSLCOMMERZ_STORE_PASSWORD,
    isSandbox: env.SSLCOMMERZ_SANDBOX,
    successUrl: env.SSLCOMMERZ_SUCCESS_URL,
    failUrl: env.SSLCOMMERZ_FAIL_URL,
    cancelUrl: env.SSLCOMMERZ_CANCEL_URL,
    apiUrl: env.SSLCOMMERZ_API_URL,
  },

  flutterwave: {
    publicKey: env.FLUTTERWAVE_PUBLIC_KEY,
    secretKey: env.FLUTTERWAVE_SECRET_KEY,
    encryptionKey: env.FLUTTERWAVE_ENCRYPTION_KEY,
    baseUrl: env.FLUTTERWAVE_BASE_URL,
  },
};

module.exports = paymentGatewayConfig;