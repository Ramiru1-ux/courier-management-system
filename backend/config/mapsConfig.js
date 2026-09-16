const axios = require("axios");
const env = require("./env");

const MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY;

const defaultMapConfig = {
  apiKey: MAPS_API_KEY,
  defaultZoom: 12,
  defaultCenter: {
    lat: 23.8103,
    lng: 90.4125,
  },
};

const getDistanceAndDuration = async (origin, destination) => {
  validateCoordinates(origin, "origin");
  validateCoordinates(destination, "destination");

  if (!MAPS_API_KEY) {
    throw new Error("Google Maps API key is missing");
  }

  const url = "https://maps.googleapis.com/maps/api/distancematrix/json";
  const params = {
    origins: `${origin.lat},${origin.lng}`,
    destinations: `${destination.lat},${destination.lng}`,
    key: MAPS_API_KEY,
    units: "metric",
  };

  const response = await axios.get(url, { params });
  const data = response.data;

  if (data.status !== "OK") {
    throw new Error(data.error_message || "Google Maps distance matrix request failed");
  }

  const element = data.rows[0]?.elements[0];

  if (!element || element.status !== "OK") {
    throw new Error("Could not calculate route distance");
  }

  return {
    distanceText: element.distance.text,
    distanceValue: element.distance.value,
    durationText: element.duration.text,
    durationValue: element.duration.value,
  };
};

const geocodeAddress = async (address) => {
  if (!String(address || "").trim()) {
    throw new Error("Address is required for geocoding");
  }

  if (!MAPS_API_KEY) {
    throw new Error("Google Maps API key is missing");
  }

  const url = "https://maps.googleapis.com/maps/api/geocode/json";
  const response = await axios.get(url, {
    params: {
      address,
      key: MAPS_API_KEY,
    },
  });

  if (response.data.status !== "OK") {
    throw new Error(response.data.error_message || "Geocoding failed");
  }

  const result = response.data.results[0];

  if (!result) {
    throw new Error("No geocoding result found");
  }

  return {
    formattedAddress: result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    placeId: result.place_id,
  };
};

const validateCoordinates = (coordinates, name) => {
  const latitude = Number(coordinates?.lat);
  const longitude = Number(coordinates?.lng);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error(`Invalid ${name} latitude`);
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error(`Invalid ${name} longitude`);
  }
};

module.exports = {
  defaultMapConfig,
  getDistanceAndDuration,
  geocodeAddress,
};