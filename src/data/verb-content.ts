export type PatternCategory =
  | "gerund-only"
  | "infinitive-only"
  | "dual-pattern";

export type AcceptedPattern =
  | "gerund"
  | "to-infinitive"
  | "bare-infinitive"
  | "object-to-infinitive"
  | "object-gerund"
  | "object-bare-infinitive"
  | "preposition-gerund"
  | "passive-to-infinitive"
  | "used-to-infinitive"
  | "gerund-passive";

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
const CATEGORY_TARGET = 100;
const TOTAL_TARGET = CATEGORY_TARGET * 3;
const ACCESSED_AT = "2026-05-12";

const categoryLabels: Record<PatternCategory, string> = {
  "gerund-only": "Gerund only",
  "infinitive-only": "To-infinitive only",
  "dual-pattern": "Dual pattern",
};

const defaultEvidence: SourceEvidence[] = [
  {
    sourceType: "grammar-reference",
    sourceName: "Cambridge English - Patterns after verbs",
    urlOrCitation:
      "https://www.cambridgeenglish.org/tw/Images/525578-patterns-after-verbs.pdf",
    accessedAt: ACCESSED_AT,
    claimLevel: "grammar-reference",
    sourceNote:
      "Supports learning verb patterns as item-specific grammar, including -ing forms, to-infinitives, object + infinitive, and dictionary checking.",
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
  {
    sourceType: "grammar-reference",
    sourceName: "British Council LearnEnglish - Verbs followed by the -ing form",
    urlOrCitation:
      "https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/verbs-followed-ing-form",
    accessedAt: ACCESSED_AT,
    claimLevel: "grammar-reference",
    sourceNote:
      "Supports common -ing patterns, object + -ing patterns, and the need to distinguish similar verb structures.",
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

function objectInfinitiveOnly(
  verb1: string,
  verb2: string,
  verb3: string,
  meaning: string,
  topic = "Direction and influence",
  tier: VerbTier = "Exam-support",
): VerbItem {
  return {
    id: makeId("infinitive", verb1),
    category: "infinitive-only",
    verb1,
    verb2,
    verb3,
    meaning,
    acceptedPatterns: ["object-to-infinitive"],
    patternLabel: `${verb1} + object + to + Verb-1`,
    meaningShift: "none-or-minor",
    infinitiveExample: `Teachers can ${verb1} students to review their answers carefully.`,
    usageNote: `After "${verb1}", use object + to-infinitive when the next action is done by that object.`,
    commonMistake: `Do not drop the object in the pattern "${verb1} someone to review".`,
    tier,
    difficulty: tier === "Core" ? "Basic" : "Medium",
    topic,
    sourceEvidence: defaultEvidence,
  };
}

function formatDualPatternLabel(
  verb1: string,
  acceptedPatterns: AcceptedPattern[],
) {
  const labels: string[] = [];

  if (acceptedPatterns.includes("gerund")) {
    labels.push("Verb-ing");
  }

  if (acceptedPatterns.includes("to-infinitive")) {
    labels.push("to + Verb-1");
  }

  if (acceptedPatterns.includes("bare-infinitive")) {
    labels.push("bare Verb-1");
  }

  if (acceptedPatterns.includes("object-to-infinitive")) {
    labels.push("object + to + Verb-1");
  }

  if (acceptedPatterns.includes("object-gerund")) {
    labels.push("object + Verb-ing");
  }

  if (acceptedPatterns.includes("object-bare-infinitive")) {
    labels.push("object + bare Verb-1");
  }

  if (acceptedPatterns.includes("preposition-gerund")) {
    labels.push("preposition + Verb-ing");
  }

  if (acceptedPatterns.includes("passive-to-infinitive")) {
    labels.push("passive + to + Verb-1");
  }

  if (acceptedPatterns.includes("used-to-infinitive")) {
    labels.push("used to + Verb-1");
  }

  if (acceptedPatterns.includes("gerund-passive")) {
    labels.push("Verb-ing with passive meaning");
  }

  return `${verb1} + ${labels.join(" / ")}`;
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
    patternLabel: formatDualPatternLabel(verb1, acceptedPatterns),
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
  gerundOnly("acknowledge", "acknowledged", "acknowledged", "mengakui", "Academic integrity", "Exam-support"),
  gerundOnly("adore", "adored", "adored", "sangat menyukai", "Preference"),
  gerundOnly("abhor", "abhorred", "abhorred", "sangat membenci", "Emotion", "Extended"),
  gerundOnly("contemplate", "contemplated", "contemplated", "merenungkan", "Planning", "Exam-support"),
  gerundOnly("defer", "deferred", "deferred", "menunda", "Scheduling", "Exam-support"),
  gerundOnly("detest", "detested", "detested", "sangat tidak menyukai", "Emotion"),
  gerundOnly("discontinue", "discontinued", "discontinued", "menghentikan", "Process", "Exam-support"),
  gerundOnly("envisage", "envisaged", "envisaged", "membayangkan/merencanakan", "Planning", "Extended"),
  gerundOnly("envision", "envisioned", "envisioned", "membayangkan", "Planning", "Exam-support"),
  gerundOnly("fancy", "fancied", "fancied", "ingin/suka", "Preference", "Extended"),
  gerundOnly("favor", "favored", "favored", "mendukung/lebih menyukai", "Preference", "Exam-support"),
  gerundOnly("recall", "recalled", "recalled", "mengingat kembali", "Memory", "Exam-support"),
  gerundOnly("recollect", "recollected", "recollected", "mengingat kembali", "Memory", "Extended"),
  gerundOnly("entail", "entailed", "entailed", "memerlukan/berakibat", "Academic argument", "Exam-support"),
  gerundOnly("necessitate", "necessitated", "necessitated", "mengharuskan", "Academic argument", "Extended"),
  gerundOnly("warrant", "warranted", "warranted", "membenarkan/melayakkan", "Academic argument", "Extended"),
  gerundOnly("prohibit", "prohibited", "prohibited", "melarang", "Rules", "Exam-support"),
  gerundOnly("ban", "banned", "banned", "melarang", "Rules"),
  gerundOnly("preclude", "precluded", "precluded", "menghalangi/mencegah", "Academic argument", "Extended"),
  gerundOnly("prevent", "prevented", "prevented", "mencegah", "Rules", "Exam-support"),
  gerundOnly("face", "faced", "faced", "menghadapi", "Problem solving", "Exam-support"),
  gerundOnly("give up", "gave up", "given up", "berhenti/menyerah", "Habits"),
  gerundOnly("put off", "put off", "put off", "menunda", "Scheduling"),
  gerundOnly("carry on", "carried on", "carried on", "terus melakukan", "Process"),
  gerundOnly("end up", "ended up", "ended up", "akhirnya", "Result"),
  gerundOnly("leave off", "left off", "left off", "berhenti melakukan", "Process", "Extended"),
  gerundOnly("look forward to", "looked forward to", "looked forward to", "menantikan", "Future plans"),
  gerundOnly("get around to", "got around to", "gotten around to", "akhirnya sempat", "Scheduling", "Exam-support"),
  gerundOnly("object to", "objected to", "objected to", "keberatan terhadap", "Opinion", "Exam-support"),
  gerundOnly("confess to", "confessed to", "confessed to", "mengaku", "Academic integrity", "Exam-support"),
  gerundOnly("resort to", "resorted to", "resorted to", "terpaksa memakai", "Problem solving", "Exam-support"),
  gerundOnly("take to", "took to", "taken to", "mulai terbiasa/suka", "Habits", "Extended"),
  gerundOnly("dedicate oneself to", "dedicated oneself to", "dedicated oneself to", "mendedikasikan diri", "Commitment", "Extended"),
  gerundOnly("devote oneself to", "devoted oneself to", "devoted oneself to", "mencurahkan diri", "Commitment", "Extended"),
  gerundOnly("adjust to", "adjusted to", "adjusted to", "menyesuaikan diri", "Adaptation", "Exam-support"),
  gerundOnly("cope with", "coped with", "coped with", "mengatasi", "Problem solving"),
  gerundOnly("insist on", "insisted on", "insisted on", "bersikeras", "Opinion"),
  gerundOnly("persist in", "persisted in", "persisted in", "terus bersikeras", "Persistence", "Exam-support"),
  gerundOnly("succeed in", "succeeded in", "succeeded in", "berhasil", "Achievement"),
  gerundOnly("specialize in", "specialized in", "specialized in", "mengkhususkan diri", "Academic work", "Exam-support"),
  gerundOnly("participate in", "participated in", "participated in", "berpartisipasi", "Activities"),
  gerundOnly("concentrate on", "concentrated on", "concentrated on", "berkonsentrasi", "Study habits"),
  gerundOnly("focus on", "focused on", "focused on", "fokus pada", "Study habits"),
  gerundOnly("depend on", "depended on", "depended on", "bergantung pada", "Planning"),
  gerundOnly("rely on", "relied on", "relied on", "mengandalkan", "Planning"),
  gerundOnly("count on", "counted on", "counted on", "mengandalkan", "Planning"),
  gerundOnly("approve of", "approved of", "approved of", "menyetujui", "Opinion", "Exam-support"),
  gerundOnly("disapprove of", "disapproved of", "disapproved of", "tidak menyetujui", "Opinion", "Exam-support"),
  gerundOnly("dream of", "dreamed of", "dreamed of", "bermimpi tentang", "Goals"),
  gerundOnly("think about", "thought about", "thought about", "memikirkan", "Planning"),
  gerundOnly("worry about", "worried about", "worried about", "khawatir tentang", "Emotion"),
  gerundOnly("complain about", "complained about", "complained about", "mengeluh tentang", "Communication"),
  gerundOnly("talk about", "talked about", "talked about", "membicarakan", "Communication"),
  gerundOnly("argue about", "argued about", "argued about", "berdebat tentang", "Communication"),
  gerundOnly("apologize for", "apologized for", "apologized for", "meminta maaf karena", "Communication"),
  gerundOnly("thank someone for", "thanked someone for", "thanked someone for", "berterima kasih karena", "Communication"),
  gerundOnly("blame someone for", "blamed someone for", "blamed someone for", "menyalahkan karena", "Responsibility"),
  gerundOnly("criticize someone for", "criticized someone for", "criticized someone for", "mengkritik karena", "Feedback", "Exam-support"),
  gerundOnly("praise someone for", "praised someone for", "praised someone for", "memuji karena", "Feedback"),
  gerundOnly("forgive someone for", "forgave someone for", "forgiven someone for", "memaafkan karena", "Relationship"),
  gerundOnly("excuse someone for", "excused someone for", "excused someone for", "memaafkan/memaklumi", "Relationship", "Exam-support"),
  gerundOnly("discourage someone from", "discouraged someone from", "discouraged someone from", "mencegah/menghalangi", "Advice", "Exam-support"),
  gerundOnly("deter someone from", "deterred someone from", "deterred someone from", "menghalangi", "Rules", "Exam-support"),
  gerundOnly("refrain from", "refrained from", "refrained from", "menahan diri dari", "Formal behavior", "Exam-support"),
  gerundOnly("abstain from", "abstained from", "abstained from", "menjauhkan diri dari", "Formal behavior", "Extended"),
  gerundOnly("benefit from", "benefited from", "benefited from", "mendapat manfaat dari", "Result"),
  gerundOnly("profit from", "profited from", "profited from", "mendapat keuntungan dari", "Result", "Exam-support"),
  gerundOnly("accuse someone of", "accused someone of", "accused someone of", "menuduh karena", "Academic integrity", "Exam-support"),
  gerundOnly("suspect someone of", "suspected someone of", "suspected someone of", "mencurigai karena", "Academic integrity", "Exam-support"),
  gerundOnly("warn someone against", "warned someone against", "warned someone against", "memperingatkan agar tidak", "Safety", "Exam-support"),
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
  infinitiveOnly("appear", "appeared", "appeared", "tampak", "Observation"),
  infinitiveOnly("aspire", "aspired", "aspired", "bercita-cita", "Goals"),
  infinitiveOnly("care", "cared", "cared", "mau/bersedia", "Preference", "Exam-support"),
  infinitiveOnly("decline", "declined", "declined", "menolak", "Decision"),
  infinitiveOnly("desire", "desired", "desired", "menginginkan", "Goals", "Exam-support"),
  infinitiveOnly("determine", "determined", "determined", "bertekad", "Decision", "Exam-support"),
  infinitiveOnly("elect", "elected", "elected", "memilih/memutuskan", "Decision", "Exam-support"),
  infinitiveOnly("endeavor", "endeavored", "endeavored", "berusaha", "Effort", "Extended"),
  infinitiveOnly("guarantee", "guaranteed", "guaranteed", "menjamin", "Commitment", "Exam-support"),
  infinitiveOnly("happen", "happened", "happened", "kebetulan", "Chance"),
  infinitiveOnly("hesitate", "hesitated", "hesitated", "ragu-ragu", "Decision"),
  infinitiveOnly("long", "longed", "longed", "sangat ingin", "Goals", "Exam-support"),
  infinitiveOnly("opt", "opted", "opted", "memilih", "Decision"),
  infinitiveOnly("proceed", "proceeded", "proceeded", "melanjutkan", "Process", "Exam-support"),
  infinitiveOnly("profess", "professed", "professed", "mengaku", "Academic argument", "Extended"),
  infinitiveOnly("purport", "purported", "purported", "mengaku tampak", "Academic argument", "Extended"),
  infinitiveOnly("resolve", "resolved", "resolved", "bertekad", "Decision", "Exam-support"),
  infinitiveOnly("seek", "sought", "sought", "berusaha", "Academic argument"),
  infinitiveOnly("strive", "strove", "striven", "berupaya keras", "Effort", "Exam-support"),
  infinitiveOnly("swear", "swore", "sworn", "bersumpah", "Commitment"),
  infinitiveOnly("undertake", "undertook", "undertaken", "menyanggupi", "Commitment", "Exam-support"),
  infinitiveOnly("vow", "vowed", "vowed", "bersumpah/berjanji", "Commitment", "Exam-support"),
  infinitiveOnly("yearn", "yearned", "yearned", "sangat ingin", "Goals", "Extended"),
  infinitiveOnly("apply", "applied", "applied", "melamar/mengajukan diri", "Applications"),
  infinitiveOnly("qualify", "qualified", "qualified", "memenuhi syarat", "Eligibility", "Exam-support"),
  infinitiveOnly("train", "trained", "trained", "berlatih", "Skill building"),
  infinitiveOnly("beg", "begged", "begged", "memohon", "Request"),
  infinitiveOnly("wait", "waited", "waited", "menunggu", "Timing"),
  infinitiveOnly("come", "came", "come", "akhirnya mulai/menjadi", "Change", "Exam-support"),
  infinitiveOnly("grow", "grew", "grown", "lama-lama menjadi", "Change", "Exam-support"),
  infinitiveOnly("turn out", "turned out", "turned out", "ternyata", "Result"),
  infinitiveOnly("prove", "proved", "proved", "terbukti", "Result"),
  infinitiveOnly("serve", "served", "served", "berfungsi", "Academic argument", "Exam-support"),
  infinitiveOnly("suffice", "sufficed", "sufficed", "cukup", "Formal expression", "Extended"),
  infinitiveOnly("hasten", "hastened", "hastened", "segera menambahkan", "Communication", "Extended"),
  infinitiveOnly("venture", "ventured", "ventured", "berani mencoba berkata", "Communication", "Extended"),
  infinitiveOnly("conspire", "conspired", "conspired", "bersekongkol", "Plans", "Extended"),
  infinitiveOnly("plot", "plotted", "plotted", "merancang", "Plans", "Extended"),
  infinitiveOnly("scheme", "schemed", "schemed", "merancang siasat", "Plans", "Extended"),
  infinitiveOnly("pledge", "pledged", "pledged", "berjanji", "Commitment", "Exam-support"),
  objectInfinitiveOnly("tell", "told", "told", "menyuruh/memberitahu", "Communication"),
  objectInfinitiveOnly("remind", "reminded", "reminded", "mengingatkan", "Memory"),
  objectInfinitiveOnly("teach", "taught", "taught", "mengajari", "Education"),
  objectInfinitiveOnly("instruct", "instructed", "instructed", "menginstruksikan", "Rules", "Exam-support"),
  objectInfinitiveOnly("order", "ordered", "ordered", "memerintahkan", "Rules"),
  objectInfinitiveOnly("command", "commanded", "commanded", "memerintahkan", "Rules", "Exam-support"),
  objectInfinitiveOnly("invite", "invited", "invited", "mengundang", "Social"),
  objectInfinitiveOnly("persuade", "persuaded", "persuaded", "membujuk", "Advice"),
  objectInfinitiveOnly("convince", "convinced", "convinced", "meyakinkan/membujuk", "Advice"),
  objectInfinitiveOnly("force", "forced", "forced", "memaksa", "Rules"),
  objectInfinitiveOnly("compel", "compelled", "compelled", "memaksa", "Formal rules", "Exam-support"),
  objectInfinitiveOnly("oblige", "obliged", "obliged", "mewajibkan", "Formal rules", "Exam-support"),
  objectInfinitiveOnly("require", "required", "required", "mewajibkan", "Workplace"),
  objectInfinitiveOnly("enable", "enabled", "enabled", "memungkinkan", "Capability"),
  objectInfinitiveOnly("cause", "caused", "caused", "menyebabkan", "Cause-effect"),
  objectInfinitiveOnly("lead", "led", "led", "menyebabkan/mengarahkan", "Cause-effect", "Exam-support"),
  objectInfinitiveOnly("motivate", "motivated", "motivated", "memotivasi", "Motivation"),
  objectInfinitiveOnly("inspire", "inspired", "inspired", "menginspirasi", "Motivation"),
  objectInfinitiveOnly("authorize", "authorized", "authorized", "memberi wewenang", "Formal rules", "Exam-support"),
  objectInfinitiveOnly("appoint", "appointed", "appointed", "menunjuk", "Workplace", "Exam-support"),
  objectInfinitiveOnly("assign", "assigned", "assigned", "menugaskan", "Workplace"),
  objectInfinitiveOnly("urge", "urged", "urged", "mendesak", "Advice"),
  objectInfinitiveOnly("warn", "warned", "warned", "memperingatkan", "Safety"),
  objectInfinitiveOnly("pressure", "pressured", "pressured", "menekan", "Workplace", "Exam-support"),
  objectInfinitiveOnly("prompt", "prompted", "prompted", "mendorong/menyebabkan", "Cause-effect", "Exam-support"),
  objectInfinitiveOnly("drive", "drove", "driven", "mendorong kuat", "Motivation", "Exam-support"),
  objectInfinitiveOnly("push", "pushed", "pushed", "mendorong", "Motivation"),
  objectInfinitiveOnly("hire", "hired", "hired", "mempekerjakan", "Workplace"),
  objectInfinitiveOnly("pay", "paid", "paid", "membayar", "Transaction"),
  objectInfinitiveOnly("select", "selected", "selected", "memilih", "Selection"),
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
  dualPattern("commence", "commenced", "commenced", "memulai", "none-or-minor", "Commence doing and commence to do can both mean start, usually in formal contexts.", "Formal process", "Extended"),
  dualPattern("recommence", "recommenced", "recommenced", "memulai kembali", "none-or-minor", "Recommence doing and recommence to do both mean start again; the verb is formal.", "Formal process", "Extended"),
  dualPattern("dislike", "disliked", "disliked", "tidak menyukai", "none-or-minor", "Dislike doing is more common; dislike to do may appear in formal or specific contexts.", "Preference", "Extended"),
  dualPattern("adore", "adored", "adored", "sangat menyukai", "none-or-minor", "Adore doing is common; adore to do is literary or less central, so treat it as extended.", "Preference", "Extended"),
  dualPattern("loathe", "loathed", "loathed", "sangat tidak suka", "none-or-minor", "Loathe doing and loathe to do both express strong unwillingness or dislike.", "Preference", "Extended"),
  dualPattern("stand", "stood", "stood", "tahan/sanggup", "none-or-minor", "Cannot stand doing and cannot stand to do can both express inability to tolerate an action.", "Emotion"),
  dualPattern("fear", "feared", "feared", "takut/khawatir", "none-or-minor", "Fear doing emphasizes the feared event; fear to do means be afraid or unwilling to do it.", "Emotion", "Exam-support"),
  dualPattern("endure", "endured", "endured", "menahan/bertahan", "none-or-minor", "Endure doing is common for hardship; endure to see/hear appears in more formal contexts.", "Emotion", "Extended"),
  dualPattern("omit", "omitted", "omitted", "menghilangkan/lalai melakukan", "none-or-minor", "Omit doing and omit to do can both mean leave an action out or fail to do it.", "Academic writing", "Extended"),
  dualPattern("disdain", "disdained", "disdained", "meremehkan/enggan", "none-or-minor", "Disdain doing and disdain to do are formal patterns for refusing or looking down on an action.", "Attitude", "Extended"),
  dualPattern("scorn", "scorned", "scorned", "menolak dengan hina", "none-or-minor", "Scorn doing and scorn to do are advanced formal patterns.", "Attitude", "Extended"),
  dualPattern("undertake", "undertook", "undertaken", "berkomitmen/menanggung", "none-or-minor", "Undertake to do means agree to do; undertake doing can mean take on a task.", "Commitment", "Exam-support"),
  dualPattern("chance", "chanced", "chanced", "kebetulan/berisiko", "meaning-change", "Chance to do means happen to do; chance doing means risk doing it.", "Risk", "Extended"),
  dualPattern("venture", "ventured", "ventured", "berani mencoba/berisiko", "meaning-change", "Venture to say/do means dare to say or do; venture doing means risk doing it.", "Risk", "Extended"),
  dualPattern("recommend", "recommended", "recommended", "merekomendasikan", "context-dependent", "Recommend doing is standard; recommend someone to do needs caution and is less preferred than recommend that someone do.", "Advice", "Exam-support", ["gerund", "object-to-infinitive"]),
  dualPattern("require", "required", "required", "mewajibkan/memerlukan", "context-dependent", "Require doing can describe work needed on something; require someone to do makes a person obligated.", "Rules", "Exam-support", ["gerund", "object-to-infinitive"]),
  dualPattern("authorize", "authorized", "authorized", "mengizinkan secara resmi", "context-dependent", "Authorize doing approves an action; authorize someone to do gives a person authority.", "Permission", "Extended", ["gerund", "object-to-infinitive"]),
  dualPattern("sanction", "sanctioned", "sanctioned", "mengesahkan/memberi sanksi", "context-dependent", "Sanction doing means officially approve an action; sanction someone to do is more legal or formal.", "Rules", "Extended", ["gerund", "object-to-infinitive"]),
  dualPattern("enable", "enabled", "enabled", "memungkinkan", "context-dependent", "Enable doing makes an activity possible; enable someone to do makes a person able to act.", "Ability/technology", "Exam-support", ["gerund", "object-to-infinitive"]),
  dualPattern("warn", "warned", "warned", "memperingatkan", "context-dependent", "Warn someone to do gives a cautionary instruction; warn against doing tells someone to avoid an action.", "Advice", "Exam-support", ["object-to-infinitive", "preposition-gerund"]),
  dualPattern("caution", "cautioned", "cautioned", "memperingatkan", "context-dependent", "Caution someone to do gives a warning; caution against doing warns not to do it.", "Advice", "Exam-support", ["object-to-infinitive", "preposition-gerund"]),
  dualPattern("persuade", "persuaded", "persuaded", "membujuk", "context-dependent", "Persuade someone to do means convince them to act; persuade against doing means convince them not to act.", "Persuasion", "Extended", ["object-to-infinitive", "preposition-gerund"]),
  dualPattern("urge", "urged", "urged", "mendesak", "context-dependent", "Urge someone to do is common; urge against doing is formal and means advise against an action.", "Advice", "Extended", ["object-to-infinitive", "preposition-gerund"]),
  dualPattern("deserve", "deserved", "deserved", "layak/pantas", "special-case", "Deserve to be checked is explicit passive infinitive; deserve checking is passive-like gerund usage.", "Evaluation", "Exam-support", ["to-infinitive", "gerund-passive"]),
  dualPattern("see", "saw", "seen", "melihat", "special-case", "See someone doing emphasizes an action in progress; see someone do treats the action as a complete event.", "Perception", "Core", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("hear", "heard", "heard", "mendengar", "special-case", "Hear someone singing emphasizes the process; hear someone sing treats the action as a whole.", "Perception", "Core", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("watch", "watched", "watched", "menonton/mengamati", "special-case", "Watch someone doing emphasizes process; watch someone do can cover the whole action.", "Perception", "Core", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("notice", "noticed", "noticed", "memperhatikan/menyadari", "special-case", "Notice someone doing focuses on something happening; notice someone do treats it as one observed event.", "Perception", "Exam-support", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("observe", "observed", "observed", "mengamati", "special-case", "Observe someone doing/do follows the perception-verb contrast in a more formal register.", "Academic observation", "Exam-support", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("feel", "felt", "felt", "merasakan", "special-case", "Feel something moving emphasizes process; feel something move emphasizes one movement.", "Perception", "Exam-support", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("smell", "smelled", "smelled", "mencium bau", "special-case", "Smell something burning emphasizes an ongoing process; smell something burn treats the event as a whole.", "Perception", "Extended", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("overhear", "overheard", "overheard", "tidak sengaja mendengar", "special-case", "Overhear someone talking/talk follows the perception-verb contrast.", "Perception", "Extended", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("listen to", "listened to", "listened to", "mendengarkan", "special-case", "Listen to someone singing/sing uses to as a preposition before the object.", "Perception", "Extended", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("witness", "witnessed", "witnessed", "menyaksikan", "special-case", "Witness someone doing/do is formal and contrasts process with a whole observed action.", "Academic/legal", "Extended", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("look at", "looked at", "looked at", "melihat/memperhatikan", "special-case", "Look at someone doing/do is more limited than see or watch, but it can show the same process/event contrast.", "Perception", "Extended", ["object-gerund", "object-bare-infinitive"]),
  dualPattern("have", "had", "had", "menyuruh/membuat", "special-case", "Have someone do means arrange or require the action; have someone doing means cause or keep an action happening.", "Causative", "Core", ["object-bare-infinitive", "object-gerund"]),
  dualPattern("get", "got", "gotten", "membuat/mulai/kesempatan", "special-case", "Get someone to do means cause or persuade; get doing means start moving or acting.", "Causative/process", "Core", ["object-to-infinitive", "gerund"]),
  dualPattern("make", "made", "made", "membuat/memaksa", "special-case", "Make someone do is active causative; be made to do is the passive form.", "Causative", "Core", ["object-bare-infinitive", "passive-to-infinitive"]),
  dualPattern("dare", "dared", "dared", "berani", "special-case", "Dare do and dare to do are both possible; the bare form is common in negatives and questions.", "Modal-like", "Exam-support", ["bare-infinitive", "to-infinitive"]),
  dualPattern("learn", "learned", "learned", "belajar", "context-dependent", "Learn to drive means acquire an ability; learn typing can mean study a skill area.", "Learning", "Core"),
  dualPattern("teach", "taught", "taught", "mengajar", "context-dependent", "Teach dancing means teach the subject; teach someone to dance focuses on the learner and action.", "Learning", "Core", ["gerund", "object-to-infinitive"]),
  dualPattern("used to / be used to", "used", "used", "dulu biasa/terbiasa", "special-case", "Used to do means a past habit; be/get used to doing means be accustomed to an activity.", "Habit", "Core", ["used-to-infinitive", "preposition-gerund"]),
  dualPattern("plan", "planned", "planned", "merencanakan", "special-case", "Plan to do is standard; plan on doing is also common, especially in American English.", "Planning", "Core", ["to-infinitive", "preposition-gerund"]),
  dualPattern("consent", "consented", "consented", "menyetujui", "context-dependent", "Consent to do and consent to doing are both possible; in the gerund pattern, to acts as a preposition.", "Agreement", "Exam-support", ["to-infinitive", "preposition-gerund"]),
  dualPattern("agree", "agreed", "agreed", "setuju", "context-dependent", "Agree to do means agree to perform an action; agree to doing can mean accept a proposed activity.", "Agreement", "Core", ["to-infinitive", "preposition-gerund"]),
  dualPattern("aim", "aimed", "aimed", "bertujuan", "context-dependent", "Aim to do means intend; aim at doing means target an activity or result.", "Goals", "Exam-support", ["to-infinitive", "preposition-gerund"]),
  dualPattern("aspire", "aspired", "aspired", "bercita-cita", "context-dependent", "Aspire to do/be and aspire to becoming both occur; the gerund pattern treats to as a preposition.", "Goals", "Extended", ["to-infinitive", "preposition-gerund"]),
  dualPattern("commit", "committed", "committed", "berkomitmen", "context-dependent", "Commit to doing is common; commit to do appears when commit means promise, so register matters.", "Commitment", "Exam-support", ["to-infinitive", "preposition-gerund"]),
  dualPattern("prepare", "prepared", "prepared", "bersiap", "context-dependent", "Prepare to do means get ready to act; prepare for doing means get ready for an activity.", "Preparation", "Core", ["to-infinitive", "preposition-gerund"]),
  dualPattern("hesitate", "hesitated", "hesitated", "ragu", "context-dependent", "Hesitate to do means be reluctant to act; hesitate about doing means be unsure about the activity.", "Decision", "Exam-support", ["to-infinitive", "preposition-gerund"]),
  dualPattern("decide", "decided", "decided", "memutuskan", "context-dependent", "Decide to do means choose to act; decide against doing means choose not to act.", "Decision", "Core", ["to-infinitive", "preposition-gerund"]),
  dualPattern("opt", "opted", "opted", "memilih", "context-dependent", "Opt to do means choose to act; opt for doing means choose an activity or option.", "Decision", "Exam-support", ["to-infinitive", "preposition-gerund"]),
  dualPattern("vote", "voted", "voted", "memilih melalui voting", "context-dependent", "Vote to do means a group formally decides; vote for doing means support an option.", "Decision", "Extended", ["to-infinitive", "preposition-gerund"]),
  dualPattern("proceed", "proceeded", "proceeded", "melanjutkan", "context-dependent", "Proceed to do means move to the next action; proceed with doing means continue a process.", "Process", "Exam-support", ["to-infinitive", "preposition-gerund"]),
  dualPattern("fail", "failed", "failed", "gagal", "context-dependent", "Fail to do means not do what was needed; fail in doing means fail within an effort or process.", "Outcome", "Exam-support", ["to-infinitive", "preposition-gerund"]),
  dualPattern("struggle", "struggled", "struggled", "berjuang/kesulitan", "context-dependent", "Struggle to do and struggle with doing both show difficulty, with different structures.", "Effort", "Core", ["to-infinitive", "preposition-gerund"]),
  dualPattern("care", "cared", "cared", "peduli/ingin", "context-dependent", "Care to do means be willing or want; care about doing means consider an activity important.", "Preference", "Extended", ["to-infinitive", "preposition-gerund"]),
  dualPattern("assist", "assisted", "assisted", "membantu", "context-dependent", "Assist someone to do and assist in/with doing both describe support, with different structures.", "Support", "Exam-support", ["object-to-infinitive", "preposition-gerund"]),
  dualPattern("aid", "aided", "aided", "membantu", "context-dependent", "Aid someone to do is formal; aid in doing means help a process.", "Support", "Extended", ["object-to-infinitive", "preposition-gerund"]),
  dualPattern("prompt", "prompted", "prompted", "mendorong/memicu", "context-dependent", "Prompt someone to do means push a person to act; prompt doing means trigger an activity or response.", "Cause", "Exam-support", ["object-to-infinitive", "gerund"]),
  dualPattern("lead", "led", "led", "menyebabkan/memimpin", "context-dependent", "Lead someone to do means cause a person to act; lead to doing means result in an activity.", "Cause", "Exam-support", ["object-to-infinitive", "preposition-gerund"]),
  dualPattern("threaten", "threatened", "threatened", "mengancam", "context-dependent", "Threaten to do means say one may act; threaten with doing means use an action as a threat.", "Risk", "Exam-support", ["to-infinitive", "preposition-gerund"]),
  dualPattern("trouble", "troubled", "troubled", "repot-repot/merepotkan", "context-dependent", "Do not trouble to do and have trouble doing are different structures, so context must be read carefully.", "Effort", "Extended", ["to-infinitive", "gerund"]),
  dualPattern("swear", "swore", "sworn", "bersumpah/berhenti dari", "context-dependent", "Swear to do means promise solemnly; swear off doing means promise to stop doing it.", "Promise", "Extended", ["to-infinitive", "preposition-gerund"]),
  dualPattern("pledge", "pledged", "pledged", "berjanji", "context-dependent", "Pledge to do is common; pledge oneself to doing is more formal.", "Promise", "Extended", ["to-infinitive", "preposition-gerund"]),
  dualPattern("leave", "left", "left", "membiarkan/meninggalkan", "context-dependent", "Leave someone to do means let them do it; leave someone doing means leave them while the action continues.", "Causative", "Exam-support", ["object-to-infinitive", "object-gerund"]),
  dualPattern("send", "sent", "sent", "mengirim/membuat bergerak", "context-dependent", "Send someone to do means dispatch them; send someone running means cause that action.", "Causative", "Extended", ["object-to-infinitive", "object-gerund"]),
  dualPattern("set", "set", "set", "menetapkan/membuat mulai", "context-dependent", "Set someone to do/work means assign; set someone thinking means cause the process to begin.", "Causative", "Extended", ["object-to-infinitive", "object-gerund"]),
  dualPattern("train", "trained", "trained", "melatih", "context-dependent", "Train someone to do focuses on an action; train in doing focuses on a process or field.", "Learning", "Exam-support", ["object-to-infinitive", "preposition-gerund"]),
  dualPattern("instruct", "instructed", "instructed", "menginstruksikan/mengajar", "context-dependent", "Instruct someone to do gives an order; instruct in doing means teach a skill or field.", "Instruction", "Exam-support", ["object-to-infinitive", "preposition-gerund"]),
];

const PACKAGE_CATEGORY_PLANS: PatternCategory[][] = Array.from(
  { length: 30 },
  (_, packageIndex) => {
    if (packageIndex < 10) {
      return [
        "gerund-only",
        "infinitive-only",
        "dual-pattern",
        "gerund-only",
        "infinitive-only",
        "dual-pattern",
        "gerund-only",
        "infinitive-only",
        "dual-pattern",
        "gerund-only",
      ];
    }

    if (packageIndex < 20) {
      return [
        "infinitive-only",
        "dual-pattern",
        "gerund-only",
        "infinitive-only",
        "dual-pattern",
        "gerund-only",
        "infinitive-only",
        "dual-pattern",
        "gerund-only",
        "infinitive-only",
      ];
    }

    return [
      "dual-pattern",
      "gerund-only",
      "infinitive-only",
      "dual-pattern",
      "gerund-only",
      "infinitive-only",
      "dual-pattern",
      "gerund-only",
      "infinitive-only",
      "dual-pattern",
    ];
  },
);

function buildMixedVerbOrder() {
  const groups: Record<PatternCategory, VerbItem[]> = {
    "gerund-only": gerundVerbs,
    "infinitive-only": infinitiveVerbs,
    "dual-pattern": dualVerbs,
  };
  const cursors: Record<PatternCategory, number> = {
    "gerund-only": 0,
    "infinitive-only": 0,
    "dual-pattern": 0,
  };

  const ordered = PACKAGE_CATEGORY_PLANS.flatMap((plan) =>
    plan.map((category) => {
      const item = groups[category][cursors[category]];

      if (!item) {
        throw new Error(`Not enough ${category} content for mixed packages.`);
      }

      cursors[category] += 1;
      return item;
    }),
  );

  for (const category of Object.keys(groups) as PatternCategory[]) {
    if (cursors[category] !== groups[category].length) {
      throw new Error(`Unused ${category} content remains after packaging.`);
    }
  }

  return ordered;
}

export const verbs: VerbItem[] = buildMixedVerbOrder();

function makeOptions(
  correctKey: OptionKey,
  correctText: string,
  distractors: [string, string, string],
) {
  let distractorIndex = 0;

  return OPTION_KEYS.map((key) => ({
    key,
    text:
      key === correctKey ? correctText : distractors[distractorIndex++],
  }));
}

function createQuestion(verb: VerbItem, index: number): QuizQuestion {
  const correctKey = OPTION_KEYS[index % OPTION_KEYS.length];

  if (verb.category === "gerund-only") {
    return {
      id: `q-${verb.id}`,
      verbId: verb.id,
      type: "completion",
      prompt: `Pilih kalimat yang paling tepat untuk pola "${verb.verb1}".`,
      options: makeOptions(correctKey, `They ${verb.verb1} reviewing the answer sheet.`, [
        `They ${verb.verb1} to review the answer sheet.`,
        `They ${verb.verb1} review the answer sheet yesterday.`,
        `They ${verb.verb1} reviewed to the answer sheet.`,
      ]),
      correctKey,
      explanation: `Jawaban benar ${correctKey}. "${verb.verb1}" termasuk pola ${verb.patternLabel}, sehingga verb berikutnya memakai bentuk -ing. Distraktor to-infinitive keliru untuk pola ini.`,
    };
  }

  if (verb.category === "infinitive-only") {
    const usesObjectInfinitive =
      verb.acceptedPatterns.includes("object-to-infinitive") &&
      !verb.acceptedPatterns.includes("to-infinitive");
    const correctText = usesObjectInfinitive
      ? `They ${verb.verb1} the students to review the answer sheet.`
      : `They ${verb.verb1} to review the answer sheet.`;
    const distractors: [string, string, string] = usesObjectInfinitive
      ? [
          `They ${verb.verb1} the students reviewing the answer sheet.`,
          `They ${verb.verb1} to review the answer sheet.`,
          `They ${verb.verb1} the students review to the answer sheet.`,
        ]
      : [
          `They ${verb.verb1} reviewing the answer sheet.`,
          `They ${verb.verb1} reviewed the answer sheet.`,
          `They ${verb.verb1} review to the answer sheet.`,
        ];

    return {
      id: `q-${verb.id}`,
      verbId: verb.id,
      type: "completion",
      prompt: `Pilih kalimat yang paling tepat untuk pola "${verb.verb1}".`,
      options: makeOptions(correctKey, correctText, distractors),
      correctKey,
      explanation: `Jawaban benar ${correctKey}. "${verb.verb1}" termasuk pola ${verb.patternLabel}, sehingga verb berikutnya memakai to + Verb-1 atau object + to + Verb-1 sesuai struktur. Distraktor -ing keliru untuk pola ini.`,
    };
  }

  const correctText =
    verb.meaningShift === "meaning-change"
      ? "Gerund dan to-infinitive bisa sama-sama benar, tetapi maknanya dapat berbeda."
      : "Lebih dari satu struktur dapat benar, tetapi bentuknya bergantung pada konteks.";

  return {
    id: `q-${verb.id}`,
    verbId: verb.id,
    type:
      verb.meaningShift === "meaning-change"
        ? "meaning-difference"
        : "pattern-classification",
    prompt: `Pernyataan mana yang paling akurat tentang pola "${verb.verb1}"?`,
    options: makeOptions(correctKey, correctText, [
      `"${verb.verb1}" hanya boleh memakai satu pola dalam semua konteks.`,
      `"${verb.verb1}" selalu memakai Verb-2 setelahnya.`,
      `Pilihan bentuk setelah "${verb.verb1}" tidak perlu memperhatikan makna kalimat.`,
    ]),
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
  const optionDistribution = new Map<OptionKey, number>(
    OPTION_KEYS.map((key) => [key, 0]),
  );

  if (verbs.length !== TOTAL_TARGET) {
    throw new Error(`Expected ${TOTAL_TARGET} curated verbs, received ${verbs.length}.`);
  }

  if (
    contentStats.gerundOnly !== CATEGORY_TARGET ||
    contentStats.infinitiveOnly !== CATEGORY_TARGET ||
    contentStats.dualPattern !== CATEGORY_TARGET
  ) {
    throw new Error(`Expected ${CATEGORY_TARGET} verbs in each pattern category.`);
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

    if (verb.category === "gerund-only" && !verb.acceptedPatterns.includes("gerund")) {
      throw new Error(`Gerund-only verb lacks gerund pattern: ${verb.id}`);
    }

    if (
      verb.category === "infinitive-only" &&
      !verb.acceptedPatterns.some((pattern) =>
        ["to-infinitive", "object-to-infinitive"].includes(pattern),
      )
    ) {
      throw new Error(`Infinitive-only verb lacks infinitive pattern: ${verb.id}`);
    }

    if (verb.category === "dual-pattern" && verb.acceptedPatterns.length < 2) {
      throw new Error(`Dual-pattern verb needs at least two accepted patterns: ${verb.id}`);
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

    optionDistribution.set(
      question.correctKey,
      (optionDistribution.get(question.correctKey) ?? 0) + 1,
    );

    if (!question.explanation.includes(`Jawaban benar ${question.correctKey}`)) {
      throw new Error(`Explanation must cite correct key: ${question.id}`);
    }

    if (
      /gerund-only|infinitive-only|dual-pattern/i.test(question.prompt) ||
      /Gerund only|To-infinitive only|Dual pattern/i.test(question.prompt)
    ) {
      throw new Error(`Question prompt leaks category label: ${question.id}`);
    }
  }

  for (const key of OPTION_KEYS) {
    const count = optionDistribution.get(key) ?? 0;

    if (count < 60) {
      throw new Error(`Answer key ${key} is underrepresented: ${count}`);
    }
  }

  for (const learningPackage of learningPackages) {
    if (learningPackage.verbs.length !== PACKAGE_SIZE) {
      throw new Error(`Package size mismatch: ${learningPackage.id}`);
    }

    if (learningPackage.questions.length !== PACKAGE_SIZE) {
      throw new Error(`Question package size mismatch: ${learningPackage.id}`);
    }

    const packageCategories = new Set(
      learningPackage.verbs.map((verb) => verb.category),
    );

    if (packageCategories.size !== 3) {
      throw new Error(`Package must mix all categories: ${learningPackage.id}`);
    }
  }
}

validateVerbContent();
