const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const DoctorRequest = require("../models/DoctorRequest");

/**
 * GET /api/doctors/search
 * Search for doctors to add as family doctor
 */
router.get("/search", protect, async (req, res, next) => {
  try {
    const { query } = req.query;
    const doctors = await User.find({
      role: "doctor",
      $or: [
        { name: { $regex: query, $options: "i" } },
        { "doctorInfo.specialization": { $regex: query, $options: "i" } }
      ]
    }).select("name email doctorInfo profilePicture");
    
    res.json({ success: true, data: doctors });
  } catch (e) { next(e); }
});

/**
 * POST /api/doctors/request
 * Send request to a doctor
 */
router.post("/request", protect, async (req, res, next) => {
  try {
    const { doctorId, message } = req.body;
    
    // Check if already has a doctor
    const user = await User.findById(req.user._id);
    if (user.familyDoctor) {
      return res.status(400).json({ success: false, message: "You already have a family doctor" });
    }

    // Check if request already pending
    const existing = await DoctorRequest.findOne({ patient: req.user._id, doctor: doctorId, status: "pending" });
    if (existing) {
      return res.status(400).json({ success: false, message: "Request already pending" });
    }

    const request = await DoctorRequest.create({
      patient: req.user._id,
      doctor: doctorId,
      message
    });

    res.status(201).json({ success: true, data: request });
  } catch (e) { next(e); }
});

/**
 * GET /api/doctors/requests
 * Get requests (for doctor or patient)
 */
router.get("/requests", protect, async (req, res, next) => {
  try {
    const filter = req.user.role === "doctor" ? { doctor: req.user._id } : { patient: req.user._id };
    const requests = await DoctorRequest.find(filter)
      .populate("patient", "name email age gender profilePicture")
      .populate("doctor", "name email doctorInfo profilePicture")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (e) { next(e); }
});

router.get("/status", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("familyDoctor", "name email doctorInfo profilePicture");
    const requests = await DoctorRequest.find({ patient: req.user._id })
      .populate("doctor", "name email doctorInfo profilePicture")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: { familyDoctor: user.familyDoctor, requests } });
  } catch (e) { next(e); }
});

/**
 * POST /api/doctors/respond
 * Accept or reject request (Doctor only)
 */
router.post("/respond", protect, async (req, res, next) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Only doctors can respond to requests" });
    }

    const { requestId, status } = req.body; // status: accepted or rejected
    const request = await DoctorRequest.findById(requestId);

    if (!request || request.doctor.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    request.status = status;
    await request.save();

    if (status === "accepted") {
      // Update patient's family doctor
      await User.findByIdAndUpdate(request.patient, { familyDoctor: req.user._id });
      // Add patient to doctor's list
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { patients: request.patient } });
    }

    res.json({ success: true, message: `Request ${status}` });
  } catch (e) { next(e); }
});

/**
 * GET /api/doctors/my-patients
 * Get list of patients (Doctor only)
 */
router.get("/my-patients", protect, async (req, res, next) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ success: false, message: "Unauthorized" });
    
    const doctor = await User.findById(req.user._id).populate("patients", "name email phone age gender bloodGroup profilePicture medicalHistory");
    res.json({ success: true, data: doctor.patients });
  } catch (e) { next(e); }
});

// Get specific patient's history (Doctor only)
router.get("/patient/:patientId/history", protect, async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    if (!doctor.patients.includes(req.params.patientId)) {
      return res.status(403).json({ success: false, message: "Not authorized to view this patient" });
    }
    
    const patient = await User.findById(req.params.patientId);
    res.json({ success: true, data: { history: patient.healthHistory } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
