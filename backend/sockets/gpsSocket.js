const isValidLocation = (location) => {
  const latitude = Number(location?.latitude ?? location?.lat);
  const longitude = Number(location?.longitude ?? location?.lng);
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
};

const registerGpsSocket = (io, socket) => {
  const broadcastLocation = (payload = {}) => {
    const { roomId, driverId, location } = payload;
    if (!isValidLocation(location)) return false;
    const event = { driverId, location, updatedAt: new Date().toISOString() };
    if (roomId) io.to(roomId).emit("location-update", event);
    if (driverId) io.emit(`driver-location:${driverId}`, event);
    return true;
  };

  socket.on("track-location", broadcastLocation);
  socket.on("driver-location", broadcastLocation);
  return { broadcastLocation };
};

module.exports = { registerGpsSocket, isValidLocation };
