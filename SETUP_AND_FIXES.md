# How to run this project (and what was fixed)

## Why nothing was saving to MongoDB

The backend was fine. The **frontend was never talking to it.**

Three separate problems:

1. **There was no login endpoint.** `backend/routes/authRoutes.js` had `/register`
   and user CRUD, but no `POST /api/auth/login` at all. Even if the frontend had
   called it, there was nothing there to answer.

2. **Login was checked inside the browser.** `frontend/src/config/authAccounts.js`
   read the passwords from `frontend/.env` (`VITE_ADMIN_PASSWORD=Admin@123`) and
   `LoginPage.jsx` compared what you typed against that value. The request never
   left the browser, so of course nothing reached the database.

3. **All the app data lived in `localStorage`.** `frontend/src/context/StoreContext.js`
   held every shipment, driver, invoice and user, and saved it under the browser key
   `cms_demo_store_v2`. 57 pages read from it. The files in `frontend/src/api/` were
   written but only one of them was ever imported.

Two smaller issues that would have broken things anyway:

4. `MONGO_URI` had **no database name** (`...mongodb.net/?appName=...`), so
   everything would have landed in a database called `test`.
5. The axios client pointed at `/api/v1` but the backend serves `/api`.

---

## Run it

You need Node.js 18+ and internet access for MongoDB Atlas.

### 1. Backend

```bash
cd backend
npm install
npm run seed     # creates the login accounts in MongoDB (run once)
npm run dev      # starts on http://localhost:5000
```

You should see `MongoDB connected successfully` and `Server running on port 5000`.

### 2. Frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Main portal `http://localhost:5173`, driver portal `:5174`, customer portal `:5175`.

> Start the backend first. If the frontend cannot reach it you will see a red
> "Not connected to the database" box in the bottom-left corner.

### 3. Sign in

| Portal | Email | Password |
|---|---|---|
| Admin | admin@egotechworld.com | Admin@123 |
| Finance | finance@egotechworld.com | Finance@123 |
| Dispatcher | dispatcher@egotechworld.com | Dispatch@123 |
| Merchant | merchant@egotechworld.com | Merchant@123 |
| Driver (:5174) | driver@egotechworld.com | Driver@123 |
| Customer (:5175) | customer@egotechworld.com | Customer@123 |

These now live in the `users` collection in MongoDB. The password is stored as a
bcrypt hash, never as plain text.

---

## Check that data is really in MongoDB

Open MongoDB Compass (or Atlas) and look at the **`courier_management_system`**
database. You will see:

- `users` — login accounts (with `password` as a bcrypt hash)
- `cms_shipments`, `cms_drivers`, `cms_branches`, `cms_vehicles`, `cms_invoices`,
  `cms_payments`, `cms_staff_users`, `cms_audit_logs`, and the rest

Try this: create a shipment in the app, then refresh the `cms_shipments` collection
in Compass — the new document is there. Or hit
<http://localhost:5000/api/app-data/meta/collections> in your browser to see a
document count per collection.

---

## What changed

### Backend

| File | Change |
|---|---|
| `controllers/authController.js` | **Rewritten.** Real `login` (bcrypt + JWT), `register`, `me`, `logout`, `forgot-password`, `reset-password`, `change-password`. |
| `routes/authRoutes.js` | Added `POST /login`, `GET /me`, `POST /logout`, `/forgot-password`, `/reset-password`, `/change-password`. |
| `models/User.js` | Added `branchName`, `driverId`, `merchantName`, `resetToken`, `resetTokenExpires`. |
| `models/appData.js` | **New.** One MongoDB collection per frontend list. |
| `controllers/appDataController.js` | **New.** Reads and writes those collections. |
| `routes/appDataRoutes.js` | **New.** `GET/PUT /api/app-data`. |
| `routes/index.js` | Mounts `/app-data`. |
| `app.js` | CORS now allows ports 5173/5174/5175; request body limit raised to 25 MB (signature and photo captures). |
| `.env` | `MONGO_URI` now names the database: `/courier_management_system`. |
| `scripts/seedUsers.js` | **New.** `npm run seed` creates every login account. |

### Frontend

| File | Change |
|---|---|
| `src/context/StoreContext.js` | **Rewritten storage layer.** Loads from `GET /api/app-data` on startup and saves every change back with `PUT /api/app-data` (batched, 700 ms). The public API is unchanged, so all 57 pages work without edits. |
| `src/context/AuthContext.js` | Stores the real JWT from the server and re-checks it with `/auth/me` on reload. The customer-portal auto-login was removed — a real sign-in is required now. |
| `src/pages/auth/LoginPage.jsx` | Calls `POST /api/auth/login`. Lockout after 5 failed attempts and the 2FA step still work. |
| `src/pages/auth/ForgotPasswordPage.jsx`<br>`src/pages/auth/ResetPasswordPage.jsx` | Use the backend reset-token endpoints. |
| `src/pages/admin/UsersPage.jsx` | Added a password field. Creating a user now creates a real login account in MongoDB. |
| `src/pages/admin/DriversPage.jsx` | Creating a driver now creates their driver-portal login in MongoDB. |
| `src/api/axiosInstance.js` | Correct base URL (`/api`), sends the JWT, clearer network errors. |
| `src/api/appDataApi.js` | **New.** Client for the store API. |
| `src/utils/session.js` | **New.** Shared per-role session keys (used by both the auth context and axios). |
| `src/config/authAccounts.js` | Passwords removed — emails only, for pre-filling the form. |
| `frontend/.env` | Passwords removed. |
| `vite.config.js` | `/api` is proxied to `localhost:5000`, so there is no CORS problem in development. |

---

## Things to know

**Offline mode.** If the backend is down the app still runs from a local copy and
shows a red warning box. Those changes are pushed to MongoDB as soon as the
connection returns. If you see that box, your data is *not* in the database yet —
start the backend and click "Retry connection".

**`/api/app-data` is not password-protected.** The React store loads before you
sign in (the public tracking page needs shipment data). Before deploying this
anywhere real, add the `authenticate` middleware in `backend/routes/appDataRoutes.js`.

**Your database password is in `backend/.env`,** which is inside this zip. Rotate it
in MongoDB Atlas before sharing this project with anyone, and keep `.env` out of Git.

**No email or SMS provider is connected.** Password reset shows the link directly
instead of emailing it, and the 2FA code is displayed on screen. Both are labelled
as demo behaviour in the UI.

**First run seeds itself.** If the app-data collections are empty, the frontend
writes the starter data (branches, shipments, drivers…) into MongoDB once. After
that, MongoDB is the source of truth. "Reset demo data" in the UI rewrites it.
