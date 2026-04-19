/**
 * SwasthAI Health Report PDF Generator
 * Generates downloadable patient health summary PDF
 * Uses PDFKit (install: npm install pdfkit)
 */

const path = require("path");
const fs = require("fs");

/**
 * Generate a comprehensive health report for a user
 * Returns the file path of the generated PDF
 */
const generateHealthReport = async (user, options = {}) => {
  try {
    const PDFDocument = require("pdfkit");

    const outputDir = path.join(__dirname, "../../../uploads/reports");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `health_report_${user._id}_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ── Header ──────────────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 100).fill("#0c1524");
      doc.fillColor("white").fontSize(28).font("Helvetica-Bold")
        .text("SwasthAI", 50, 30);
      doc.fontSize(12).font("Helvetica")
        .text("Intelligent Health Report", 50, 62);
      doc.fillColor("white").fontSize(10)
        .text(`Generated: ${new Date().toLocaleString("en-IN")}`, 350, 45, { align: "right" });

      doc.moveDown(3);

      // ── Patient Info ─────────────────────────────────────────────────────
      doc.fillColor("#0c1524").fontSize(16).font("Helvetica-Bold").text("Patient Information");
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#00e5ff").moveDown(0.5);

      const infoData = [
        ["Name", user.name || "N/A"],
        ["Age", user.age ? `${user.age} years` : "N/A"],
        ["Gender", user.gender || "N/A"],
        ["Blood Group", user.bloodGroup || "N/A"],
        ["Phone", user.phone || "N/A"],
        ["Email", user.email || "N/A"],
      ];

      doc.font("Helvetica").fontSize(11).fillColor("#333");
      infoData.forEach(([label, value]) => {
        doc.text(`${label}: `, { continued: true }).font("Helvetica-Bold").text(value);
        doc.font("Helvetica");
      });

      doc.moveDown();

      // ── Health Score ────────────────────────────────────────────────────
      doc.fillColor("#0c1524").fontSize(16).font("Helvetica-Bold").text("Health Score");
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#00ff88").moveDown(0.5);

      const score = user.healthScore || 75;
      const scoreColor = score >= 80 ? "green" : score >= 60 ? "blue" : score >= 40 ? "orange" : "red";
      doc.font("Helvetica-Bold").fontSize(36).fillColor(scoreColor).text(`${score}/100`, { align: "center" });
      doc.font("Helvetica").fontSize(12).fillColor("#555")
        .text(score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Attention", { align: "center" });

      doc.moveDown();

      // ── Medical History ─────────────────────────────────────────────────
      doc.fillColor("#0c1524").fontSize(16).font("Helvetica-Bold").text("Medical History");
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#a78bfa").moveDown(0.5);

      const med = user.medicalHistory || {};
      doc.font("Helvetica").fontSize(11).fillColor("#333");

      if (med.chronicConditions?.length) {
        doc.font("Helvetica-Bold").text("Chronic Conditions: ", { continued: true })
          .font("Helvetica").text(med.chronicConditions.join(", "));
      }
      if (med.allergies?.length) {
        doc.font("Helvetica-Bold").text("Allergies: ", { continued: true })
          .font("Helvetica").text(med.allergies.join(", "));
      }
      if (med.currentMedications?.length) {
        doc.font("Helvetica-Bold").text("Current Medications: ", { continued: true })
          .font("Helvetica").text(med.currentMedications.join(", "));
      }

      doc.moveDown();

      // ── Recent Health History ───────────────────────────────────────────
      if (user.healthHistory?.length > 0) {
        doc.fillColor("#0c1524").fontSize(16).font("Helvetica-Bold").text("Recent Consultations (Last 10)");
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#ffb300").moveDown(0.5);

        const recent = user.healthHistory.slice(-10).reverse();
        doc.font("Helvetica").fontSize(10).fillColor("#333");

        recent.forEach((entry, i) => {
          const date = new Date(entry.createdAt).toLocaleDateString("en-IN");
          const severityColors = { EMERGENCY: "red", MODERATE: "orange", MILD: "green", NORMAL: "blue" };
          const color = severityColors[entry.severity] || "black";

          doc.font("Helvetica-Bold").fillColor(color)
            .text(`${i + 1}. [${entry.severity}] `, { continued: true })
            .font("Helvetica").fillColor("#333")
            .text(`${entry.symptoms?.join(", ")} — ${date}`);
          if (entry.advice) {
            doc.fillColor("#666").text(`   → ${entry.advice.substring(0, 100)}...`);
          }
          doc.moveDown(0.3);
        });
      }

      doc.moveDown();

      // ── Emergency Contact ───────────────────────────────────────────────
      if (user.emergencyContact?.name) {
        doc.fillColor("#0c1524").fontSize(16).font("Helvetica-Bold").text("Emergency Contact");
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#ff3d71").moveDown(0.5);

        const ec = user.emergencyContact;
        doc.font("Helvetica").fontSize(11).fillColor("#333");
        doc.text(`Name: ${ec.name}   Phone: ${ec.phone}   Relation: ${ec.relation || "N/A"}`);
        doc.moveDown();
      }

      // ── Footer ──────────────────────────────────────────────────────────
      doc.fontSize(9).fillColor("#999").font("Helvetica")
        .text(
          "⚠️ This report is generated by SwasthAI for informational purposes only. It does not constitute medical advice or diagnosis. Always consult a qualified healthcare professional.",
          50, doc.page.height - 60, { align: "center", width: 495 }
        );

      doc.end();

      stream.on("finish", () => resolve({ filePath, filename }));
      stream.on("error", reject);
    });
  } catch (err) {
    // Fallback: generate simple text report if PDFKit not installed
    const outputDir = path.join(__dirname, "../../../uploads/reports");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const filename = `health_report_${user._id}_${Date.now()}.txt`;
    const filePath = path.join(outputDir, filename);

    const content = `SwasthAI Health Report\n${"=".repeat(40)}\nPatient: ${user.name}\nDate: ${new Date().toLocaleString("en-IN")}\nHealth Score: ${user.healthScore || 75}/100\n\nMedical History:\nConditions: ${user.medicalHistory?.chronicConditions?.join(", ") || "None"}\nAllergies: ${user.medicalHistory?.allergies?.join(", ") || "None"}\n\nRecent Activity: ${user.healthHistory?.length || 0} consultations\n\n⚠️ This is informational only. Consult a doctor.`;

    fs.writeFileSync(filePath, content);
    return { filePath, filename, format: "txt" };
  }
};

module.exports = { generateHealthReport };
