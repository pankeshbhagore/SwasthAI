const { calculateHealthScore, getSeverityColor, generateToken } = require("../shared/utils/helpers");

describe("Helper Utilities", () => {

  describe("calculateHealthScore", () => {
    test("returns 75 for empty history", () => {
      expect(calculateHealthScore([])).toBe(75);
      expect(calculateHealthScore(null)).toBe(75);
    });

    test("reduces score for EMERGENCY entries", () => {
      const history = [{ severity: "EMERGENCY" }];
      expect(calculateHealthScore(history)).toBeLessThan(100);
      expect(calculateHealthScore(history)).toBeGreaterThan(0);
    });

    test("score never goes below 0", () => {
      const history = Array(20).fill({ severity: "EMERGENCY" });
      expect(calculateHealthScore(history)).toBeGreaterThanOrEqual(0);
    });

    test("score never exceeds 100", () => {
      const history = Array(20).fill({ severity: "NORMAL" });
      expect(calculateHealthScore(history)).toBeLessThanOrEqual(100);
    });

    test("MILD reduces score less than EMERGENCY", () => {
      const mild = calculateHealthScore([{ severity: "MILD" }]);
      const emergency = calculateHealthScore([{ severity: "EMERGENCY" }]);
      expect(mild).toBeGreaterThan(emergency);
    });
  });

  describe("getSeverityColor", () => {
    test("returns red for EMERGENCY", () => {
      expect(getSeverityColor("EMERGENCY")).toBe("#ef4444");
    });

    test("returns green for MILD", () => {
      expect(getSeverityColor("MILD")).toBe("#22c55e");
    });

    test("returns default for unknown severity", () => {
      const color = getSeverityColor("UNKNOWN");
      expect(typeof color).toBe("string");
      expect(color).toMatch(/^#/);
    });
  });

});
