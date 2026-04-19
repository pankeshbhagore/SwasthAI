const express = require("express");
const router = express.Router();
const { protect } = require("../shared/middleware/auth");
const alertService = require("../services/notification-service/alertService");

/**
 * POST /api/alerts/emergency
 * Trigger emergency alert (SMS + call)
 */
router.post("/emergency", protect, async (req, res, next) => {
  try {
    const { symptoms, location } = req.body;
    const user = req.user;

    const results = { sms: null, call: null };

    // SMS to emergency contact
    if (user.emergencyContact?.phone) {
      results.sms = await alertService.sendEmergencySMS(
        user.emergencyContact.phone,
        user.name,
        symptoms || [],
        location
      );
    }

    // Voice call to emergency contact
    if (user.emergencyContact?.phone) {
      results.call = await alertService.sendEmergencyCall(
        user.emergencyContact.phone,
        user.name
      );
    }

    // Emit via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.to(user._id.toString()).emit("emergency-triggered", {
        message: "Emergency services alerted",
        timestamp: new Date().toISOString(),
      });
      io.to("admin").emit("new-emergency", {
        userId: user._id,
        name: user.name,
        symptoms,
        location,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: "Emergency alert sent",
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/alerts/aqi
 * Get air quality for a city
 */
router.get("/aqi", async (req, res, next) => {
  try {
    const { city } = req.query;
    const data = await alertService.getAirQuality(city || "delhi");

    if (!data) {
      return res.json({ success: true, data: null, message: "AQI data unavailable" });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/alerts/weather
 * Get weather health advisory
 */
router.get("/weather", async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "lat and lng required" });
    }
    const data = await alertService.getWeather(parseFloat(lat), parseFloat(lng));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
