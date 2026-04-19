const express = require("express");
const router = express.Router();
const hospitalAgent = require("../services/ai-service/agents/hospitalAgent");

/**
 * GET /api/maps/hospitals
 * Find nearby hospitals
 */
router.get("/hospitals", async (req, res, next) => {
  try {
    const { lat, lng, severity } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    const result = await hospitalAgent.findNearbyHospitals(
      parseFloat(lat),
      parseFloat(lng),
      severity || "MILD"
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/maps/hospital/:placeId
 * Get details of a specific hospital
 */
router.get("/hospital/:placeId", async (req, res, next) => {
  try {
    const details = await hospitalAgent.getHospitalDetails(req.params.placeId);
    if (!details) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }
    res.json({ success: true, data: details });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/maps/key
 * Return public Maps API key for frontend
 */
router.get("/key", (req, res) => {
  res.json({ success: true, data: { key: process.env.GOOGLE_MAPS_API_KEY || "" } });
});

module.exports = router;
