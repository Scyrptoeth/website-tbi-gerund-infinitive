"use client";

import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  ClipboardCheck,
  Eye,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  contentStats,
  getCategoryLabel,
  learningPackages,
  verbs,
  type LearningPackage,
  type OptionKey,
  type PatternCategory,
  type QuizQuestion,
  type VerbItem,
} from "@/data/verb-content";
import { normalizeText } from "@/lib/learning";

type View = "dashboard" | "search" | "materi" | "flipcard" | "tes" | "superadmin";
type PackageStatus = "ready" | "draft" | "submitted";

type DraftAttempt = {
  answers: Partial<Record<string, OptionKey>>;
  updatedAt: string;
};

type SubmittedAttempt = DraftAttempt & {
  score: number;
  submittedAt: string;
};

type StoredProgress = {
  viewedCards: string[];
  drafts: Record<string, DraftAttempt>;
  submitted: Record<string, SubmittedAttempt>;
};

const STORAGE_KEY = "tbi-gerund-infinitive-progress-v1";
const PACKAGE_PAGE_SIZE = 10;
const emptyProgress: StoredProgress = {
  viewedCards: [],
  drafts: {},
  submitted: {},
};

const navigation: Array<{ id: View; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Dashboard", icon: ChartNoAxesColumnIncreasing },
  { id: "search", label: "Pencarian", icon: Search },
  { id: "materi", label: "Materi", icon: BookOpen },
  { id: "flipcard", label: "Flipcard", icon: Layers },
  { id: "tes", label: "Tes", icon: ClipboardCheck },
  { id: "superadmin", label: "SuperAdmin", icon: ShieldCheck },
];

function isOptionKey(value: unknown): value is OptionKey {
  return value === "A" || value === "B" || value === "C" || value === "D";
}

function sanitizeAnswers(value: unknown): Partial<Record<string, OptionKey>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<Partial<Record<string, OptionKey>>>(
    (answers, [questionId, answer]) => {
      if (isOptionKey(answer)) {
        answers[questionId] = answer;
      }

      return answers;
    },
    {},
  );
}

function loadStoredProgress(): StoredProgress {
  if (typeof window === "undefined") {
    return emptyProgress;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return emptyProgress;
    }

    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    const drafts = Object.entries(parsed.drafts ?? {}).reduce<
      Record<string, DraftAttempt>
    >((safeDrafts, [packageId, value]) => {
      if (!value || typeof value !== "object") {
        return safeDrafts;
      }

      const draft = value as Partial<DraftAttempt>;
      safeDrafts[packageId] = {
        answers: sanitizeAnswers(draft.answers),
        updatedAt:
          typeof draft.updatedAt === "string"
            ? draft.updatedAt
            : new Date().toISOString(),
      };

      return safeDrafts;
    }, {});

    const submitted = Object.entries(parsed.submitted ?? {}).reduce<
      Record<string, SubmittedAttempt>
    >((safeSubmitted, [packageId, value]) => {
      if (!value || typeof value !== "object") {
        return safeSubmitted;
      }

      const attempt = value as Partial<SubmittedAttempt>;
      safeSubmitted[packageId] = {
        answers: sanitizeAnswers(attempt.answers),
        updatedAt:
          typeof attempt.updatedAt === "string"
            ? attempt.updatedAt
            : new Date().toISOString(),
        score: typeof attempt.score === "number" ? attempt.score : 0,
        submittedAt:
          typeof attempt.submittedAt === "string"
            ? attempt.submittedAt
            : new Date().toISOString(),
      };

      return safeSubmitted;
    }, {});

    return {
      viewedCards: Array.isArray(parsed.viewedCards)
        ? parsed.viewedCards.filter((value) => typeof value === "string")
        : [],
      drafts,
      submitted,
    };
  } catch {
    return emptyProgress;
  }
}

function saveStoredProgress(progress: StoredProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function percentage(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function packageStatus(
  learningPackage: LearningPackage,
  progress: StoredProgress,
  view: View,
): PackageStatus {
  if (progress.submitted[learningPackage.id]) {
    return "submitted";
  }

  if (view === "tes" && progress.drafts[learningPackage.id]) {
    return "draft";
  }

  const viewed = learningPackage.verbs.filter((verb) =>
    progress.viewedCards.includes(verb.id),
  ).length;

  if (view === "flipcard" && viewed === learningPackage.verbs.length) {
    return "submitted";
  }

  return viewed > 0 ? "draft" : "ready";
}

function statusLabel(status: PackageStatus) {
  if (status === "submitted") {
    return "Selesai";
  }

  if (status === "draft") {
    return "Draft";
  }

  return "Siap";
}

function statusIcon(status: PackageStatus) {
  if (status === "submitted") {
    return <CheckCircle2 aria-hidden="true" size={16} />;
  }

  if (status === "draft") {
    return <Eye aria-hidden="true" size={16} />;
  }

  return <Circle aria-hidden="true" size={16} />;
}

function categoryTone(category: PatternCategory) {
  if (category === "gerund-only") {
    return "tone-teal";
  }

  if (category === "infinitive-only") {
    return "tone-amber";
  }

  return "tone-coral";
}

function getSearchText(verb: VerbItem) {
  return normalizeText(
    [
      verb.verb1,
      verb.verb2,
      verb.verb3,
      verb.meaning,
      verb.category,
      verb.patternLabel,
      verb.usageNote,
      verb.commonMistake,
      verb.topic,
    ].join(" "),
  );
}

function filterContent(query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return verbs;
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return verbs.filter((verb) =>
    terms.every((term) => getSearchText(verb).includes(term)),
  );
}

function PackageRail({
  activePackageId,
  currentView,
  onSelect,
  progress,
}: {
  activePackageId: string;
  currentView: View;
  onSelect: (packageId: string) => void;
  progress: StoredProgress;
}) {
  const [rangeStart, setRangeStart] = useState(0);
  const visiblePackages = learningPackages.slice(
    rangeStart,
    rangeStart + PACKAGE_PAGE_SIZE,
  );
  const rangeEnd = Math.min(rangeStart + PACKAGE_PAGE_SIZE, learningPackages.length);

  return (
    <aside className="package-rail" aria-label={`Daftar paket ${currentView}`}>
      <div className="rail-head">
        <div>
          <span className="eyebrow">Package rail</span>
          <strong>Paket {rangeStart + 1}-{rangeEnd}</strong>
        </div>
        <div className="rail-actions">
          <button
            type="button"
            className="icon-button"
            aria-label="Paket sebelumnya"
            disabled={rangeStart === 0}
            onClick={() => setRangeStart(Math.max(0, rangeStart - PACKAGE_PAGE_SIZE))}
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Paket berikutnya"
            disabled={rangeEnd >= learningPackages.length}
            onClick={() =>
              setRangeStart(
                Math.min(
                  learningPackages.length - PACKAGE_PAGE_SIZE,
                  rangeStart + PACKAGE_PAGE_SIZE,
                ),
              )
            }
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      </div>

      <div className="rail-list">
        {visiblePackages.map((learningPackage) => {
          const status = packageStatus(learningPackage, progress, currentView);

          return (
            <button
              key={learningPackage.id}
              type="button"
              aria-current={
                activePackageId === learningPackage.id ? "page" : undefined
              }
              className={
                activePackageId === learningPackage.id
                  ? "rail-item active"
                  : "rail-item"
              }
              onClick={() => onSelect(learningPackage.id)}
            >
              <span>{learningPackage.title}</span>
              <small>
                {statusIcon(status)}
                {statusLabel(status)}
              </small>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function PatternBadge({ category }: { category: PatternCategory }) {
  return (
    <span className={`pattern-badge ${categoryTone(category)}`}>
      {getCategoryLabel(category)}
    </span>
  );
}

function ProgressBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const width = percentage(value, total);

  return (
    <div className="progress-row">
      <div className="progress-label">
        <span>{label}</span>
        <strong>
          {value}/{total}
        </strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function VerbSummary({ verb }: { verb: VerbItem }) {
  return (
    <article className="verb-row">
      <div className="verb-main">
        <div>
          <h3>
            {verb.verb1} - {verb.verb2} - {verb.verb3}
          </h3>
          <p>{verb.meaning}</p>
        </div>
        <PatternBadge category={verb.category} />
      </div>
      <dl className="detail-grid">
        <div>
          <dt>Pattern</dt>
          <dd>{verb.patternLabel}</dd>
        </div>
        <div>
          <dt>Tier</dt>
          <dd>{verb.tier}</dd>
        </div>
        <div>
          <dt>Topic</dt>
          <dd>{verb.topic}</dd>
        </div>
      </dl>
      <p>{verb.usageNote}</p>
      {verb.contrastNote ? <p className="note">{verb.contrastNote}</p> : null}
      <p className="mistake">Common mistake: {verb.commonMistake}</p>
    </article>
  );
}

export function LearningApp() {
  const [view, setView] = useState<View>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(learningPackages[0].id);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PatternCategory | "all">("all");
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [progress, setProgress] = useState<StoredProgress>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProgress(loadStoredProgress());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveStoredProgress(progress);
    }
  }, [hydrated, progress]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 560);
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activePackage = useMemo(
    () =>
      learningPackages.find((learningPackage) => learningPackage.id === selectedPackageId) ??
      learningPackages[0],
    [selectedPackageId],
  );
  const searchResults = useMemo(() => filterContent(query), [query]);
  const visibleMaterial = activePackage.verbs.filter((verb) =>
    categoryFilter === "all" ? true : verb.category === categoryFilter,
  );
  const currentDraft = progress.drafts[activePackage.id]?.answers ?? {};
  const submittedAttempt = progress.submitted[activePackage.id];
  const activeAnswers = submittedAttempt?.answers ?? currentDraft;

  const viewedCount = progress.viewedCards.length;
  const submittedCount = Object.keys(progress.submitted).length;
  const draftCount = Object.keys(progress.drafts).filter(
    (packageId) => !progress.submitted[packageId],
  ).length;
  const totalCorrect = Object.values(progress.submitted).reduce(
    (sum, attempt) => sum + attempt.score,
    0,
  );
  const totalAnswered = Object.values(progress.submitted).reduce(
    (sum, attempt) => sum + Object.keys(attempt.answers).length,
    0,
  );

  function changeView(nextView: View) {
    setView(nextView);
    setFlippedCardId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function markViewed(verbId: string) {
    setProgress((current) => {
      if (current.viewedCards.includes(verbId)) {
        return current;
      }

      return {
        ...current,
        viewedCards: [...current.viewedCards, verbId],
      };
    });
  }

  function flipCard(verbId: string) {
    markViewed(verbId);
    setFlippedCardId((current) => (current === verbId ? null : verbId));
  }

  function answerQuestion(questionId: string, answer: OptionKey) {
    if (submittedAttempt) {
      return;
    }

    setProgress((current) => {
      const draft = current.drafts[activePackage.id] ?? {
        answers: {},
        updatedAt: new Date().toISOString(),
      };
      const nextAnswers = { ...draft.answers };

      if (nextAnswers[questionId] === answer) {
        delete nextAnswers[questionId];
      } else {
        nextAnswers[questionId] = answer;
      }

      return {
        ...current,
        drafts: {
          ...current.drafts,
          [activePackage.id]: {
            answers: nextAnswers,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }

  function submitPackage() {
    if (submittedAttempt) {
      return;
    }

    const answers = progress.drafts[activePackage.id]?.answers ?? {};
    const score = activePackage.questions.filter(
      (question) => answers[question.id] === question.correctKey,
    ).length;

    setProgress((current) => ({
      ...current,
      submitted: {
        ...current.submitted,
        [activePackage.id]: {
          answers,
          score,
          updatedAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
        },
      },
    }));
  }

  function resetLocalProgress() {
    setProgress(emptyProgress);
    setFlippedCardId(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  function renderDashboard() {
    return (
      <section className="view-stack" aria-labelledby="dashboard-title">
        <div className="dashboard-hero">
          <div className="dashboard-copy">
            <span className="eyebrow">Bimbel Persiapantubel</span>
            <h1 id="dashboard-title">TBI - Gerund & Infinitive</h1>
            <p>
              Learning cockpit untuk menguasai kata kerja yang diikuti gerund,
              to-infinitive, dan dual-pattern verbs dengan perubahan makna.
            </p>
          </div>
          <div className="hero-mark" aria-label="Jumlah content bank aktif">
            <span>{contentStats.total}</span>
            <small>curated verb bank</small>
          </div>
        </div>

        <div className="stats-grid" aria-label="Ringkasan progress">
          <article className="stat-card">
            <span>Verb Bank</span>
            <strong>{contentStats.total}</strong>
            <small>100 gerund, 100 infinitive, 100 dual-pattern</small>
          </article>
          <article className="stat-card">
            <span>Flipcard Dibuka</span>
            <strong>
              {viewedCount}/{contentStats.total}
            </strong>
            <small>{percentage(viewedCount, contentStats.total)}% progress</small>
          </article>
          <article className="stat-card">
            <span>Tes Submit</span>
            <strong>
              {submittedCount}/{learningPackages.length}
            </strong>
            <small>{draftCount} draft tersimpan</small>
          </article>
          <article className="stat-card">
            <span>Akurasi</span>
            <strong>
              {totalAnswered === 0 ? 0 : percentage(totalCorrect, totalAnswered)}%
            </strong>
            <small>{totalCorrect} benar dari {totalAnswered} terjawab</small>
          </article>
        </div>

        <div className="dashboard-grid">
          <section className="panel" aria-labelledby="progress-title">
            <div className="section-head">
              <div>
                <span className="eyebrow">Progress chart</span>
                <h2 id="progress-title">Visual progress belajar</h2>
              </div>
            </div>
            <ProgressBar label="Flipcard dibuka" value={viewedCount} total={contentStats.total} />
            <ProgressBar label="Tes submitted" value={submittedCount} total={learningPackages.length} />
            <ProgressBar label="Draft tes" value={draftCount} total={learningPackages.length} />
          </section>

          <section className="panel" aria-labelledby="next-action-title">
            <div className="section-head">
              <div>
                <span className="eyebrow">Next action</span>
                <h2 id="next-action-title">Lanjutkan package pertama</h2>
              </div>
            </div>
            <p>
              Mulai dari <strong>{learningPackages[0].title}</strong> untuk
              melihat pola dasar, buka flipcard, lalu submit tes pertama.
            </p>
            <div className="button-row">
              <button type="button" className="primary-button" onClick={() => changeView("materi")}>
                Buka Materi
              </button>
              <button type="button" className="secondary-button" onClick={() => changeView("tes")}>
                Mulai Tes
              </button>
            </div>
          </section>
        </div>

        <div className="category-grid">
          {(["gerund-only", "infinitive-only", "dual-pattern"] as PatternCategory[]).map(
            (category) => (
              <article key={category} className="panel category-card">
                <PatternBadge category={category} />
                <h3>{getCategoryLabel(category)}</h3>
                <p>
                  {verbs.filter((verb) => verb.category === category).length} item
                  aktif dengan source evidence dan pembahasan Indonesia.
                </p>
              </article>
            ),
          )}
        </div>
      </section>
    );
  }

  function renderSearch() {
    return (
      <section className="view-stack" aria-labelledby="search-title">
        <div className="panel">
          <span className="eyebrow">Pencarian global</span>
          <h1 id="search-title">Cari verb, arti, atau pattern</h1>
          <label className="search-label" htmlFor="content-search">
            Cari verb atau pattern
          </label>
          <input
            id="content-search"
            type="search"
            role="searchbox"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Contoh: stop, to-infinitive, menunda"
          />
          <p className="result-count" aria-live="polite">
            {searchResults.length} hasil ditemukan.
          </p>
        </div>

        <div className="content-stack">
          {searchResults.slice(0, 36).map((verb) => (
            <VerbSummary key={verb.id} verb={verb} />
          ))}
        </div>
      </section>
    );
  }

  function renderPackageLayout(content: React.ReactNode, title: string) {
    return (
      <section className="tool-layout" aria-labelledby={`${view}-title`}>
        <div className="tool-head">
          <div>
            <span className="eyebrow">{activePackage.title}</span>
            <h1 id={`${view}-title`}>{title}</h1>
            <p>{activePackage.description}</p>
          </div>
          <button
            type="button"
            className="secondary-button rail-toggle"
            aria-expanded={!railCollapsed}
            onClick={() => setRailCollapsed((current) => !current)}
          >
            {railCollapsed ? "Buka daftar paket" : "Tutup daftar paket"}
          </button>
        </div>

        <div className={railCollapsed ? "tool-grid rail-hidden" : "tool-grid"}>
          {!railCollapsed ? (
            <PackageRail
              activePackageId={activePackage.id}
              currentView={view}
              onSelect={setSelectedPackageId}
              progress={progress}
            />
          ) : null}
          <div className="content-stack">{content}</div>
        </div>
      </section>
    );
  }

  function renderMateri() {
    return renderPackageLayout(
      <>
        <div className="panel">
          <div className="filter-row" aria-label="Filter kategori materi">
            {(["all", "gerund-only", "infinitive-only", "dual-pattern"] as const).map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={categoryFilter === category}
                  className={categoryFilter === category ? "filter active" : "filter"}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category === "all" ? "Semua" : getCategoryLabel(category)}
                </button>
              ),
            )}
          </div>
        </div>
        {visibleMaterial.map((verb) => (
          <VerbSummary key={verb.id} verb={verb} />
        ))}
      </>,
      "Materi gerund dan infinitive",
    );
  }

  function renderFlipcard() {
    return renderPackageLayout(
      <div className="flip-grid">
        {activePackage.verbs.map((verb) => {
          const isFlipped = flippedCardId === verb.id;

          return (
            <button
              key={verb.id}
              type="button"
              className={isFlipped ? "flip-card flipped" : "flip-card"}
              aria-expanded={isFlipped}
              onClick={() => flipCard(verb.id)}
            >
              <span className="eyebrow">{verb.topic}</span>
              <strong>{verb.verb1}</strong>
              {!isFlipped ? (
                <>
                  <span>{verb.meaning}</span>
                  <small>Tap untuk lihat pattern</small>
                </>
              ) : (
                <>
                  <PatternBadge category={verb.category} />
                  <span>{verb.patternLabel}</span>
                  <small>{verb.contrastNote ?? verb.usageNote}</small>
                </>
              )}
            </button>
          );
        })}
      </div>,
      "Flipcard active recall",
    );
  }

  function renderQuestion(question: QuizQuestion, index: number) {
    const selectedAnswer = activeAnswers[question.id];
    const isSubmitted = Boolean(submittedAttempt);
    const isCorrect = selectedAnswer === question.correctKey;

    return (
      <article
        key={question.id}
        id={question.id}
        className="question-block"
        style={{ scrollMarginTop: "96px" }}
      >
        <div className="question-head">
          <span className="eyebrow">Soal {index + 1}</span>
          {isSubmitted ? (
            <span className="eyebrow">Review pattern setelah submit</span>
          ) : null}
        </div>
        <h3>{question.prompt}</h3>
        <div className="option-grid" role="group" aria-label={`Pilihan soal ${index + 1}`}>
          {question.options.map((option) => {
            const selected = selectedAnswer === option.key;
            const className = [
              "option-button",
              selected ? "selected" : "",
              isSubmitted && option.key === question.correctKey ? "correct" : "",
              isSubmitted && selected && !isCorrect ? "wrong" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={selected}
                disabled={isSubmitted}
                className={className}
                onClick={() => answerQuestion(question.id, option.key)}
              >
                <strong>{option.key}</strong>
                <span>{option.text}</span>
              </button>
            );
          })}
        </div>
        {isSubmitted ? (
          <div className={isCorrect ? "review correct" : "review wrong"}>
            <strong>
              {isCorrect ? "Benar" : "Belum tepat"} | Jawaban benar:{" "}
              {question.correctKey}
            </strong>
            <p>{question.explanation}</p>
          </div>
        ) : null}
      </article>
    );
  }

  function renderTes() {
    const answeredCount = activePackage.questions.filter(
      (question) => activeAnswers[question.id],
    ).length;
    const unansweredCount = activePackage.questions.length - answeredCount;
    const wrongQuestions = submittedAttempt
      ? activePackage.questions
          .filter((question) => submittedAttempt.answers[question.id] !== question.correctKey)
          .map((question, index) => index + 1)
      : [];

    return renderPackageLayout(
      <>
        <div className="test-surface" aria-live="polite">
          <div>
            <span className="eyebrow">Tes package</span>
            <strong>
              {answeredCount}/{activePackage.questions.length} terjawab
            </strong>
            <small>{unansweredCount} belum dijawab</small>
          </div>
          {submittedAttempt ? (
            <div>
              <strong>
                Skor: {submittedAttempt.score}/{activePackage.questions.length}
              </strong>
              <small>Submit: {formatDate(submittedAttempt.submittedAt)}</small>
            </div>
          ) : (
            <button type="button" className="primary-button" onClick={submitPackage}>
              Submit final
            </button>
          )}
        </div>

        {submittedAttempt && wrongQuestions.length > 0 ? (
          <div className="panel">
            <span className="eyebrow">Review</span>
            <p>Nomor yang perlu ditinjau ulang: {wrongQuestions.join(", ")}</p>
          </div>
        ) : null}

        <div className="question-stack">
          {activePackage.questions.map((question, index) =>
            renderQuestion(question, index),
          )}
        </div>
      </>,
      "Tes pattern A-D",
    );
  }

  function renderSuperAdmin() {
    return (
      <section className="view-stack" aria-labelledby="admin-title">
        <div className="panel">
          <span className="eyebrow">SuperAdmin summary mode</span>
          <h1 id="admin-title">Operational summary</h1>
          <p>
            Panel ini sengaja hanya summary untuk static MVP. Real CRUD, reset
            attempt siswa, dan content publish workflow menunggu auth, database,
            role check, dan audit log.
          </p>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span>Total content</span>
            <strong>{contentStats.total}</strong>
            <small>roadmap 300 item sudah aktif</small>
          </article>
          <article className="stat-card">
            <span>Questions</span>
            <strong>{contentStats.questions}</strong>
            <small>{contentStats.packages} package, 10 soal per package</small>
          </article>
          <article className="stat-card">
            <span>Submitted lokal</span>
            <strong>{submittedCount}</strong>
            <small>localStorage demo cache</small>
          </article>
          <article className="stat-card">
            <span>Evidence</span>
            <strong>3</strong>
            <small>grammar references per item</small>
          </article>
        </div>

        <section className="panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Roadmap produksi</span>
              <h2>Admin nyata setelah persistence boundary</h2>
            </div>
          </div>
          <ul className="roadmap-list">
            <li>Server-side auth untuk siswa dan SuperAdmin.</li>
            <li>Database-backed progress dan attempt snapshots.</li>
            <li>Content CRUD/import/export dengan source evidence audit.</li>
            <li>Attempt reset dengan audit log, bukan localStorage.</li>
          </ul>
          <button type="button" className="secondary-button" onClick={resetLocalProgress}>
            <RotateCcw aria-hidden="true" size={18} />
            Reset progress lokal
          </button>
        </section>
      </section>
    );
  }

  return (
    <div className="app-shell">
      <aside
        className={sidebarCollapsed ? "app-sidebar is-collapsed" : "app-sidebar"}
        aria-label="Application sidebar"
      >
        <div className="sidebar-head">
          <div className="brand-block">
            <div className="brand-logo-block">
              <Image
                src="/persiapantubel-logo.png"
                alt="Persiapantubel"
                width={180}
                height={55}
                priority
              />
            </div>
            <span className="brand-kicker">TBI learning cockpit</span>
            <strong>Gerund & Infinitive</strong>
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={sidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen aria-hidden="true" size={20} />
            ) : (
              <PanelLeftClose aria-hidden="true" size={20} />
            )}
          </button>
        </div>

        <nav aria-label="Navigasi utama">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-current={view === item.id ? "page" : undefined}
                className={view === item.id ? "active" : ""}
                onClick={() => changeView(item.id)}
              >
                <Icon aria-hidden="true" size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <Sparkles aria-hidden="true" size={18} />
          <span>{contentStats.total} curated items</span>
        </div>
      </aside>

      <main className="main-content">
        {view === "dashboard" ? renderDashboard() : null}
        {view === "search" ? renderSearch() : null}
        {view === "materi" ? renderMateri() : null}
        {view === "flipcard" ? renderFlipcard() : null}
        {view === "tes" ? renderTes() : null}
        {view === "superadmin" ? renderSuperAdmin() : null}
      </main>

      {showScrollTop ? (
        <button
          type="button"
          className="scroll-top"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronUp aria-hidden="true" size={20} />
        </button>
      ) : null}
    </div>
  );
}
