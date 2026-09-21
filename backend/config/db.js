const mongoose = require("mongoose");
const env = require("./env");

/**
 * MongoDB connection lifecycle.
 *
 * The timeouts below are deliberate and are the fix for requests that used to
 * hang until the BROWSER gave up. The frontend's HTTP client aborts a request
 * after 20s (frontend/src/api/axiosInstance.js). Mongoose 9's default
 * serverSelectionTimeoutMS is 30s, which is LONGER than that - so whenever the
 * cluster was briefly unreachable or slow, Express sat waiting on the driver
 * while the browser timed out first and reported
 * "timeout of 20000ms exceeded". The user saw "Not connected to the database"
 * with no idea whether the server, the network or the database was at fault,
 * because nothing had actually reported a database failure - the request had
 * simply been abandoned.
 *
 * Everything here is therefore chosen to fail, and be reported, WELL inside
 * that 20s client budget.
 */
const CONNECT_OPTIONS = {
  // Give up looking for a reachable cluster node after 8s, comfortably inside
  // the client's 20s budget, so a genuine outage surfaces as a real error
  // instead of a client-side timeout.
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
  // Generous: this bounds a single socket's inactivity, not a query, and must
  // not be the thing that kills a legitimately slow bulk write.
  socketTimeoutMS: 45000,
  // Queries issued while the connection is down wait this long for it to come
  // back before failing. Short, so a disconnect surfaces quickly rather than
  // stacking up requests that the browser has already abandoned.
  bufferTimeoutMS: 5000,
  maxPoolSize: 20,
  minPoolSize: 2,
  retryWrites: true,
};

/**
 * Last connection error seen, so /api/health can explain WHY the database is
 * unavailable instead of only saying that it is.
 */
let lastError = null;

const READY_STATE_NAMES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

/** The real, current state of the MongoDB connection. */
const getDbStatus = () => {
  const { readyState, name, host } = mongoose.connection;
  return {
    connected: readyState === 1,
    state: READY_STATE_NAMES[readyState] || "unknown",
    database: name || null,
    host: host || null,
    // Never the URI: it carries the password. See the security note below.
    lastError: readyState === 1 ? null : lastError,
  };
};

/**
 * Connection events are logged once, here, rather than being left unhandled.
 * Without these a dropped connection was completely silent: the server kept
 * accepting requests and every one of them hung.
 */
let listenersBound = false;
const bindConnectionEvents = () => {
  if (listenersBound) return;
  listenersBound = true;

  mongoose.connection.on("connected", () => {
    lastError = null;
    console.log(`MongoDB connected (${mongoose.connection.name})`);
  });
  mongoose.connection.on("error", (error) => {
    lastError = error.message;
    console.error("MongoDB connection error:", error.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected - requests will be refused until it returns");
  });
  mongoose.connection.on("reconnected", () => {
    lastError = null;
    console.log("MongoDB reconnected");
  });
};

/**
 * Connects once, at startup, BEFORE the HTTP server starts listening (see
 * server.js). A single shared connection is reused for the whole process -
 * mongoose pools it - so nothing else in the codebase should call connect().
 */
const connectDB = async () => {
  if (!env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is not set. Add it to backend/.env - it must never be exposed to the frontend."
    );
  }

  bindConnectionEvents();

  try {
    await mongoose.connect(env.MONGO_URI, CONNECT_OPTIONS);
    return mongoose.connection;
  } catch (error) {
    lastError = error.message;
    // Said plainly, because the usual causes are environmental and the person
    // running this needs to know which one to go and fix.
    console.error("MongoDB connection failed:", error.message);
    console.error(
      "Check: the cluster is running, this machine's IP is allowed in Atlas " +
        "Network Access, the credentials in backend/.env are correct, and DNS resolves."
    );
    throw error;
  }
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.getDbStatus = getDbStatus;
