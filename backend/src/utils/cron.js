const cron = require("node-cron");
const Medication = require("../services/vitals-service/Medication");
const User = require("../models/User");
const alertService = require("../services/notification-service/alertService");

const setupCronJobs = () => {
  // Run every minute to check for due medications
  cron.schedule("* * * * *", async () => {
    try {
      // Get current time in HH:mm format
      const now = new Date();
      // Format correctly based on local time (e.g. 08:00)
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const currentTimeStr = `${hours}:${minutes}`;

      // Find medications with reminder enabled and matching timing
      const dueMedications = await Medication.find({
        reminderEnabled: true,
        timing: currentTimeStr,
        isActive: true,
      }).populate("userId", "name phone");

      if (dueMedications.length > 0) {
        console.log(`[CRON] Found ${dueMedications.length} medications due at ${currentTimeStr}`);
      }

      for (const med of dueMedications) {
        const user = med.userId;
        if (user && user.phone) {
          await alertService.sendReminderSMS(user.phone, user.name, med.name, med.dosage);
        }
      }
    } catch (error) {
      console.error("[CRON] Error running medication reminders:", error.message);
    }
  });

  console.log("⏰ Cron jobs initialized: Medication Reminders");
};

module.exports = setupCronJobs;
