/**
 * MediMind Ultra-Premium Health Report PDF Generator
 * Generates comprehensive patient health summary PDF with clean typography and layouts
 */

const path = require("path");
const fs = require("fs");
const Vitals = require("../vitals-service/Vitals");
const Medication = require("../vitals-service/Medication");

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

    const filename = `medimind_health_report_${user._id}_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, filename);

    // Fetch additional data
    const [vitals, meds] = await Promise.all([
      Vitals.find({ userId: user._id }).sort({ createdAt: -1 }).limit(15).lean(),
      Medication.find({ userId: user._id, isActive: true }).lean(),
    ]);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        size: "A4", 
        margin: 50,
        bufferPages: true 
      });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ── HELPER: Section Header ─────────────────────────────────────
      const addSectionHeader = (title, color) => {
        doc.moveDown(1.5);
        const currentY = doc.y;
        doc.rect(50, currentY, 3, 25).fill(color);
        doc.fillColor("#0c1524").fontSize(16).font("Helvetica-Bold")
           .text(title, 65, currentY + 5);
        doc.moveDown(0.8);
      };

      // ── Header ──────────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 120).fill("#0c1524");
      doc.fillColor("#00e5ff").fontSize(32).font("Helvetica-Bold").text("MediMind", 50, 40);
      doc.fillColor("white").fontSize(11).font("Helvetica").text("Your Intelligent Health Copilot", 50, 78);
      
      doc.fillColor("white").fontSize(10).font("Helvetica-Bold")
        .text("MEDICAL RECORD SUMMARY", 350, 45, { align: "right" });
      doc.font("Helvetica").fontSize(9)
        .text(`Patient ID: ${user._id.toString().toUpperCase()}`, 350, 60, { align: "right" })
        .text(`Generated: ${new Date().toLocaleString("en-IN")}`, 350, 72, { align: "right" });

      doc.y = 140; // Set starting Y for content

      // ── Section: Patient Profile ─────────────────────────────────────
      addSectionHeader("Patient Information", "#00e5ff");
      
      const profileY = doc.y;
      doc.fontSize(11).font("Helvetica");
      
      const leftCol = 70;
      const rightCol = 320;
      
      const drawInfoRow = (label, value, x, y) => {
        doc.fillColor("#666").font("Helvetica").text(`${label}:`, x, y);
        doc.fillColor("#000").font("Helvetica-Bold").text(value, x + 80, y);
      };

      drawInfoRow("Name", user.name || "N/A", leftCol, profileY);
      drawInfoRow("Age", user.age ? `${user.age} years` : "N/A", leftCol, profileY + 20);
      drawInfoRow("Gender", user.gender || "N/A", leftCol, profileY + 40);
      
      drawInfoRow("Blood Group", user.bloodGroup || "N/A", rightCol, profileY);
      drawInfoRow("Phone", user.phone || "N/A", rightCol, profileY + 20);
      drawInfoRow("Email", user.email || "N/A", rightCol, profileY + 40);

      doc.y = profileY + 70;

      // ── Section: Health Score ────────────────────────────────────────
      addSectionHeader("Health Status & Insights", "#00ff88");
      
      const score = user.healthScore || 75;
      const scoreColor = score >= 80 ? "#00ff88" : score >= 60 ? "#00e5ff" : score >= 40 ? "#ffb300" : "#ff3d71";
      
      // Score Circle/Box
      const scoreY = doc.y;
      doc.rect(50, scoreY, 120, 80).fill("#f8faff");
      doc.fillColor(scoreColor).fontSize(36).font("Helvetica-Bold").text(`${score}`, 50, scoreY + 15, { width: 120, align: "center" });
      doc.fillColor("#666").fontSize(10).font("Helvetica").text("Health Score", 50, scoreY + 55, { width: 120, align: "center" });

      // AI Observation
      doc.fillColor("#333").fontSize(11).font("Helvetica-Bold").text("AI Observation:", 190, scoreY);
      doc.font("Helvetica").fontSize(10).fillColor("#555");
      const insight = score >= 80 
        ? "Your health indicators are currently in the optimal range. Keep maintaining your lifestyle and regular monitoring."
        : score >= 60 
        ? "Overall health is stable. We noticed some minor fluctuations in your vitals. Focus on consistent hydration and balanced diet."
        : "Significant indicators require attention. Your recent logs show elevated risk levels. We strongly recommend scheduling a clinical review.";
      doc.text(insight, 190, scoreY + 18, { width: 350, lineGap: 3 });

      doc.y = scoreY + 100;

      // ── Section: Vitals Table ────────────────────────────────────────
      if (vitals.length > 0) {
        addSectionHeader("Recent Vitals History", "#ffb300");
        
        const tableY = doc.y;
        const colWidths = [80, 100, 80, 80, 80, 75];
        const colX = [60, 140, 240, 320, 400, 480];
        
        // Header
        doc.rect(50, tableY, 495, 20).fill("#f0f4f8");
        doc.fillColor("#0c1524").fontSize(9).font("Helvetica-Bold");
        doc.text("Date", colX[0], tableY + 6);
        doc.text("Blood Pressure", colX[1], tableY + 6);
        doc.text("Heart Rate", colX[2], tableY + 6);
        doc.text("Sugar", colX[3], tableY + 6);
        doc.text("SpO2", colX[4], tableY + 6);
        doc.text("Risk", colX[5], tableY + 6);
        
        let rowY = tableY + 25;
        doc.font("Helvetica").fontSize(9).fillColor("#444");
        
        vitals.slice(0, 8).forEach((v) => {
          const date = new Date(v.createdAt).toLocaleDateString("en-IN");
          const bp = v.bloodPressure ? `${v.bloodPressure.systolic}/${v.bloodPressure.diastolic}` : "--";
          const hr = v.heartRate ? `${v.heartRate} bpm` : "--";
          const sugar = v.bloodSugar ? `${v.bloodSugar.value} mg/dL` : "--";
          const spo2 = v.oxygenSaturation ? `${v.oxygenSaturation}%` : "--";
          const risk = v.mlRisk?.risk_level?.toUpperCase() || "NORMAL";

          doc.text(date, colX[0], rowY);
          doc.text(bp, colX[1], rowY);
          doc.text(hr, colX[2], rowY);
          doc.text(sugar, colX[3], rowY);
          doc.text(spo2, colX[4], rowY);
          
          const rColor = risk === "HIGH" ? "#ff3d71" : risk === "MEDIUM" ? "#ffb300" : "#00ff88";
          doc.fillColor(rColor).font("Helvetica-Bold").text(risk, colX[5], rowY);
          doc.fillColor("#444").font("Helvetica");
          
          rowY += 20;
          doc.moveTo(50, rowY - 5).lineTo(545, rowY - 5).stroke("#eee");
          
          if (rowY > 700) { doc.addPage(); rowY = 50; }
        });
        doc.y = rowY + 10;
      }

      // ── Section: Medications ─────────────────────────────────────────
      if (meds.length > 0) {
        addSectionHeader("Active Medications", "#a78bfa");
        
        meds.forEach((m) => {
          if (doc.y > 720) doc.addPage();
          doc.fillColor("#333").fontSize(11).font("Helvetica-Bold").text(`${m.name} - ${m.dosage}`, 70, doc.y);
          doc.font("Helvetica").fontSize(10).fillColor("#666").text(`${m.frequency} · Purpose: ${m.purpose || "General health"}`, 70, doc.y + 2);
          doc.moveDown(1);
        });
      }

      // ── Section: Consultations ───────────────────────────────────────
      if (user.healthHistory?.length > 0) {
        addSectionHeader("Recent Consultations", "#ff3d71");
        
        user.healthHistory.slice(-5).reverse().forEach((entry) => {
          if (doc.y > 700) doc.addPage();
          const date = new Date(entry.createdAt).toLocaleDateString("en-IN");
          doc.fillColor("#0c1524").fontSize(10).font("Helvetica-Bold").text(`${date} - ${entry.severity} Assessment`, 70, doc.y);
          doc.font("Helvetica").fontSize(9).fillColor("#555")
             .text(`Symptoms: ${entry.symptoms?.join(", ")}`, 70, doc.y + 2);
          if (entry.advice) {
            doc.fillColor("#666").font("Helvetica-Oblique").text(`Advice: ${entry.advice}`, 80, doc.y + 2, { width: 450, align: "justify" });
          }
          doc.moveDown(1);
        });
      }

      // ── Footer ───────────────────────────────────────────────────────
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.rect(0, doc.page.height - 60, doc.page.width, 60).fill("#fcfdfe");
        doc.fillColor("#999").fontSize(8).font("Helvetica")
           .text(
             "⚠️ DISCLAIMER: This report is generated by MediMind for informational purposes only. It is not a clinical diagnosis or medical prescription. Please consult a licensed medical professional for formal medical advice and treatment.",
             50, doc.page.height - 45, { align: "center", width: 495 }
           );
        doc.text(`Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 20, { align: "center", width: 495 });
      }

      doc.end();

      stream.on("finish", () => resolve({ filePath, filename }));
      stream.on("error", reject);
    });
  } catch (err) {
    console.error("PDF Error:", err);
    throw err;
  }
};

module.exports = { generateHealthReport };
