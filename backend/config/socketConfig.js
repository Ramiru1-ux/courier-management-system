const { Server } = require("socket.io");
const env = require("./env");
const { registerSocketHandlers } = require("../sockets/socketServer");

let io;

const initSocket = (server, options = {}) => {
  if (!server) {
    throw new Error("An HTTP server is required to initialize Socket.IO");
  }

  io = new Server(server, {
    cors: {
      origin: options.origin || env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  return io;
};

const getSocket = () => io;

module.exports = {
  initSocket,
  getSocket,
};