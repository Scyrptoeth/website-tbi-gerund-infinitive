import type { QuizQuestion, VerbItem } from "@/data/verb-content";

export type CmsSiteSettings = {
  searchTitle?: string;
  searchPlaceholder?: string;
};

export type CmsPublicPayload = {
  configured: boolean;
  settings: CmsSiteSettings;
  verbs: Array<Partial<VerbItem> & { id: string }>;
  questions: Array<Partial<QuizQuestion> & { id: string }>;
};

export const emptyCmsPayload: CmsPublicPayload = {
  configured: false,
  settings: {},
  verbs: [],
  questions: [],
};

function mergeById<T extends { id: string }>(
  baseItems: T[],
  overrides: Array<Partial<T> & { id: string }>,
) {
  const overrideMap = new Map(overrides.map((override) => [override.id, override]));

  return baseItems.map((item) => ({
    ...item,
    ...(overrideMap.get(item.id) ?? {}),
  }));
}

export function applyVerbOverrides(
  baseVerbs: VerbItem[],
  overrides: CmsPublicPayload["verbs"],
) {
  return mergeById(baseVerbs, overrides);
}

export function applyQuestionOverrides(
  baseQuestions: QuizQuestion[],
  overrides: CmsPublicPayload["questions"],
) {
  return mergeById(baseQuestions, overrides);
}
