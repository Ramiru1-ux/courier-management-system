const { registerGpsSocket } = require("./gpsSocket");
const { registerTrackingSocket } = require("./trackingSocket");
const { registerNotificationSocket } = require("./notificationSocket");

const parseMessage = (value) => {
  if (typeof value !== "string") return value || {};
  try { return JSON.parse(value); } catch { return {}; }
};

const registerSocketHandlers = (io) => {
  if (!io || typeof io.on !== "function") throw new Error("A Socket.IO server is required");
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => roomId && socket.join(roomId));
    socket.on("leave-room", (roomId) => roomId && socket.leave(roomId));

    registerGpsSocket(io, socket);
    registerTrackingSocket(io, socket);
    registerNotificationSocket(io, socket);

    socket.on("message", (raw) => {
      const message = parseMessage(raw);
      const { event, payload } = message;
      if (event && typeof socket.emit === "function") socket.emit(event, payload || {});
    });

    socket.on("socket-message", (message) => {
      const parsed = parseMessage(message);
      if (parsed.event) io.emit(parsed.event, parsed.payload || {});
    });
  });
  return io;
};

module.exports = { registerSocketHandlers, parseMessage };
