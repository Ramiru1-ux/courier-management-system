require("dotenv").config();
const http = require("http");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socketConfig");
const app = require("./app");
const env = require("./config/env");

const server = http.createServer(app);

initSocket(server, {
  origin: env.FRONTEND_URL,
});

const startServer = async () => {
  await connectDB();
  return new Promise((resolve) => {
    server.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      resolve(server);
    });
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, server, startServer };