# Courier Management System (MERN Stack)

This is an empty, ready-to-fill folder/file scaffold generated to 100% match the
features, roles, workflows, and modules described in the
"Courier Management System — Professional Project Proposal & Real-World Requirements
Specification" document prepared for EgoTECHWORLD.

No implementation code has been added — every file is intentionally empty so you (or
an AI assistant) can fill them in one module at a time.

## Structure

- `backend/` — Node.js + Express + MongoDB (Mongoose) API
  - `config/` → DB connection, env, 3rd-party service configs (SMS, email, WhatsApp,
    payment gateway, maps, file upload, sockets)
  - `models/` → One Mongoose model per entity from the spec's Database Design section
    (User, Role, Permission, Organization, Branch, Hub, Customer, Merchant, Address,
    Shipment, Package, ShipmentEvent, Pickup, Manifest, Driver, Vehicle, Route,
    Delivery, ProofOfDelivery, Payment, Invoice, COD/Settlement, Notification,
    SupportTicket, Complaint, Rating, AuditLog, ApiKey, Webhook, SystemSetting,
    Subscription, etc.)
  - `controllers/` → Business logic per module, mirrored 1:1 with `routes/`
  - `routes/` → REST endpoints, mirrored 1:1 with `controllers/` (matches the
    `/api/v1/...` structure in the spec)
  - `middleware/` → Auth, RBAC/permissions, organization & branch scoping (multi-tenant
    isolation), error handling, rate limiting, audit logging, uploads, API key auth
  - `services/` → Cross-cutting logic that isn't a simple CRUD controller: tracking
    number generation, barcode/QR, pricing engine, serviceability checks, shipment
    status engine, route optimization, GPS tracking, notifications (SMS/email/
    WhatsApp), payments, COD reconciliation, merchant settlement, invoice/PDF
    generation, webhook dispatch, exports, and placeholders for future AI features
    (fraud detection, demand forecasting, delay prediction)
  - `sockets/` → Real-time GPS, tracking, and notification events (Socket.IO)
  - `jobs/` → Scheduled/cron tasks (retry failed deliveries, maintenance reminders,
    subscription expiry, daily settlement)
  - `validators/` → Request validation schemas per module
  - `utils/` → Shared helpers (tokens, hashing, response formatting, logging, dates)
  - `uploads/`, `tests/` → Local file storage and test suites

- `frontend/` — React (matches your preferred structure: `api/`, `context/`,
  `components/`, `pages/`)
  - `api/` → One file per backend module, all Axios calls live here
  - `context/` → Auth, Organization, Branch, Permission, Notification, Socket, Theme
  - `components/` → Reusable UI pieces grouped by domain (shipment, pickup, manifest,
    tracking, driver, vehicle, route, delivery, POD, COD, pricing, notifications,
    support, reports, dashboard, admin) plus `common/`, `layout/`, `auth/`
  - `pages/` → One folder per portal/role from the spec: `admin/`, `operations/`,
    `branch/`, `counter/`, `dispatcher/`, `driver/`, `merchant/`, `customer/`,
    `public/` (tracking page, home), `finance/`, `support/`, `reports/`, `settings/`
  - `hooks/`, `routes/`, `utils/`, `assets/` → Supporting React infrastructure

## Notes

- This scaffold intentionally leaves every file empty — add implementation
  module-by-module (e.g., start with `auth` + `shipment`, matching the MVP Phase 1
  scope in the proposal).
- The Driver Mobile Application (React Native/Flutter) and multi-tenant SaaS billing
  layer are represented here structurally (models/services/pages exist) but a native
  mobile app project itself is out of scope for a MERN web scaffold — ask separately
  if you want a React Native scaffold added alongside this.
