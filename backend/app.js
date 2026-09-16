require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require("./routes");
const env = require("./config/env");
const notFound = require("./middleware/notFound");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.disable("x-powered-by");
// The frontend runs three portals on three ports (main 5173, driver 5174,
// customer 5175), so allow all of them plus whatever FRONTEND_URL is set to.
const allowedOrigins = [
	env.FRONTEND_URL,
	"http://localhost:5173",
	"http://localhost:5174",
	"http://localhost:5175",
	"http://127.0.0.1:5173",
	"http://127.0.0.1:5174",
	"http://127.0.0.1:5175",
].filter(Boolean);

app.use(cors({
	origin(origin, callback) {
		// No `origin` header at all means a same-origin/non-browser request
		// (curl, server-to-server, Postman) - CORS only governs browser
		// cross-origin calls, so that case is always allowed. A browser
		// origin must match one of the three real frontend ports (or
		// FRONTEND_URL) - this used to unconditionally callback(null, true)
		// regardless of the check above, so ANY origin was actually allowed
		// in practice (the allowlist computation was dead code).
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error("Not allowed by CORS"));
	},
	credentials: true,
}));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Serves files written by config/multerConfig.js (POST /api/uploads/pod-photo).
// Mounted under /api so the existing Vite dev-server proxy (which only
// forwards /api/*, see frontend/vite.config.js) reaches it without a second
// proxy rule. Read-only, unauthenticated, protected only by the random
// filename multer generates - acceptable for a delivery photo, not for
// anything sensitive.
app.use("/api/uploads/files", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Courier Management System API is running",
		environment: env.NODE_ENV,
	});
});

app.get("/health", (req, res) => {
	res.status(200).json({
		success: true,
		status: "healthy",
		timestamp: new Date().toISOString(),
	});
});

app.use("/api", routes);
app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
