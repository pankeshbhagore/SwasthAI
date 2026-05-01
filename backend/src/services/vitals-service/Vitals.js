const mongoose = require("mongoose");

const vitalsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bloodPressure: {
      systolic: { type: Number, min: 50, max: 300 },
      diastolic: { type: Number, min: 30, max: 200 },
    },
    heartRate: { type: Number, min: 20, max: 300 },
    bloodSugar: {
      value: Number,
      type: { type: String, enum: ["fasting", "post_meal", "random"], default: "random" },
    },
    temperature: { type: Number, min: 90, max: 110 }, // Fahrenheit
    oxygenSaturation: { type: Number, min: 50, max: 100 }, // SpO2 %
    weight: { type: Number, min: 1, max: 500 }, // kg
    height: { type: Number, min: 50, max: 300 }, // cm
    bmi: Number,
    respiratoryRate: { type: Number, min: 5, max: 60 },
    notes: String,
    mlRisk: {
      risk_level: String,
      alerts: [{ type: String, message: String }],
    },
    source: { type: String, default: "manual" }, // manual, device, wearable
  },
  { timestamps: true }
);

// Auto-calculate BMI
vitalsSchema.pre("save", function (next) {
  if (this.weight && this.height) {
    const heightM = this.height / 100;
    this.bmi = Math.round((this.weight / (heightM * heightM)) * 10) / 10;
  }
  next();
});

// Virtual: BP category
vitalsSchema.virtual("bpCategory").get(function () {
  if (!this.bloodPressure?.systolic) return null;
  const sys = this.bloodPressure.systolic;
  if (sys >= 180) return "Hypertensive Crisis";
  if (sys >= 140) return "High";
  if (sys >= 130) return "Elevated";
  if (sys >= 120) return "Slightly Elevated";
  return "Normal";
});

module.exports = mongoose.model("Vitals", vitalsSchema);
