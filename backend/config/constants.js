module.exports = {
  APP_NAME: "Courier Management System",
  APP_VERSION: "1.0.0",

  STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    DELETED: "deleted",
    BLOCKED: "blocked",
    ARCHIVED: "archived",
  },

  PACKAGE_TYPES: {
    DOCUMENT: "document",
    PARCEL: "parcel",
    FRAGILE: "fragile",
    HEAVY: "heavy",
    PERISHABLE: "perishable",
  },

  DELIVERY_TYPES: {
    EXPRESS: "express",
    STANDARD: "standard",
    ECONOMY: "economy",
    SAME_DAY: "same_day",
  },

  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
    PARTIAL: "partial",
  },

  PAYMENT_METHODS: {
    CASH: "cash",
    CARD: "card",
    BANK_TRANSFER: "bank_transfer",
    MOBILE_MONEY: "mobile_money",
    WALLET: "wallet",
    COD: "cod",
  },

  ORDER_STATUS: {
    CREATED: "created",
    ASSIGNED: "assigned",
    PICKED_UP: "picked_up",
    IN_TRANSIT: "in_transit",
    DELIVERED: "delivered",
    FAILED: "failed",
    RETURNED: "returned",
    CANCELLED: "cancelled",
  },

  USER_ROLES: {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    MANAGER: "manager",
    DISPATCHER: "dispatcher",
    DRIVER: "driver",
    CUSTOMER: "customer",
    SUPPORT: "support",
    ACCOUNTANT: "accountant",
  },

  NOTIFICATION_TYPES: {
    SMS: "sms",
    EMAIL: "email",
    PUSH: "push",
    WHATSAPP: "whatsapp",
    IN_APP: "in_app",
  },

  PRIORITY_LEVELS: {
    LOW: "low",
    NORMAL: "normal",
    HIGH: "high",
    CRITICAL: "critical",
  },

  FILE_LIMITS: {
    MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
    MAX_DOCUMENT_SIZE: 5 * 1024 * 1024, // 5MB
  },

  DEFAULT_TIMEZONES: {
    APP: "UTC",
  },

  ERROR_CODES: {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    AUTH_ERROR: "AUTH_ERROR",
    NOT_FOUND: "NOT_FOUND",
    DUPLICATE: "DUPLICATE",
    FORBIDDEN: "FORBIDDEN",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  },
};