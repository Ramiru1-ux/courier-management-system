const predictDeliveryDelay = ({ distanceKm = 0, stopCount = 1, trafficFactor = 1, weatherFactor = 1 } = {}) => { const hours = (Number(distanceKm) / 35 + Number(stopCount) * 0.15) * Number(trafficFactor) * Number(weatherFactor); return { estimatedHours: Math.round(hours * 100) / 100, delayed: hours > 4 }; };
module.exports = { predictDeliveryDelay, estimateDelay: predictDeliveryDelay };
