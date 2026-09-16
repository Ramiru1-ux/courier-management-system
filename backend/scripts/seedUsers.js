/**
 * Creates the login accounts in MongoDB.
 *
 *   cd backend
 *   npm run seed
 *
 * Safe to run more than once: existing accounts are updated, not duplicated.
 * Passwords are hashed with bcrypt by the User model before they are saved.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const ACCOUNTS = [
	{ name: "Admin User", email: "admin@egotechworld.com", password: "Admin@123", role: "admin", branchName: "Colombo Central", phone: "011 234 5678" },
	{ name: "Fathima Rizwan", email: "finance@egotechworld.com", password: "Finance@123", role: "finance", branchName: "Colombo Central", phone: "011 234 5579" },
	{ name: "Dilshan Karunaratne", email: "dispatcher@egotechworld.com", password: "Dispatch@123", role: "dispatcher", branchName: "Colombo Central", phone: "011 234 5580" },
	{ name: "Urban Mart", email: "merchant@egotechworld.com", password: "Merchant@123", role: "merchant", merchantName: "Urban Mart", phone: "011 234 5566" },
	{ name: "Pasan Perera", email: "customer@egotechworld.com", password: "Customer@123", role: "customer", phone: "071 554 2233" },

	{ name: "Hiruni Jayasuriya", email: "hiruni@egotechworld.com", password: "Finance@123", role: "finance", branchName: "Kandy Hub", phone: "081 223 1190" },
	{ name: "Malith Weerasinghe", email: "malith@egotechworld.com", password: "Dispatch@123", role: "dispatcher", branchName: "Galle Branch", phone: "091 223 4455", status: "suspended" },

	{ name: "Kasun Jayawardena", email: "driver@egotechworld.com", password: "Driver@123", role: "driver", driverId: "DRV-01", branchName: "Colombo Central", phone: "077 112 3344" },
	{ name: "Amila Fernando", email: "amila.fernando@egotechworld.com", password: "Driver@123", role: "driver", driverId: "DRV-02", branchName: "Colombo Central", phone: "071 554 2233" },
	{ name: "Nimal Bandara", email: "nimal.bandara@egotechworld.com", password: "Driver@123", role: "driver", driverId: "DRV-03", branchName: "Kandy Hub", phone: "076 887 1122" },
	{ name: "Sajini Kumari", email: "sajini.kumari@egotechworld.com", password: "Driver@123", role: "driver", driverId: "DRV-04", branchName: "Galle Branch", phone: "070 445 9981" },
	{ name: "Roshan Perera", email: "roshan.perera@egotechworld.com", password: "Driver@123", role: "driver", driverId: "DRV-05", branchName: "Kandy Hub", phone: "075 662 3390" },
];

const run = async () => {
	await connectDB();
	console.log(`Database: ${mongoose.connection.name}\n`);

	let created = 0;
	let updated = 0;

	for (const account of ACCOUNTS) {
		const email = account.email.toLowerCase();
		const existing = await User.findOne({ email }).select("+password");

		if (existing) {
			existing.name = account.name;
			existing.role = account.role;
			existing.phone = account.phone || existing.phone;
			existing.branchName = account.branchName || "";
			existing.driverId = account.driverId || "";
			existing.merchantName = account.merchantName || "";
			existing.status = account.status || "active";
			existing.password = account.password; // re-hashed by the pre-save hook
			await existing.save();
			updated += 1;
			console.log(`updated  ${email.padEnd(36)} ${account.role}`);
		} else {
			await User.create({ ...account, email, status: account.status || "active" });
			created += 1;
			console.log(`created  ${email.padEnd(36)} ${account.role}`);
		}
	}

	console.log(`\nDone. ${created} created, ${updated} updated.`);
	console.log("Sign in with any email above. Example: admin@egotechworld.com / Admin@123");
	await mongoose.connection.close();
};

run().catch(async (error) => {
	console.error("Seeding failed:", error.message);
	try { await mongoose.connection.close(); } catch (_) { /* ignore */ }
	process.exitCode = 1;
});
