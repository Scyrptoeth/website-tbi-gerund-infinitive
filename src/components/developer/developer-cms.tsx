"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OptionKey, PatternCategory, QuizOption } from "@/data/verb-content";

type SessionState = {
  authenticated: boolean;
  auth: { hasPassword: boolean; hasSessionSecret: boolean };
  database: { hasDatabaseUrl: boolean };
};

type CmsRecord = {
  id: string;
  collection: "settings" | "verb" | "question";
  payload: Record<string, unknown>;
  published: boolean;
  updatedAt: string;
  updatedBy: string;
};

type AuditRecord = {
  id: number;
  action: string;
  recordId: string;
  collection: string;
  createdAt: string;
  actor: string;
};

type CatalogVerb = {
  id: string;
  category: PatternCategory;
  label: string;
  verb1: string;
  verb2: string;
  verb3: string;
  meaning: string;
  patternLabel: string;
  topic: string;
  usageNote: string;
  contrastNote: string;
  commonMistake: string;
};

type CatalogQuestion = {
  id: string;
  verbId: string;
  number: number;
  prompt: string;
  options: QuizOption[];
  correctKey: OptionKey;
  explanation: string;
  verbLabel: string;
};

type CatalogPayload = {
  verbs: CatalogVerb[];
  questions: CatalogQuestion[];
  packages: Array<{ id: string; title: string; order: number }>;
};

type EditorTab = "search" | "verb" | "question" | "records";

const defaultSettings = {
  searchTitle: "Pencarian",
  searchPlaceholder: "Contoh: stop, to-infinitive, menunda",
};

const emptyCatalog: CatalogPayload = {
  verbs: [],
  questions: [],
  packages: [],
};

function getRecord(records: CmsRecord[], id: string) {
  return records.find((record) => record.id === id);
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function optionText(question: CatalogQuestion | undefined, key: OptionKey) {
  return question?.options.find((option) => option.key === key)?.text ?? "";
}

function cleanPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (typeof value === "string") {
        return value.trim().length > 0;
      }

      return value !== undefined && value !== null;
    }),
  );
}

export function DeveloperCms() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<CmsRecord[]>([]);
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [catalog, setCatalog] = useState<CatalogPayload>(emptyCatalog);
  const [activeTab, setActiveTab] = useState<EditorTab>("search");
  const [selectedVerbId, setSelectedVerbId] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [settingsForm, setSettingsForm] = useState(defaultSettings);
  const [verbForm, setVerbForm] = useState({
    meaning: "",
    patternLabel: "",
    topic: "",
    usageNote: "",
    contrastNote: "",
    commonMistake: "",
  });
  const [questionForm, setQuestionForm] = useState({
    prompt: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctKey: "A" as OptionKey,
    explanation: "",
  });
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const selectedVerb = catalog.verbs.find((verb) => verb.id === selectedVerbId);
  const selectedQuestion = catalog.questions.find(
    (question) => question.id === selectedQuestionId,
  );
  const selectedVerbOverride = getRecord(records, `verb:${selectedVerbId}`);
  const selectedQuestionOverride = getRecord(records, `question:${selectedQuestionId}`);
  const settingsOverride = getRecord(records, "site-settings");

  const filteredVerbs = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return catalog.verbs;
    }

    return catalog.verbs.filter((verb) =>
      [verb.label, verb.meaning, verb.patternLabel, verb.topic]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [catalog.verbs, query]);

  const filteredQuestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return catalog.questions;
    }

    return catalog.questions.filter((question) =>
      [question.id, question.verbLabel, question.prompt]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [catalog.questions, query]);

  const loadCms = useCallback(async () => {
    const response = await fetch("/api/developer/cms");

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as {
      records: CmsRecord[];
      audit: AuditRecord[];
    };
    setRecords(data.records);
    setAudit(data.audit);
  }, []);

  const loadCatalog = useCallback(async () => {
    const response = await fetch("/api/developer/catalog");

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as CatalogPayload;
    setCatalog(data);
    setSelectedVerbId((current) => current || data.verbs[0]?.id || "");
    setSelectedQuestionId((current) => current || data.questions[0]?.id || "");
  }, []);

  const loadSession = useCallback(async () => {
    const response = await fetch("/api/developer/session");
    const nextSession = (await response.json()) as SessionState;
    setSession(nextSession);

    if (nextSession.authenticated) {
      await Promise.all([loadCms(), loadCatalog()]);
    }
  }, [loadCatalog, loadCms]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSession();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSession]);

  useEffect(() => {
    const payload = settingsOverride?.payload ?? {};
    const timer = window.setTimeout(() => {
      setSettingsForm({
        searchTitle: stringValue(payload.searchTitle, defaultSettings.searchTitle),
        searchPlaceholder: stringValue(
          payload.searchPlaceholder,
          defaultSettings.searchPlaceholder,
        ),
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [settingsOverride]);

  useEffect(() => {
    if (!selectedVerb) {
      return;
    }

    const payload = selectedVerbOverride?.payload ?? {};
    const timer = window.setTimeout(() => {
      setVerbForm({
        meaning: stringValue(payload.meaning, selectedVerb.meaning),
        patternLabel: stringValue(payload.patternLabel, selectedVerb.patternLabel),
        topic: stringValue(payload.topic, selectedVerb.topic),
        usageNote: stringValue(payload.usageNote, selectedVerb.usageNote),
        contrastNote: stringValue(payload.contrastNote, selectedVerb.contrastNote),
        commonMistake: stringValue(payload.commonMistake, selectedVerb.commonMistake),
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedVerb, selectedVerbOverride]);

  useEffect(() => {
    if (!selectedQuestion) {
      return;
    }

    const payload = selectedQuestionOverride?.payload ?? {};
    const payloadOptions = Array.isArray(payload.options)
      ? (payload.options as QuizOption[])
      : selectedQuestion.options;
    const timer = window.setTimeout(() => {
      setQuestionForm({
        prompt: stringValue(payload.prompt, selectedQuestion.prompt),
        optionA:
          payloadOptions.find((option) => option.key === "A")?.text ??
          optionText(selectedQuestion, "A"),
        optionB:
          payloadOptions.find((option) => option.key === "B")?.text ??
          optionText(selectedQuestion, "B"),
        optionC:
          payloadOptions.find((option) => option.key === "C")?.text ??
          optionText(selectedQuestion, "C"),
        optionD:
          payloadOptions.find((option) => option.key === "D")?.text ??
          optionText(selectedQuestion, "D"),
        correctKey:
          payload.correctKey === "A" ||
          payload.correctKey === "B" ||
          payload.correctKey === "C" ||
          payload.correctKey === "D"
            ? payload.correctKey
            : selectedQuestion.correctKey,
        explanation: stringValue(payload.explanation, selectedQuestion.explanation),
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedQuestion, selectedQuestionOverride]);

  async function login() {
    setIsBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/developer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setMessage("Password tidak valid atau belum dikonfigurasi.");
        return;
      }

      setPassword("");
      await loadSession();
      setMessage("Login berhasil.");
    } finally {
      setIsBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/developer/logout", { method: "POST" });
    setRecords([]);
    setAudit([]);
    await loadSession();
  }

  async function initializeDatabase() {
    setIsBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/developer/cms/init", { method: "POST" });
      setMessage(response.ok ? "Database editor siap." : "Gagal menyiapkan database.");
      await loadCms();
    } finally {
      setIsBusy(false);
    }
  }

  async function saveRecord(args: {
    id: string;
    collection: "settings" | "verb" | "question";
    payload: Record<string, unknown>;
    successMessage: string;
  }) {
    setIsBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/developer/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: args.id,
          collection: args.collection,
          payload: cleanPayload(args.payload),
          published: true,
        }),
      });

      if (!response.ok) {
        setMessage("Gagal menyimpan perubahan.");
        return;
      }

      await loadCms();
      setMessage(args.successMessage);
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteRecord(id: string, successMessage = "Override dihapus.") {
    setIsBusy(true);
    setMessage("");

    try {
      const response = await fetch(`/api/developer/cms?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setMessage("Gagal menghapus override.");
        return;
      }

      await loadCms();
      setMessage(successMessage);
    } finally {
      setIsBusy(false);
    }
  }

  function renderAuth() {
    if (!session) {
      return (
        <section className="panel">
          <p>Memeriksa sesi developer...</p>
        </section>
      );
    }

    if (!session.auth.hasPassword || !session.database.hasDatabaseUrl) {
      return (
        <section className="panel">
          <span className="eyebrow">Konfigurasi belum lengkap</span>
          <h2>Environment production wajib dipasang</h2>
          <ul className="roadmap-list">
            <li>
              `ADMIN_PASSWORD` atau `DEVELOPER_PASSWORD`:{" "}
              {session.auth.hasPassword ? "tersedia" : "belum tersedia"}
            </li>
            <li>
              `DATABASE_URL`:{" "}
              {session.database.hasDatabaseUrl ? "tersedia" : "belum tersedia"}
            </li>
            <li>
              `ADMIN_SESSION_SECRET`:{" "}
              {session.auth.hasSessionSecret ? "tersedia" : "opsional tapi disarankan"}
            </li>
          </ul>
        </section>
      );
    }

    if (!session.authenticated) {
      return (
        <section className="panel auth-panel">
          <span className="eyebrow">Akses developer</span>
          <h2>Masuk untuk membuka editor</h2>
          <p>Password disimpan sebagai cookie aman dan tidak ditampilkan kembali.</p>
          <label htmlFor="developer-password">Password developer</label>
          <input
            id="developer-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void login();
              }
            }}
          />
          <div className="button-row">
            <button
              type="button"
              className="primary-button"
              disabled={isBusy}
              onClick={login}
            >
              Buka editor
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={isBusy}
              onClick={() => setPassword("")}
            >
              Hapus isian
            </button>
          </div>
        </section>
      );
    }

    return null;
  }

  function renderSearchEditor() {
    return (
      <section className="panel cms-editor">
        <div className="section-head">
          <div>
            <span className="eyebrow">Pencarian</span>
            <h2>Edit judul dan placeholder</h2>
            <p>Perubahan ini langsung memengaruhi bagian Pencarian di website.</p>
          </div>
          {settingsOverride ? (
            <button
              type="button"
              className="secondary-button"
              disabled={isBusy}
              onClick={() => deleteRecord("site-settings", "Pengaturan pencarian dikembalikan.")}
            >
              Kembalikan default
            </button>
          ) : null}
        </div>
        <div className="cms-form-grid two">
          <label>
            Judul pencarian
            <input
              value={settingsForm.searchTitle}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  searchTitle: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Placeholder kotak pencarian
            <input
              value={settingsForm.searchPlaceholder}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  searchPlaceholder: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <button
          type="button"
          className="primary-button"
          disabled={isBusy}
          onClick={() =>
            saveRecord({
              id: "site-settings",
              collection: "settings",
              payload: settingsForm,
              successMessage: "Pengaturan pencarian tersimpan.",
            })
          }
        >
          Simpan pengaturan
        </button>
      </section>
    );
  }

  function renderVerbEditor() {
    return (
      <section className="panel cms-editor">
        <div className="section-head">
          <div>
            <span className="eyebrow">Materi dan Flipcard</span>
            <h2>Edit data verb</h2>
            <p>
              Field ini dipakai di kartu Pencarian, Materi, dan Flipcard. Pilih verb,
              ubah teksnya, lalu simpan.
            </p>
          </div>
          {selectedVerbOverride ? (
            <button
              type="button"
              className="secondary-button"
              disabled={isBusy}
              onClick={() =>
                deleteRecord(`verb:${selectedVerbId}`, "Override verb dihapus.")
              }
            >
              Hapus override
            </button>
          ) : null}
        </div>

        <div className="cms-picker-grid">
          <label>
            Cari verb
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: stop, admit, meaning contrast"
            />
          </label>
          <label>
            Pilih verb
            <select
              value={selectedVerbId}
              onChange={(event) => setSelectedVerbId(event.target.value)}
            >
              {filteredVerbs.map((verb) => (
                <option key={verb.id} value={verb.id}>
                  {verb.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedVerb ? (
          <>
            <div className="cms-preview-strip">
              <strong>{selectedVerb.label}</strong>
              <span>{selectedVerb.category}</span>
              <span>{selectedVerbOverride ? "Sudah ada override" : "Belum ada override"}</span>
            </div>

            <div className="cms-form-grid two">
              <label>
                Arti Indonesia
                <input
                  value={verbForm.meaning}
                  onChange={(event) =>
                    setVerbForm((current) => ({
                      ...current,
                      meaning: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Topic
                <input
                  value={verbForm.topic}
                  onChange={(event) =>
                    setVerbForm((current) => ({
                      ...current,
                      topic: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label>
              Pola
              <input
                value={verbForm.patternLabel}
                onChange={(event) =>
                  setVerbForm((current) => ({
                    ...current,
                    patternLabel: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Catatan pemakaian
              <textarea
                value={verbForm.usageNote}
                onChange={(event) =>
                  setVerbForm((current) => ({
                    ...current,
                    usageNote: event.target.value,
                  }))
                }
                rows={4}
              />
            </label>
            <label>
              Catatan kontras
              <textarea
                value={verbForm.contrastNote}
                onChange={(event) =>
                  setVerbForm((current) => ({
                    ...current,
                    contrastNote: event.target.value,
                  }))
                }
                rows={4}
              />
            </label>
            <label>
              Kesalahan umum
              <textarea
                value={verbForm.commonMistake}
                onChange={(event) =>
                  setVerbForm((current) => ({
                    ...current,
                    commonMistake: event.target.value,
                  }))
                }
                rows={4}
              />
            </label>
            <button
              type="button"
              className="primary-button"
              disabled={isBusy}
              onClick={() =>
                saveRecord({
                  id: `verb:${selectedVerbId}`,
                  collection: "verb",
                  payload: verbForm,
                  successMessage: "Perubahan verb tersimpan.",
                })
              }
            >
              Simpan verb
            </button>
          </>
        ) : null}
      </section>
    );
  }

  function renderQuestionEditor() {
    return (
      <section className="panel cms-editor">
        <div className="section-head">
          <div>
            <span className="eyebrow">Tes</span>
            <h2>Edit soal A-D</h2>
            <p>
              Ubah teks soal, opsi A-D, kunci jawaban, dan pembahasan tanpa menyentuh
              kode.
            </p>
          </div>
          {selectedQuestionOverride ? (
            <button
              type="button"
              className="secondary-button"
              disabled={isBusy}
              onClick={() =>
                deleteRecord(
                  `question:${selectedQuestionId}`,
                  "Override soal dihapus.",
                )
              }
            >
              Hapus override
            </button>
          ) : null}
        </div>

        <div className="cms-picker-grid">
          <label>
            Cari soal
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: admit, agree, q-gerund"
            />
          </label>
          <label>
            Pilih soal
            <select
              value={selectedQuestionId}
              onChange={(event) => setSelectedQuestionId(event.target.value)}
            >
              {filteredQuestions.map((question) => (
                <option key={question.id} value={question.id}>
                  {question.number}. {question.verbLabel} - {question.id}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedQuestion ? (
          <>
            <div className="cms-preview-strip">
              <strong>Soal {selectedQuestion.number}</strong>
              <span>{selectedQuestion.verbLabel}</span>
              <span>
                {selectedQuestionOverride ? "Sudah ada override" : "Belum ada override"}
              </span>
            </div>

            <label>
              Teks soal
              <textarea
                value={questionForm.prompt}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    prompt: event.target.value,
                  }))
                }
                rows={3}
              />
            </label>
            <div className="cms-form-grid two">
              {(["A", "B", "C", "D"] as const).map((key) => (
                <label key={key}>
                  Opsi {key}
                  <input
                    value={questionForm[`option${key}`]}
                    onChange={(event) =>
                      setQuestionForm((current) => ({
                        ...current,
                        [`option${key}`]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <label>
              Kunci jawaban
              <select
                value={questionForm.correctKey}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    correctKey: event.target.value as OptionKey,
                  }))
                }
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </label>
            <label>
              Pembahasan
              <textarea
                value={questionForm.explanation}
                onChange={(event) =>
                  setQuestionForm((current) => ({
                    ...current,
                    explanation: event.target.value,
                  }))
                }
                rows={5}
              />
            </label>
            <button
              type="button"
              className="primary-button"
              disabled={isBusy}
              onClick={() =>
                saveRecord({
                  id: `question:${selectedQuestionId}`,
                  collection: "question",
                  payload: {
                    prompt: questionForm.prompt,
                    options: [
                      { key: "A", text: questionForm.optionA },
                      { key: "B", text: questionForm.optionB },
                      { key: "C", text: questionForm.optionC },
                      { key: "D", text: questionForm.optionD },
                    ],
                    correctKey: questionForm.correctKey,
                    explanation: questionForm.explanation,
                  },
                  successMessage: "Perubahan soal tersimpan.",
                })
              }
            >
              Simpan soal
            </button>
          </>
        ) : null}
      </section>
    );
  }

  function renderRecords() {
    return (
      <>
        <section className="panel">
          <span className="eyebrow">Records</span>
          <h2>Daftar perubahan tersimpan</h2>
          <div className="cms-record-list">
            {records.length === 0 ? (
              <p>Belum ada override. Semua konten masih memakai data default.</p>
            ) : null}
            {records.map((record) => (
              <article key={record.id} className="cms-record">
                <div>
                  <strong>{record.id}</strong>
                  <small>
                    {record.collection} | {record.published ? "published" : "draft"} |{" "}
                    {new Date(record.updatedAt).toLocaleString("id-ID")}
                  </small>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={isBusy}
                  onClick={() => deleteRecord(record.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <span className="eyebrow">Audit log</span>
          <h2>Riwayat aksi terbaru</h2>
          <div className="cms-record-list">
            {audit.map((entry) => (
              <article key={entry.id} className="cms-record">
                <div>
                  <strong>
                    {entry.action} {entry.recordId}
                  </strong>
                  <small>
                    {entry.collection} | {new Date(entry.createdAt).toLocaleString("id-ID")}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  }

  return (
    <main className="developer-shell">
      <section className="panel developer-hero">
        <div>
          <span className="eyebrow">Developer</span>
          <h1>Koreksi konten</h1>
          <p>
            Dashboard internal untuk memperbaiki Pencarian, Materi, Flipcard, dan
            Tes tanpa menyentuh file kode.
          </p>
        </div>
        {session?.authenticated ? (
          <div className="button-row">
            <button
              type="button"
              className="secondary-button"
              disabled={isBusy}
              onClick={initializeDatabase}
            >
              Muat ulang database
            </button>
            <button type="button" className="secondary-button" onClick={logout}>
              Hapus sesi
            </button>
          </div>
        ) : null}
      </section>

      {renderAuth()}

      {session?.authenticated ? (
        <>
          <section className="stats-grid">
            <article className="stat-card compact">
              <span>Verb bank</span>
              <strong>{catalog.verbs.length}</strong>
              <small>item dapat dipilih untuk Materi dan Flipcard</small>
            </article>
            <article className="stat-card compact">
              <span>Soal tes</span>
              <strong>{catalog.questions.length}</strong>
              <small>soal A-D dapat dikoreksi</small>
            </article>
            <article className="stat-card compact">
              <span>Override</span>
              <strong>{records.length}</strong>
              <small>perubahan aktif di database</small>
            </article>
            <article className="stat-card compact">
              <span>Audit</span>
              <strong>{audit.length}</strong>
              <small>riwayat aksi terbaru</small>
            </article>
          </section>

          <section className="panel cms-tabs" aria-label="Mode editor">
            {[
              ["search", "Pencarian"],
              ["verb", "Materi & Flipcard"],
              ["question", "Tes"],
              ["records", "Records"],
            ].map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "filter active" : "filter"}
                aria-pressed={activeTab === tab}
                onClick={() => {
                  setActiveTab(tab as EditorTab);
                  setQuery("");
                }}
              >
                {label}
              </button>
            ))}
          </section>

          {message ? <p className="cms-toast">{message}</p> : null}

          {activeTab === "search" ? renderSearchEditor() : null}
          {activeTab === "verb" ? renderVerbEditor() : null}
          {activeTab === "question" ? renderQuestionEditor() : null}
          {activeTab === "records" ? renderRecords() : null}
        </>
      ) : null}
    </main>
  );
}
