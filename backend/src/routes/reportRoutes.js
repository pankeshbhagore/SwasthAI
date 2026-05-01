const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/auth");
const aiService = require("../services/ai-service/index");

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/reports";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".txt"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Only PDF, JPG, PNG, and TXT files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * POST /api/reports/analyze
 * Upload and analyze a medical report/prescription
 */
router.post("/analyze", protect, upload.single("report"), async (req, res, next) => {
  try {
    let reportText = req.body.text || "";

    // If file uploaded, extract text (simplified - in production use OCR)
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext === ".txt") {
        reportText = fs.readFileSync(req.file.path, "utf8");
      } else {
        reportText = `[Uploaded file: ${req.file.originalname}. File type: ${ext}. 
        In production, OCR would extract text from this file. 
        For demo, analyzing based on filename context.]`;
      }
    }

    if (!reportText) {
      return res.status(400).json({ success: false, message: "Report text or file required" });
    }

    const analysis = await aiService.analyzeReport(reportText);

    res.json({
      success: true,
      data: {
        analysis,
        file: req.file ? req.file.filename : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reports/analyze-text
 * Analyze pasted report text
 */
router.post("/analyze-text", protect, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Report text required" });
    }
    const analysis = await aiService.analyzeReport(text);
    res.json({ success: true, data: { analysis } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
