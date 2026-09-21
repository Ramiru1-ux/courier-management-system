require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
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
  return new Promise((resolve, reject) => {
    // listen() reports failure through an 'error' EVENT, not by throwing. With
    // nothing listening for it, Node treats it as an unhandled 'error' and
    // kills the process with a raw stack trace - which is what a port clash
    // used to look like: pages of net.js internals instead of the one line
    // that actually matters. Rejecting instead routes it to the handler below.
    const onError = (error) => {
      server.off("listening", onListening);
      if (error.code === "EADDRINUSE") {
        return reject(
          new Error(
            `Port ${env.PORT} is already in use - another copy of this server ` +
              `is probably still running. Stop it and try again, or set PORT ` +
              `in backend/.env to a free port.`
          )
        );
      }
      if (error.code === "EACCES") {
        return reject(new Error(`Not allowed to listen on port ${env.PORT}. Choose a port above 1024.`));
      }
      return reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      console.log(`Server running on port ${env.PORT}`);
      resolve(server);
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(env.PORT);
  });
};

if (require.main === module) {
  // The server only starts listening once MongoDB is connected (above), so it
  // can never accept traffic it has no way of serving. If the database cannot
  // be reached the process exits non-zero instead of lingering in a state
  // where it looks alive but every request fails.
  startServer().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  });

  // Close the MongoDB connection cleanly on shutdown, so stopping the server
  // (Ctrl+C, or nodemon restarting it) does not leave a connection open on the
  // cluster. Each signal is handled once; failures during shutdown are ignored
  // because the process is going away regardless.
  const shutdown = async (signal) => {
    console.log(`${signal} received - shutting down`);
    server.close();
    try {
      await mongoose.connection.close();
    } catch (error) {
      // nothing useful to do while exiting
    }
    process.exit(0);
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

module.exports = { app, server, startServer };