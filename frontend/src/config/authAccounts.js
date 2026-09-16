// Display metadata for the sign-in screen only.
//
// Passwords USED to live here (read from VITE_* env vars) which meant login
// was checked inside the browser and nothing ever reached the database.
// Credentials are now verified by the backend against the MongoDB `users`
// collection - see backend/controllers/authController.js. The emails below
// are only used to pre-fill the form.
const env = import.meta.env;

const AUTH_ACCOUNTS = {
  admin: { id: 'admin', name: 'Administrator', roleLabel: 'Admin portal', email: env.VITE_ADMIN_EMAIL || 'admin@egotechworld.com' },
  finance: { id: 'finance', name: 'Finance Officer', roleLabel: 'Finance portal', email: env.VITE_FINANCE_EMAIL || 'finance@egotechworld.com' },
  dispatcher: { id: 'dispatcher', name: 'Dispatcher', roleLabel: 'Dispatcher portal', email: env.VITE_DISPATCHER_EMAIL || 'dispatcher@egotechworld.com' },
  driver: { id: 'driver', name: 'Driver', roleLabel: 'Driver portal', email: env.VITE_DRIVER_EMAIL || 'driver@egotechworld.com' },
  merchant: { id: 'merchant', name: 'Merchant', roleLabel: 'Merchant portal', email: env.VITE_MERCHANT_EMAIL || 'merchant@egotechworld.com' },
  customer: { id: 'customer', name: 'Customer', roleLabel: 'Customer portal', email: env.VITE_CUSTOMER_EMAIL || 'customer@egotechworld.com' },
};

export default AUTH_ACCOUNTS;
