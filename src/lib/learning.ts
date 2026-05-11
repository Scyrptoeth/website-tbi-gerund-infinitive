export type VerbLike = {
  id?: string | number;
  base?: string;
  infinitive?: string;
  present?: string;
  verb1?: string;
  verb2?: string;
  verb3?: string;
  past?: string;
  pastSimple?: string;
  pastParticiple?: string;
  participle?: string;
  meaning?: string;
  translation?: string;
  type?: string;
  category?: string;
  level?: string;
  packageId?: string | number;
  packageName?: string;
  tags?: string[];
};

export type ProgressEntry = {
  attempts: number;
  correct: number;
  lastPracticedAt?: string;
  mastered?: boolean;
};

export type ProgressMap = Record<string, ProgressEntry>;

export type ProgressStats = {
  total: number;
  practiced: number;
  unpracticed: number;
  mastered: number;
  attempts: number;
  correct: number;
  accuracy: number;
  completionRate: number;
  masteryRate: number;
};

export type PackageGroup<T extends VerbLike> = {
  id: string;
  name: string;
  items: T[];
  count: number;
};

export type QuizAnswer = {
  promptId: string | number;
  expected: string | string[];
  actual: string;
};

export type QuizResult = {
  total: number;
  correct: number;
  incorrect: number;
  score: number;
  details: Array<QuizAnswer & { isCorrect: boolean }>;
};

const EMPTY_PROGRESS: ProgressEntry = {
  attempts: 0,
  correct: 0,
};

export function getVerbId(verb: VerbLike): string {
  return String(verb.id ?? verb.base ?? verb.infinitive ?? verb.present ?? "");
}

export function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function calculateProgressStats<T extends VerbLike>(
  verbs: T[],
  progress: ProgressMap = {},
): ProgressStats {
  const total = verbs.length;
  let practiced = 0;
  let mastered = 0;
  let attempts = 0;
  let correct = 0;

  for (const verb of verbs) {
    const entry = progress[getVerbId(verb)] ?? EMPTY_PROGRESS;
    attempts += Math.max(0, entry.attempts || 0);
    correct += Math.max(0, entry.correct || 0);

    if ((entry.attempts || 0) > 0) {
      practiced += 1;
    }

    if (entry.mastered) {
      mastered += 1;
    }
  }

  return {
    total,
    practiced,
    unpracticed: Math.max(0, total - practiced),
    mastered,
    attempts,
    correct,
    accuracy: attempts === 0 ? 0 : correct / attempts,
    completionRate: total === 0 ? 0 : practiced / total,
    masteryRate: total === 0 ? 0 : mastered / total,
  };
}

export function filterVerbs<T extends VerbLike>(verbs: T[], query: string): T[] {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return verbs;
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return verbs.filter((verb) => {
    const searchableText = normalizeText(
      [
        verb.base,
        verb.infinitive,
        verb.present,
        verb.verb1,
        verb.verb2,
        verb.verb3,
        verb.past,
        verb.pastSimple,
        verb.pastParticiple,
        verb.participle,
        verb.meaning,
        verb.translation,
        verb.type,
        verb.category,
        verb.level,
        verb.packageName,
        ...(verb.tags ?? []),
      ].join(" "),
    );

    return terms.every((term) => searchableText.includes(term));
  });
}

export function groupVerbsByPackage<T extends VerbLike>(
  verbs: T[],
): PackageGroup<T>[] {
  const groups = new Map<string, PackageGroup<T>>();

  for (const verb of verbs) {
    const id = String(verb.packageId ?? verb.category ?? "default");
    const name = String(verb.packageName ?? verb.category ?? "All Verbs");
    const existing = groups.get(id);

    if (existing) {
      existing.items.push(verb);
      existing.count = existing.items.length;
    } else {
      groups.set(id, {
        id,
        name,
        items: [verb],
        count: 1,
      });
    }
  }

  return Array.from(groups.values());
}

export function scoreQuiz(answers: QuizAnswer[]): QuizResult {
  const details = answers.map((answer) => {
    const actual = normalizeText(answer.actual);
    const expected = Array.isArray(answer.expected)
      ? answer.expected
      : [answer.expected];
    const isCorrect = expected.some((value) => normalizeText(value) === actual);

    return {
      ...answer,
      isCorrect,
    };
  });

  const correct = details.filter((answer) => answer.isCorrect).length;
  const total = answers.length;

  return {
    total,
    correct,
    incorrect: total - correct,
    score: total === 0 ? 0 : correct / total,
    details,
  };
}

export function applyQuizResultToProgress(
  progress: ProgressMap,
  result: QuizResult,
  masteredThreshold = 3,
): ProgressMap {
  const practicedAt = new Date().toISOString();
  const nextProgress: ProgressMap = { ...progress };

  for (const answer of result.details) {
    const id = String(answer.promptId);
    const previous = nextProgress[id] ?? EMPTY_PROGRESS;
    const correct = previous.correct + (answer.isCorrect ? 1 : 0);

    nextProgress[id] = {
      attempts: previous.attempts + 1,
      correct,
      lastPracticedAt: practicedAt,
      mastered: correct >= masteredThreshold,
    };
  }

  return nextProgress;
}
