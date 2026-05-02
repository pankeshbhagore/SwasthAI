/**
 * MediMind Triage Engine Tests
 * Run: cd backend && npm test
 */

const { performTriage, calculateSymptomScore } = require("../services/triage-service/triageEngine");

describe("Triage Engine", () => {

  describe("calculateSymptomScore", () => {
    test("returns 0 for empty symptoms", () => {
      const { score } = calculateSymptomScore([]);
      expect(score).toBe(0);
    });

    test("correctly scores critical symptom", () => {
      const { score } = calculateSymptomScore(["chest pain"]);
      expect(score).toBeGreaterThanOrEqual(50);
    });

    test("correctly scores mild symptom", () => {
      const { score } = calculateSymptomScore(["cold"]);
      expect(score).toBeLessThan(20);
    });

    test("accumulates score for multiple symptoms", () => {
      const { score: single } = calculateSymptomScore(["fever"]);
      const { score: multiple } = calculateSymptomScore(["fever", "vomiting"]);
      expect(multiple).toBeGreaterThan(single);
    });
  });

  describe("performTriage", () => {
    test("returns EMERGENCY for chest pain", () => {
      const result = performTriage(["chest pain"]);
      expect(result.severity).toBe("EMERGENCY");
      expect(result.emergency).toBe(true);
    });

    test("returns EMERGENCY for breathing difficulty", () => {
      const result = performTriage(["breathing difficulty"]);
      expect(result.severity).toBe("EMERGENCY");
    });

    test("returns MODERATE for high fever with headache", () => {
      const result = performTriage(["high fever", "severe headache"]);
      expect(["MODERATE", "EMERGENCY"]).toContain(result.severity);
    });

    test("returns MILD for cold symptoms", () => {
      const result = performTriage(["cold", "runny nose"]);
      expect(result.severity).toBe("MILD");
      expect(result.emergency).toBe(false);
    });

    test("applies age modifier for elderly patients", () => {
      const adult = performTriage(["fever"], 30);
      const elderly = performTriage(["fever"], 70);
      expect(elderly.score).toBeGreaterThan(adult.score);
    });

    test("applies age modifier for infants", () => {
      const adult = performTriage(["fever"], 30);
      const infant = performTriage(["fever"], 1);
      expect(infant.score).toBeGreaterThan(adult.score);
    });

    test("returns possible conditions", () => {
      const result = performTriage(["cough", "fever", "cold"]);
      expect(Array.isArray(result.possible_conditions)).toBe(true);
    });

    test("handles empty symptoms gracefully", () => {
      const result = performTriage([]);
      expect(result.severity).toBe("NORMAL");
      expect(result.emergency).toBe(false);
    });

    test("handles null input gracefully", () => {
      const result = performTriage(null);
      expect(result.severity).toBe("NORMAL");
    });

    test("stroke triggers EMERGENCY", () => {
      const result = performTriage(["stroke"]);
      expect(result.severity).toBe("EMERGENCY");
    });

    test("returns advice string", () => {
      const result = performTriage(["headache"]);
      expect(typeof result.advice).toBe("string");
      expect(result.advice.length).toBeGreaterThan(0);
    });
  });

  describe("Risk Factors", () => {
    test("chronic conditions increase severity score", () => {
      const withoutHistory = performTriage(["fever"], 40, []);
      const withHistory = performTriage(["fever"], 40, ["diabetes", "heart_disease"]);
      expect(withHistory.score).toBeGreaterThan(withoutHistory.score);
    });
  });

});
