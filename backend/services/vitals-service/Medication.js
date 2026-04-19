const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    genericName: String,
    dosage: { type: String, required: true }, // "500mg", "10ml"
    form: { type: String, enum: ["tablet", "capsule", "syrup", "injection", "inhaler", "drops", "cream", "other"], default: "tablet" },
    frequency: {
      type: String,
      enum: ["once_daily", "twice_daily", "thrice_daily", "four_times", "weekly", "as_needed", "custom"],
      default: "once_daily",
    },
    times: [String], // ["08:00", "14:00", "21:00"]
    duration: {
      startDate: { type: Date, default: Date.now },
      endDate: Date,
      daysTotal: Number,
    },
    instructions: String, // "Take with food", "Take before sleep"
    purpose: String, // "For blood pressure", "For diabetes"
    prescribedBy: String,
    refillDate: Date,
    remainingPills: Number,
    isActive: { type: Boolean, default: true },
    reminderEnabled: { type: Boolean, default: true },
    takenLog: [
      {
        date: Date,
        taken: Boolean,
        time: String,
        notes: String,
      },
    ],
    sideEffectsReported: [String],
    interactionWarnings: [String],
  },
  { timestamps: true }
);

// Virtual: adherence rate
medicationSchema.virtual("adherenceRate").get(function () {
  if (!this.takenLog || this.takenLog.length === 0) return null;
  const taken = this.takenLog.filter((l) => l.taken).length;
  return Math.round((taken / this.takenLog.length) * 100);
});

module.exports = mongoose.model("Medication", medicationSchema);
