const { geocodeAddress } = require("../services/geocodingService");

/** GET /api/geocode?address=... - authenticated (any role), real lookup via
 * OpenStreetMap Nominatim. Returns { lat, lng } or { resolved: false } -
 * never a fabricated coordinate for an address that could not be found. */
const geocode = async (req, res) => {
  try {
    const address = String(req.query.address || "").trim();
    if (!address) {
      return res.status(400).json({ success: false, message: "address is required" });
    }
    if (address.length > 300) {
      return res.status(400).json({ success: false, message: "address is too long" });
    }
    const result = await geocodeAddress(address);
    if (!result) {
      return res.status(200).json({ success: true, resolved: false });
    }
    return res.status(200).json({ success: true, resolved: true, lat: result.lat, lng: result.lng });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Geocoding failed" });
  }
};

module.exports = { geocode };
