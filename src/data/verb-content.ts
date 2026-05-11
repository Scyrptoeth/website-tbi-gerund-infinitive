export type PatternCategory =
  | "gerund-only"
  | "infinitive-only"
  | "dual-pattern";

export type AcceptedPattern =
  | "gerund"
  | "to-infinitive"
  | "bare-infinitive"
  | "object-to-infinitive";

export type MeaningShiftType =
  | "none-or-minor"
  | "meaning-change"
  | "context-dependent"
  | "special-case";

export type VerbTier = "Core" | "Exam-support" | "Extended";
export type Difficulty = "Basic" | "Medium" | "Advanced";
export type OptionKey = "A" | "B" | "C" | "D";

export type SourceEvidence = {
  sourceType:
    | "official-exam"
    | "dictionary"
    | "grammar-reference"
    | "coursebook"
    | "corpus-note"
    | "internal-note";
  sourceName: string;
  urlOrCitation: string;
  accessedAt: string;
  claimLevel:
    | "grammar-reference"
    | "dictionary-pattern"
    | "exam-official-scope"
    | "exam-appearance-verified";
  sourceNote: string;
};

export type VerbItem = {
  id: string;
  category: PatternCategory;
  verb1: string;
  verb2: string;
  verb3: string;
  meaning: string;
  acceptedPatterns: AcceptedPattern[];
  patternLabel: string;
  meaningShift: MeaningShiftType;
  gerundExample?: string;
  infinitiveExample?: string;
  contrastNote?: string;
  usageNote: string;
  commonMistake: string;
  tier: VerbTier;
  difficulty: Difficulty;
  topic: string;
  sourceEvidence: SourceEvidence[];
};

export type QuizOption = {
  key: OptionKey;
  text: string;
};

export type QuizQuestion = {
  id: string;
  verbId: string;
  type:
    | "completion"
    | "meaning-difference"
    | "error-recognition"
    | "pattern-classification";
  prompt: string;
  options: QuizOption[];
  correctKey: OptionKey;
  explanation: string;
};

export type LearningPackage = {
  id: string;
  title: string;
  description: string;
  order: number;
  verbs: VerbItem[];
  questions: QuizQuestion[];
};

export type ContentStats = {
  total: number;
  gerundOnly: number;
  infinitiveOnly: number;
  dualPattern: number;
  packages: number;
  questions: number;
};

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];
const PACKAGE_SIZE = 10;
const ACCESSED_AT = "2026-05-12";

const categoryLabels: Record<PatternCategory, string> = {
  "gerund-only": "Gerund only",
  "infinitive-only": "To-infinitive only",
  "dual-pattern": "Dual pattern",
};

const defaultEvidence: SourceEvidence[] = [
  {
    sourceType: "grammar-reference",
    sourceName: "Cambridge Dictionary Grammar - Verb patterns",
    urlOrCitation:
      "https://dictionary.cambridge.org/grammar/british-grammar/verb-patterns-verb-infinitive-or-verb-ing",
    accessedAt: ACCESSED_AT,
    claimLevel: "grammar-reference",
    sourceNote:
      "Supports the grammar distinction between -ing forms, to-infinitives, and meaning-shift verbs.",
  },
  {
    sourceType: "grammar-reference",
    sourceName: "British Council LearnEnglish - Verbs followed by -ing or infinitive",
    urlOrCitation:
      "https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/verbs-followed-ing-or-infinitive",
    accessedAt: ACCESSED_AT,
    claimLevel: "grammar-reference",
    sourceNote:
      "Supports beginner-friendly explanation that the second verb form depends on the first verb.",
  },
];

function makeId(prefix: string, verb: string) {
  return `${prefix}-${verb
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function gerundOnly(
  verb1: string,
  verb2: string,
  verb3: string,
  meaning: string,
  topic = "Academic habits",
  tier: VerbTier = "Core",
): VerbItem {
  return {
    id: makeId("gerund", verb1),
    category: "gerund-only",
    verb1,
    verb2,
    verb3,
    meaning,
    acceptedPatterns: ["gerund"],
    patternLabel: `${verb1} + Verb-ing`,
    meaningShift: "none-or-minor",
    gerundExample: `Students should ${verb1} reviewing their answers carefully.`,
    usageNote: `After "${verb1}", use a gerund when another action follows directly.`,
    commonMistake: `Do not use "${verb1} to review" for this direct verb-complement pattern.`,
    tier,
    difficulty: tier === "Core" ? "Basic" : "Medium",
    topic,
    sourceEvidence: defaultEvidence,
  };
}

function infinitiveOnly(
  verb1: string,
  verb2: string,
  verb3: string,
  meaning: string,
  topic = "Planning and intention",
  tier: VerbTier = "Core",
): VerbItem {
  return {
    id: makeId("infinitive", verb1),
    category: "infinitive-only",
    verb1,
    verb2,
    verb3,
    meaning,
    acceptedPatterns: ["to-infinitive"],
    patternLabel: `${verb1} + to + Verb-1`,
    meaningShift: "none-or-minor",
    infinitiveExample: `Students should ${verb1} to review their answers carefully.`,
    usageNote: `After "${verb1}", use a to-infinitive when another action follows directly.`,
    commonMistake: `Do not use "${verb1} reviewing" for this direct verb-complement pattern.`,
    tier,
    difficulty: tier === "Core" ? "Basic" : "Medium",
    topic,
    sourceEvidence: defaultEvidence,
  };
}

function dualPattern(
  verb1: string,
  verb2: string,
  verb3: string,
  meaning: string,
  meaningShift: MeaningShiftType,
  contrastNote: string,
  topic = "Meaning contrast",
  tier: VerbTier = "Exam-support",
  acceptedPatterns: AcceptedPattern[] = ["gerund", "to-infinitive"],
): VerbItem {
  return {
    id: makeId("dual", verb1),
    category: "dual-pattern",
    verb1,
    verb2,
    verb3,
    meaning,
    acceptedPatterns,
    patternLabel: `${verb1} + Verb-ing / to + Verb-1`,
    meaningShift,
    gerundExample: `They ${verb1} reviewing the notes after class.`,
    infinitiveExample: `They ${verb1} to review the notes after class.`,
    contrastNote,
    usageNote:
      meaningShift === "meaning-change"
        ? `With "${verb1}", the gerund and to-infinitive patterns can change the meaning.`
        : `With "${verb1}", both patterns may be possible, but context and emphasis still matter.`,
    commonMistake:
      "Do not assume both forms always have the same meaning; check the context before answering.",
    tier,
    difficulty: meaningShift === "meaning-change" ? "Advanced" : "Medium",
    topic,
    sourceEvidence: defaultEvidence,
  };
}

const gerundVerbs: VerbItem[] = [
  gerundOnly("admit", "admitted", "admitted", "mengakui"),
  gerundOnly("avoid", "avoided", "avoided", "menghindari"),
  gerundOnly("consider", "considered", "considered", "mempertimbangkan"),
  gerundOnly("deny", "denied", "denied", "menyangkal"),
  gerundOnly("enjoy", "enjoyed", "enjoyed", "menikmati"),
  gerundOnly("finish", "finished", "finished", "menyelesaikan"),
  gerundOnly("imagine", "imagined", "imagined", "membayangkan"),
  gerundOnly("mind", "minded", "minded", "keberatan"),
  gerundOnly("miss", "missed", "missed", "merindukan/terlewat"),
  gerundOnly("postpone", "postponed", "postponed", "menunda", "Scheduling"),
  gerundOnly("practice", "practiced", "practiced", "berlatih"),
  gerundOnly("risk", "risked", "risked", "mengambil risiko"),
  gerundOnly("suggest", "suggested", "suggested", "menyarankan"),
  gerundOnly("keep", "kept", "kept", "terus melakukan"),
  gerundOnly("quit", "quit", "quit", "berhenti melakukan"),
  gerundOnly("delay", "delayed", "delayed", "menunda", "Scheduling"),
  gerundOnly("discuss", "discussed", "discussed", "mendiskusikan"),
  gerundOnly("dislike", "disliked", "disliked", "tidak menyukai"),
  gerundOnly("appreciate", "appreciated", "appreciated", "menghargai"),
  gerundOnly("resent", "resented", "resented", "kesal terhadap"),
  gerundOnly("resist", "resisted", "resisted", "menahan/menolak"),
  gerundOnly("mention", "mentioned", "mentioned", "menyebutkan"),
  gerundOnly("involve", "involved", "involved", "melibatkan"),
  gerundOnly("escape", "escaped", "escaped", "lolos dari"),
  gerundOnly("tolerate", "tolerated", "tolerated", "menoleransi"),
  gerundOnly("anticipate", "anticipated", "anticipated", "mengantisipasi", "Academic planning", "Exam-support"),
  gerundOnly("justify", "justified", "justified", "membenarkan", "Academic argument", "Exam-support"),
  gerundOnly("recommend", "recommended", "recommended", "merekomendasikan", "Advice", "Exam-support"),
  gerundOnly("report", "reported", "reported", "melaporkan", "Academic reporting", "Exam-support"),
  gerundOnly("resume", "resumed", "resumed", "melanjutkan", "Process", "Exam-support"),
];

const infinitiveVerbs: VerbItem[] = [
  infinitiveOnly("agree", "agreed", "agreed", "setuju"),
  infinitiveOnly("afford", "afforded", "afforded", "mampu membayar/melakukan"),
  infinitiveOnly("arrange", "arranged", "arranged", "mengatur"),
  infinitiveOnly("ask", "asked", "asked", "meminta"),
  infinitiveOnly("choose", "chose", "chosen", "memilih"),
  infinitiveOnly("decide", "decided", "decided", "memutuskan"),
  infinitiveOnly("demand", "demanded", "demanded", "menuntut"),
  infinitiveOnly("deserve", "deserved", "deserved", "pantas mendapatkan"),
  infinitiveOnly("expect", "expected", "expected", "mengharapkan"),
  infinitiveOnly("fail", "failed", "failed", "gagal"),
  infinitiveOnly("hope", "hoped", "hoped", "berharap"),
  infinitiveOnly("intend", "intended", "intended", "bermaksud"),
  infinitiveOnly("learn", "learned", "learned", "belajar"),
  infinitiveOnly("manage", "managed", "managed", "berhasil"),
  infinitiveOnly("offer", "offered", "offered", "menawarkan"),
  infinitiveOnly("plan", "planned", "planned", "merencanakan"),
  infinitiveOnly("prepare", "prepared", "prepared", "bersiap"),
  infinitiveOnly("pretend", "pretended", "pretended", "berpura-pura"),
  infinitiveOnly("promise", "promised", "promised", "berjanji"),
  infinitiveOnly("refuse", "refused", "refused", "menolak"),
  infinitiveOnly("seem", "seemed", "seemed", "tampak"),
  infinitiveOnly("tend", "tended", "tended", "cenderung"),
  infinitiveOnly("threaten", "threatened", "threatened", "mengancam"),
  infinitiveOnly("want", "wanted", "wanted", "ingin"),
  infinitiveOnly("wish", "wished", "wished", "berharap/ingin"),
  infinitiveOnly("aim", "aimed", "aimed", "bertujuan", "Academic goals", "Exam-support"),
  infinitiveOnly("claim", "claimed", "claimed", "mengklaim", "Academic argument", "Exam-support"),
  infinitiveOnly("consent", "consented", "consented", "menyetujui", "Formal agreement", "Exam-support"),
  infinitiveOnly("struggle", "struggled", "struggled", "berjuang/kesulitan", "Problem solving", "Exam-support"),
  infinitiveOnly("volunteer", "volunteered", "volunteered", "sukarela menawarkan diri", "Workplace", "Exam-support"),
];

const dualVerbs: VerbItem[] = [
  dualPattern("begin", "began", "begun", "mulai", "none-or-minor", "Both forms can mean the action starts; the difference is usually small.", "Starting actions"),
  dualPattern("start", "started", "started", "mulai", "none-or-minor", "Both forms can mean the action starts; context decides emphasis.", "Starting actions"),
  dualPattern("continue", "continued", "continued", "melanjutkan", "none-or-minor", "Both forms can show that an action continues.", "Process"),
  dualPattern("like", "liked", "liked", "menyukai", "none-or-minor", "The gerund often emphasizes enjoyment of the activity; the infinitive can emphasize preference or habit.", "Preference"),
  dualPattern("love", "loved", "loved", "sangat menyukai", "none-or-minor", "The difference is often emphasis, not basic meaning.", "Preference"),
  dualPattern("hate", "hated", "hated", "membenci/tidak suka", "none-or-minor", "The gerund can emphasize the activity; the infinitive can emphasize the result or situation.", "Preference"),
  dualPattern("prefer", "preferred", "preferred", "lebih memilih", "none-or-minor", "Both patterns are possible, but formal comparison structures must stay parallel.", "Preference"),
  dualPattern("bother", "bothered", "bothered", "repot-repot", "none-or-minor", "Both forms can be used, often in negative contexts such as do not bother.", "Effort"),
  dualPattern("cease", "ceased", "ceased", "berhenti", "none-or-minor", "Both patterns can occur in formal English.", "Formal process"),
  dualPattern("intend", "intended", "intended", "bermaksud", "none-or-minor", "The to-infinitive is more common, but the gerund pattern also occurs in some varieties.", "Intention"),
  dualPattern("attempt", "attempted", "attempted", "mencoba", "none-or-minor", "The to-infinitive is common; gerund use is possible in some contexts but less central.", "Effort", "Extended"),
  dualPattern("propose", "proposed", "proposed", "mengusulkan/berniat", "context-dependent", "Propose doing means suggesting an action; propose to do can mean intending or offering to do it.", "Advice", "Exam-support"),
  dualPattern("stop", "stopped", "stopped", "berhenti", "meaning-change", "Stop doing means end the activity; stop to do means pause in order to do another activity."),
  dualPattern("remember", "remembered", "remembered", "ingat", "meaning-change", "Remember doing means recall a past action; remember to do means not forget a future duty."),
  dualPattern("forget", "forgot", "forgotten", "lupa", "meaning-change", "Forget doing means not remember a past action; forget to do means fail to do a duty."),
  dualPattern("regret", "regretted", "regretted", "menyesal/memberitahukan dengan berat hati", "meaning-change", "Regret doing means feel sorry about a past action; regret to say/inform introduces bad news."),
  dualPattern("try", "tried", "tried", "mencoba", "meaning-change", "Try doing means test a method; try to do means make an effort or attempt."),
  dualPattern("mean", "meant", "meant", "berarti/bermaksud", "meaning-change", "Mean doing means involve or result in; mean to do means intend to do."),
  dualPattern("go on", "went on", "gone on", "melanjutkan", "meaning-change", "Go on doing means continue the same action; go on to do means move to the next action."),
  dualPattern("need", "needed", "needed", "perlu", "special-case", "Need to do is active necessity; need doing can have passive-like meaning in British English.", "Special patterns"),
  dualPattern("want", "wanted", "wanted", "ingin/perlu", "special-case", "Want to do expresses desire; want doing can be passive-like in some informal varieties.", "Special patterns", "Extended"),
  dualPattern("help", "helped", "helped", "membantu", "special-case", "Help can take a bare infinitive or to-infinitive; do not force it into the gerund/to-infinitive binary.", "Special patterns", "Core", ["bare-infinitive", "to-infinitive", "object-to-infinitive"]),
  dualPattern("advise", "advised", "advised", "menasihati", "context-dependent", "Advise doing is possible generally; advise someone to do uses object + to-infinitive.", "Advice", "Exam-support", ["gerund", "object-to-infinitive"]),
  dualPattern("allow", "allowed", "allowed", "mengizinkan", "context-dependent", "Allow doing can refer to permission generally; allow someone to do uses object + to-infinitive.", "Permission", "Exam-support", ["gerund", "object-to-infinitive"]),
  dualPattern("permit", "permitted", "permitted", "mengizinkan", "context-dependent", "Permit doing and permit someone to do differ by structure.", "Permission", "Exam-support", ["gerund", "object-to-infinitive"]),
  dualPattern("forbid", "forbade", "forbidden", "melarang", "context-dependent", "Forbid doing and forbid someone to do differ by structure and object.", "Rules", "Exam-support", ["gerund", "object-to-infinitive"]),
  dualPattern("encourage", "encouraged", "encouraged", "mendorong", "context-dependent", "Encourage doing can discuss a practice; encourage someone to do uses object + to-infinitive.", "Advice", "Exam-support", ["gerund", "object-to-infinitive"]),
  dualPattern("dread", "dreaded", "dreaded", "sangat takut/enggan", "context-dependent", "Dread doing is common for feared activities; dread to think/say is a fixed formal pattern.", "Emotion", "Extended"),
  dualPattern("bear", "bore", "borne", "tahan/sanggup", "context-dependent", "Cannot bear doing and cannot bear to do are both used; context and idiom matter.", "Emotion", "Extended"),
  dualPattern("neglect", "neglected", "neglected", "lalai", "context-dependent", "Neglect to do is common for failing a duty; gerund contexts need careful review.", "Duty", "Extended"),
];

export const verbs: VerbItem[] = [
  ...gerundVerbs,
  ...infinitiveVerbs,
  ...dualVerbs,
];

function makeOptions(correctKey: OptionKey, options: Record<OptionKey, string>) {
  return OPTION_KEYS.map((key) => ({
    key,
    text: options[key],
  })).map((option) =>
    option.key === correctKey ? option : { ...option, text: option.text },
  );
}

function createQuestion(verb: VerbItem, index: number): QuizQuestion {
  if (verb.category === "gerund-only") {
    return {
      id: `q-${verb.id}`,
      verbId: verb.id,
      type: "completion",
      prompt: `Pilih kalimat yang paling tepat untuk pola "${verb.verb1}".`,
      options: makeOptions("A", {
        A: `They ${verb.verb1} reviewing the answer sheet.`,
        B: `They ${verb.verb1} to review the answer sheet.`,
        C: `They ${verb.verb1} review the answer sheet yesterday.`,
        D: `They ${verb.verb1} reviewed to the answer sheet.`,
      }),
      correctKey: "A",
      explanation: `Jawaban benar A. "${verb.verb1}" termasuk pola ${verb.patternLabel}, sehingga verb berikutnya memakai bentuk -ing. Opsi B adalah distraktor umum karena memakai to-infinitive.`,
    };
  }

  if (verb.category === "infinitive-only") {
    return {
      id: `q-${verb.id}`,
      verbId: verb.id,
      type: "completion",
      prompt: `Pilih kalimat yang paling tepat untuk pola "${verb.verb1}".`,
      options: makeOptions("B", {
        A: `They ${verb.verb1} reviewing the answer sheet.`,
        B: `They ${verb.verb1} to review the answer sheet.`,
        C: `They ${verb.verb1} reviewed the answer sheet.`,
        D: `They ${verb.verb1} review to the answer sheet.`,
      }),
      correctKey: "B",
      explanation: `Jawaban benar B. "${verb.verb1}" termasuk pola ${verb.patternLabel}, sehingga verb berikutnya memakai to + Verb-1. Opsi A keliru untuk pola direct complement ini.`,
    };
  }

  const correctKey: OptionKey = index % 2 === 0 ? "D" : "C";
  const correctText =
    verb.meaningShift === "meaning-change"
      ? "Gerund dan to-infinitive bisa sama-sama benar, tetapi maknanya dapat berbeda."
      : "Gerund dan to-infinitive bisa sama-sama benar dalam konteks tertentu.";

  return {
    id: `q-${verb.id}`,
    verbId: verb.id,
    type:
      verb.meaningShift === "meaning-change"
        ? "meaning-difference"
        : "pattern-classification",
    prompt: `Pernyataan mana yang paling akurat tentang pola "${verb.verb1}"?`,
    options: makeOptions(correctKey, {
      A: `"${verb.verb1}" hanya boleh diikuti gerund dalam semua konteks.`,
      B: `"${verb.verb1}" hanya boleh diikuti to-infinitive dalam semua konteks.`,
      C: correctKey === "C" ? correctText : "Kedua pola selalu salah setelah verb ini.",
      D: correctKey === "D" ? correctText : "Bentuk Verb-2 harus dipakai setelah verb ini.",
    }),
    correctKey,
    explanation: `Jawaban benar ${correctKey}. "${verb.verb1}" adalah dual-pattern item. ${verb.contrastNote ?? verb.usageNote}`,
  };
}

export const questions: QuizQuestion[] = verbs.map(createQuestion);

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export const learningPackages: LearningPackage[] = chunk(verbs, PACKAGE_SIZE).map(
  (packageVerbs, index) => {
    const order = index + 1;
    const packageQuestions = packageVerbs.map((verb) =>
      questions.find((question) => question.verbId === verb.id),
    );

    return {
      id: `pattern-package-${String(order).padStart(2, "0")}`,
      title: `Pattern Practice ${String(order).padStart(2, "0")}`,
      description:
        "Mixed package untuk melatih gerund-only, infinitive-only, dan dual-pattern tanpa membocorkan jawaban dari label paket.",
      order,
      verbs: packageVerbs,
      questions: packageQuestions.filter((question): question is QuizQuestion =>
        Boolean(question),
      ),
    };
  },
);

export const contentStats: ContentStats = {
  total: verbs.length,
  gerundOnly: verbs.filter((verb) => verb.category === "gerund-only").length,
  infinitiveOnly: verbs.filter((verb) => verb.category === "infinitive-only")
    .length,
  dualPattern: verbs.filter((verb) => verb.category === "dual-pattern").length,
  packages: learningPackages.length,
  questions: questions.length,
};

export function getCategoryLabel(category: PatternCategory) {
  return categoryLabels[category];
}

export function getVerbById(id: string) {
  return verbs.find((verb) => verb.id === id);
}

export function validateVerbContent() {
  const ids = new Set<string>();
  const questionsByVerb = new Set<string>();

  if (verbs.length !== 90) {
    throw new Error(`Expected 90 curated MVP verbs, received ${verbs.length}.`);
  }

  if (
    contentStats.gerundOnly !== 30 ||
    contentStats.infinitiveOnly !== 30 ||
    contentStats.dualPattern !== 30
  ) {
    throw new Error("Expected 30 verbs in each pattern category.");
  }

  for (const verb of verbs) {
    if (ids.has(verb.id)) {
      throw new Error(`Duplicate verb id: ${verb.id}`);
    }

    ids.add(verb.id);

    if (!verb.verb1 || !verb.verb2 || !verb.verb3 || !verb.meaning) {
      throw new Error(`Incomplete verb forms for ${verb.id}`);
    }

    if (!verb.patternLabel || !verb.usageNote || !verb.commonMistake) {
      throw new Error(`Missing learning metadata for ${verb.id}`);
    }

    if (verb.category === "dual-pattern" && !verb.contrastNote) {
      throw new Error(`Dual-pattern verb lacks contrast note: ${verb.id}`);
    }

    if (verb.sourceEvidence.length === 0) {
      throw new Error(`Missing source evidence for ${verb.id}`);
    }
  }

  for (const question of questions) {
    if (!ids.has(question.verbId)) {
      throw new Error(`Question references unknown verb: ${question.id}`);
    }

    if (questionsByVerb.has(question.verbId)) {
      throw new Error(`Duplicate question for verb: ${question.verbId}`);
    }

    questionsByVerb.add(question.verbId);

    if (question.options.length !== 4) {
      throw new Error(`Question must have four options: ${question.id}`);
    }

    if (question.options.some((option, index) => option.key !== OPTION_KEYS[index])) {
      throw new Error(`Question option keys must be A-D: ${question.id}`);
    }

    if (!question.options.some((option) => option.key === question.correctKey)) {
      throw new Error(`Correct key missing from options: ${question.id}`);
    }

    if (!question.explanation.includes(`Jawaban benar ${question.correctKey}`)) {
      throw new Error(`Explanation must cite correct key: ${question.id}`);
    }
  }

  for (const learningPackage of learningPackages) {
    if (learningPackage.verbs.length !== PACKAGE_SIZE) {
      throw new Error(`Package size mismatch: ${learningPackage.id}`);
    }

    if (learningPackage.questions.length !== PACKAGE_SIZE) {
      throw new Error(`Question package size mismatch: ${learningPackage.id}`);
    }
  }
}

validateVerbContent();
