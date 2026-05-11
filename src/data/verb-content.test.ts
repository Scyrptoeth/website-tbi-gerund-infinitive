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

  it("ships a balanced 300-entry verb bank", () => {
    expect(contentStats.total).toBe(300);
    expect(contentStats.gerundOnly).toBe(100);
    expect(contentStats.infinitiveOnly).toBe(100);
    expect(contentStats.dualPattern).toBe(100);
    expect(verbs).toHaveLength(300);
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
        expect(verb.acceptedPatterns.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("keeps every quiz question answerable and explained", () => {
    const verbIds = new Set(verbs.map((verb) => verb.id));
    const answerDistribution = new Map([["A", 0], ["B", 0], ["C", 0], ["D", 0]]);

    expect(questions).toHaveLength(300);

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
      expect(question.prompt).not.toMatch(/gerund-only|infinitive-only|dual-pattern/i);

      answerDistribution.set(
        question.correctKey,
        (answerDistribution.get(question.correctKey) ?? 0) + 1,
      );
    }

    for (const count of answerDistribution.values()) {
      expect(count).toBeGreaterThanOrEqual(60);
    }
  });

  it("creates stable ten-question mixed packages", () => {
    expect(learningPackages).toHaveLength(30);

    for (const learningPackage of learningPackages) {
      expect(learningPackage.verbs).toHaveLength(10);
      expect(learningPackage.questions).toHaveLength(10);
      expect(learningPackage.description).toContain("Mixed package");

      expect(new Set(learningPackage.verbs.map((verb) => verb.category)).size).toBe(3);
    }
  });
});
