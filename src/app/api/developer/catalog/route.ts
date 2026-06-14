import { requireAdmin } from "@/lib/admin-auth";
import { learningPackages, questions, verbs } from "@/data/verb-content";

export async function GET() {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  return Response.json({
    verbs: verbs.map((verb) => ({
      id: verb.id,
      category: verb.category,
      label: `${verb.verb1} - ${verb.verb2} - ${verb.verb3}`,
      verb1: verb.verb1,
      verb2: verb.verb2,
      verb3: verb.verb3,
      meaning: verb.meaning,
      patternLabel: verb.patternLabel,
      topic: verb.topic,
      usageNote: verb.usageNote,
      contrastNote: verb.contrastNote ?? "",
      commonMistake: verb.commonMistake,
    })),
    questions: questions.map((question, index) => ({
      id: question.id,
      verbId: question.verbId,
      number: index + 1,
      prompt: question.prompt,
      options: question.options,
      correctKey: question.correctKey,
      explanation: question.explanation,
      verbLabel:
        verbs.find((verb) => verb.id === question.verbId)?.verb1 ?? question.verbId,
    })),
    packages: learningPackages.map((learningPackage) => ({
      id: learningPackage.id,
      title: learningPackage.title,
      order: learningPackage.order,
    })),
  });
}
