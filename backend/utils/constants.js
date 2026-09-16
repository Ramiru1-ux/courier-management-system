const STATUS = Object.freeze({ ACTIVE: "active", INACTIVE: "inactive", PENDING: "pending", APPROVED: "approved", REJECTED: "rejected", DELIVERED: "delivered", CANCELLED: "cancelled" });
const ROLES = Object.freeze({ SUPER_ADMIN: "super_admin", ADMIN: "admin", MANAGER: "manager", DISPATCHER: "dispatcher", DRIVER: "driver", CUSTOMER: "customer", SUPPORT: "support", ACCOUNTANT: "accountant" });
const DELIVERY_STATUSES = Object.freeze(["created", "assigned", "picked_up", "in_transit", "delivered", "failed", "returned", "cancelled"]);
const PAYMENT_STATUSES = Object.freeze(["pending", "paid", "failed", "refunded", "partial"]);
const HTTP_STATUS = Object.freeze({ OK: 200, CREATED: 201, BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409, SERVER_ERROR: 500 });

module.exports = { STATUS, ROLES, USER_ROLES: ROLES, DELIVERY_STATUSES, PAYMENT_STATUSES, HTTP_STATUS };
