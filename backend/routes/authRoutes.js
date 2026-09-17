const express = require("express");
const controller = require("../controllers/authController");
const { authenticate, optionalAuth } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// A working, IP-keyed sliding-window limiter already existed in this
// codebase (middleware/rateLimiter.js) but was only ever wired into the
// dead legacy REST modules via utils/routeFactory.js - the real auth
// endpoints the frontend actually calls had none. Login already has a
// separate, per-ACCOUNT lockout (utils/loginAttempts.js, 5 attempts/60s) -
// this adds a per-IP limiter on top, which is the one thing account
// lockout cannot catch: many different accounts (or nonexistent ones)
// tried rapidly from a single source.
//
// This endpoint is the one place many DIFFERENT legitimate users
// realistically share one IP at once (an office behind NAT, a school, a
// coffee-shop network) - an earlier, tighter version of this limiter
// (30/5min) was caught by this project's OWN automated regression suite
// simply logging in as its normal 6-9 test accounts across a handful of
// consecutive runs, which is a far lighter load than a real multi-desk
// office's morning login rush would be. Kept generous enough to comfortably
// absorb that, while still capping a scripted brute force at a small
// fraction of the throughput it would otherwise get.
const loginLimiter = createRateLimiter({ windowMs: 5 * 60 * 1000, max: 300 });
const accountFlowLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });

// --- public ---
router.post("/login", loginLimiter, controller.login);
router.post("/logout", optionalAuth, controller.logout);
router.post("/forgot-password", accountFlowLimiter, controller.forgotPassword);
router.post("/reset-password", accountFlowLimiter, controller.resetPassword);

// --- signed in ---
router.get("/me", authenticate, controller.getMe);
router.patch("/me", authenticate, controller.updateProfile);
router.post("/change-password", authenticate, controller.changePassword);

// --- user management (admin only) ---
//
// CRITICAL FIX (found during this pass's role/permission audit):
// POST /register previously had NO authentication at all and accepted an
// arbitrary `role` field straight from the request body - anyone on the
// internet could call it with {"role":"admin"} and receive back a fully
// valid, immediately-usable admin JWT with full access to
// GET/PUT /api/app-data (every shipment, financial record, and credential
// in the system). Confirmed exploitable live before this fix. The two real
// frontend callers of this endpoint (admin/DriversPage.jsx,
// admin/UsersPage.jsx) are BOTH already admin-only screens - the frontend
// route guard was the only thing standing in the way, which is not a
// server-side control at all.
//
// The four /users/* CRUD routes below had the same shape of bug one level
// down: `authenticate` alone (no role check) let ANY signed-in account -
// confirmed live with a customer token - list every user's PII and
// PATCH any other account's `role` field, instantly self-escalating to
// admin. Both classes of bug are fixed the same way: require the CALLER to
// already be an admin, using the same authorizeRoles() middleware that
// already existed in this codebase but had never been wired to a real route.
router.post("/register", authenticate, authorizeRoles("admin"), accountFlowLimiter, controller.register);
router.post("/users", authenticate, authorizeRoles("admin"), controller.createUser);
router.get("/users", authenticate, authorizeRoles("admin"), controller.getUsers);
router.get("/users/:id", authenticate, authorizeRoles("admin"), controller.getUserById);
router.patch("/users/:id", authenticate, authorizeRoles("admin"), controller.updateUser);
router.delete("/users/by-email/:email", authenticate, authorizeRoles("admin"), controller.deleteUserByEmail);
router.delete("/users/:id", authenticate, authorizeRoles("admin"), controller.deleteUser);

module.exports = router;
