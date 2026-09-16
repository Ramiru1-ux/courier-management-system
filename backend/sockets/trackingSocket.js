const registerTrackingSocket = (io, socket) => {
  const joinTrackingRoom = (trackingNumber) => {
    if (!trackingNumber) return false;
    socket.join(`tracking:${trackingNumber}`);
    return true;
  };

  const leaveTrackingRoom = (trackingNumber) => {
    if (!trackingNumber) return false;
    socket.leave(`tracking:${trackingNumber}`);
    return true;
  };

  const publishShipmentUpdate = (payload = {}) => {
    const { trackingNumber, roomId, shipment } = payload;
    if (!shipment && !trackingNumber) return false;
    const event = { trackingNumber, shipment, updatedAt: new Date().toISOString() };
    if (trackingNumber) io.to(`tracking:${trackingNumber}`).emit("shipment-status", event);
    if (roomId) io.to(roomId).emit("shipment-status", event);
    return true;
  };

  socket.on("join-tracking", joinTrackingRoom);
  socket.on("leave-tracking", leaveTrackingRoom);
  socket.on("shipment-update", publishShipmentUpdate);
  return { joinTrackingRoom, leaveTrackingRoom, publishShipmentUpdate };
};

module.exports = { registerTrackingSocket };
