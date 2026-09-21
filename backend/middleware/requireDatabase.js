const { getDbStatus } = require("../config/db");

/**
 * Refuses API requests immediately while MongoDB is not connected.
 *
 * This is what stops a database outage from being reported to the user as a
 * browser timeout. Without it, a request arriving while the connection was
 * down went into mongoose's command buffer and simply waited; the browser
 * aborted at 20s and showed "timeout of 20000ms exceeded", which says nothing
 * about the actual fault. Now the request comes straight back as 503 with a
 * machine-readable reason, so the frontend can say exactly what is wrong.
 *
 * Health endpoints are mounted BEFORE this, because their entire job is to be
 * reachable and report the failure.
 */
const requireDatabase = (req, res, next) => {
  const status = getDbStatus();
  if (status.connected) return next();

  return res.status(503).json({
    success: false,
    code: "DATABASE_UNAVAILABLE",
    message:
      "The server cannot reach the database right now, so nothing can be read or saved. Your changes have not been stored.",
    database: { state: status.state, reason: status.lastError },
  });
};

module.exports = requireDatabase;
