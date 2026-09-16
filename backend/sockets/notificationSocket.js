const registerNotificationSocket = (io, socket) => {
  const joinUserRoom = (userId) => {
    if (!userId) return false;
    socket.join(`user:${userId}`);
    return true;
  };

  const emitNotification = (payload = {}) => {
    const { userId, notification } = payload;
    if (!notification) return false;
    const event = { notification, createdAt: new Date().toISOString() };
    if (userId) io.to(`user:${userId}`).emit("notification", event);
    else socket.emit("notification", event);
    return true;
  };

  socket.on("join-user", joinUserRoom);
  socket.on("subscribe-notifications", joinUserRoom);
  socket.on("notification", emitNotification);
  return { joinUserRoom, emitNotification };
};

module.exports = { registerNotificationSocket };
