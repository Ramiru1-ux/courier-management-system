// Display metadata for the sign-in screen only - the labels shown in the
// "Sign in as" dropdown.
//
// Passwords USED to live here (read from VITE_* env vars) which meant login
// was checked inside the browser and nothing ever reached the database.
// Credentials are now verified by the backend against the MongoDB `users`
// collection - see backend/controllers/authController.js.
//
// Each portal's account email used to be here too, purely to pre-fill the
// sign-in form. That is gone: the form now starts empty, so the page no
// longer displays a real sign-in address to whoever opens it, and no email
// belongs in this file any more.

const AUTH_ACCOUNTS = {
  admin: { id: 'admin', name: 'Administrator', roleLabel: 'Admin portal' },
  finance: { id: 'finance', name: 'Finance Officer', roleLabel: 'Finance portal' },
  dispatcher: { id: 'dispatcher', name: 'Dispatcher', roleLabel: 'Dispatcher portal' },
  driver: { id: 'driver', name: 'Driver', roleLabel: 'Driver portal' },
  merchant: { id: 'merchant', name: 'Merchant', roleLabel: 'Merchant portal' },
  customer: { id: 'customer', name: 'Customer', roleLabel: 'Customer portal' },
};

export default AUTH_ACCOUNTS;
