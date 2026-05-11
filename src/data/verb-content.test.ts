import { describe, expect, it } from "vitest";
import {
  contentStats,
  learningPackages,
  questions,
  validateVerbContent,
  verbs,
} from "./verb-content";

describe("gerund and infinitive content integrity", () => {
  it("passes the import-time content contract", () => {
    expect(() => validateVerbContent()).not.toThrow();
  });

  it("ships a balanced quality-first MVP bank", () => {
    expect(contentStats.total).toBe(90);
    expect(contentStats.gerundOnly).toBe(30);
    expect(contentStats.infinitiveOnly).toBe(30);
    expect(contentStats.dualPattern).toBe(30);
    expect(verbs).toHaveLength(90);
  });

  it("keeps required learning metadata complete", () => {
    const ids = new Set(verbs.map((verb) => verb.id));

    expect(ids.size).toBe(verbs.length);

    for (const verb of verbs) {
      expect(verb.verb1).toBeTruthy();
      expect(verb.verb2).toBeTruthy();
      expect(verb.verb3).toBeTruthy();
      expect(verb.meaning).toBeTruthy();
      expect(verb.acceptedPatterns.length).toBeGreaterThan(0);
      expect(verb.patternLabel).toBeTruthy();
      expect(verb.usageNote).toBeTruthy();
      expect(verb.commonMistake).toBeTruthy();
      expect(verb.sourceEvidence.length).toBeGreaterThan(0);

      if (verb.category === "dual-pattern") {
        expect(verb.contrastNote).toBeTruthy();
      }
    }
  });

  it("keeps every quiz question answerable and explained", () => {
    const verbIds = new Set(verbs.map((verb) => verb.id));

    expect(questions).toHaveLength(90);

    for (const question of questions) {
      expect(verbIds.has(question.verbId)).toBe(true);
      expect(question.options).toHaveLength(4);
      expect(question.options.map((option) => option.key)).toEqual([
        "A",
        "B",
        "C",
        "D",
      ]);
      expect(
        question.options.some((option) => option.key === question.correctKey),
      ).toBe(true);
      expect(question.explanation).toContain(`Jawaban benar ${question.correctKey}`);
    }
  });

  it("creates stable ten-question mixed packages", () => {
    expect(learningPackages).toHaveLength(9);

    for (const learningPackage of learningPackages) {
      expect(learningPackage.verbs).toHaveLength(10);
      expect(learningPackage.questions).toHaveLength(10);
      expect(learningPackage.description).toContain("Mixed package");
    }
  });
});
