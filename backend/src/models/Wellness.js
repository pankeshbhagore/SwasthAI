const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mood: { type: Number, min: 1, max: 5 },
  sleep: { type: Number, min: 1, max: 5 },
  stress: { type: Number, min: 1, max: 5 },
  energy: { type: Number, min: 1, max: 5 },
  notes: String,
  emotions: [String],
  intensity: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
  createdAt: { type: Date, default: Date.now },
});

const journalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  sentiment: String,
  patterns: [String],
  aiReflection: String,
  createdAt: { type: Date, default: Date.now },
});

const mentalAssessmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["PHQ-9", "GAD-7"] },
  score: Number,
  severity: String,
  answers: Object,
  recommendations: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  CheckIn: mongoose.model("CheckIn", checkInSchema),
  Journal: mongoose.model("Journal", journalSchema),
  MentalAssessment: mongoose.model("MentalAssessment", mentalAssessmentSchema),
};
