"use client";

import { useCallback, useEffect, useState } from "react";

type SessionState = {
  authenticated: boolean;
  auth: { hasPassword: boolean; hasSessionSecret: boolean };
  database: { hasDatabaseUrl: boolean };
};

type CmsRecord = {
  id: string;
  collection: "settings" | "verb" | "question";
  payload: unknown;
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

const templates = {
  settings: {
    id: "site-settings",
    collection: "settings" as const,
    payload: {
      searchTitle: "Pencarian",
      searchPlaceholder: "Contoh: stop, to-infinitive, menunda",
    },
  },
  verb: {
    id: "verb:gerund-admit",
    collection: "verb" as const,
    payload: {
      meaning: "mengakui",
      usageNote:
        'Setelah "admit", gunakan Verb-ing jika ada aksi lain yang mengikuti langsung.',
      commonMistake:
        'Hindari bentuk "admit to review" untuk pola pelengkap langsung ini.',
    },
  },
  question: {
    id: "question:q-gerund-admit",
    collection: "question" as const,
    payload: {
      prompt: 'Pilih kalimat yang paling tepat untuk pola "admit".',
      explanation:
        'Jawaban benar A. "admit" termasuk pola admit + Verb-ing, sehingga verb berikutnya memakai bentuk -ing.',
    },
  },
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function DeveloperCms() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<CmsRecord[]>([]);
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [collection, setCollection] = useState<"settings" | "verb" | "question">(
    "settings",
  );
  const [recordId, setRecordId] = useState(templates.settings.id);
  const [payloadText, setPayloadText] = useState(formatJson(templates.settings.payload));
  const [published, setPublished] = useState(true);
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

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

  const loadSession = useCallback(async () => {
    const response = await fetch("/api/developer/session");
    const nextSession = (await response.json()) as SessionState;
    setSession(nextSession);

    if (nextSession.authenticated) {
      await loadCms();
    }
  }, [loadCms]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSession();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSession]);

  function changeCollection(nextCollection: "settings" | "verb" | "question") {
    const template = templates[nextCollection];

    setCollection(nextCollection);
    setRecordId(template.id);
    setPayloadText(formatJson(template.payload));
  }

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
      setMessage(response.ok ? "Schema CMS siap." : "Gagal menyiapkan schema CMS.");
      await loadCms();
    } finally {
      setIsBusy(false);
    }
  }

  async function saveRecord() {
    setIsBusy(true);
    setMessage("");

    try {
      let payload: unknown;

      try {
        payload = JSON.parse(payloadText);
      } catch {
        setMessage("Payload harus berupa JSON valid.");
        return;
      }

      const response = await fetch("/api/developer/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recordId, collection, payload, published }),
      });

      if (!response.ok) {
        setMessage("Gagal menyimpan record CMS.");
        return;
      }

      await loadCms();
      setMessage("Record CMS tersimpan.");
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteRecord(id: string) {
    setIsBusy(true);
    setMessage("");

    try {
      const response = await fetch(`/api/developer/cms?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setMessage("Gagal menghapus record CMS.");
        return;
      }

      await loadCms();
      setMessage("Record CMS dihapus.");
    } finally {
      setIsBusy(false);
    }
  }

  function editExisting(record: CmsRecord) {
    setCollection(record.collection);
    setRecordId(record.id);
    setPayloadText(formatJson(record.payload));
    setPublished(record.published);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="developer-shell">
      <section className="panel developer-hero">
        <div>
          <span className="eyebrow">Developer CMS</span>
          <h1>Content control room</h1>
          <p>
            Panel ini mengelola override database untuk Pencarian, Materi,
            Flipcard, dan Tes tanpa mengubah source content static.
          </p>
        </div>
        {session?.authenticated ? (
          <button type="button" className="secondary-button" onClick={logout}>
            Logout
          </button>
        ) : null}
      </section>

      {!session ? (
        <section className="panel">
          <p>Memeriksa sesi developer...</p>
        </section>
      ) : null}

      {session && (!session.auth.hasPassword || !session.database.hasDatabaseUrl) ? (
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
      ) : null}

      {session && !session.authenticated && session.auth.hasPassword ? (
        <section className="panel auth-panel">
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
          <button
            type="button"
            className="primary-button"
            disabled={isBusy}
            onClick={login}
          >
            Masuk
          </button>
        </section>
      ) : null}

      {session?.authenticated ? (
        <>
          <section className="stats-grid">
            <article className="stat-card">
              <span>CMS records</span>
              <strong>{records.length}</strong>
              <small>published dan draft override</small>
            </article>
            <article className="stat-card">
              <span>Audit events</span>
              <strong>{audit.length}</strong>
              <small>50 event terbaru</small>
            </article>
          </section>

          <section className="panel cms-editor">
            <div className="section-head">
              <div>
                <span className="eyebrow">Editor</span>
                <h2>Override record</h2>
              </div>
              <button
                type="button"
                className="secondary-button"
                disabled={isBusy}
                onClick={initializeDatabase}
              >
                Init schema
              </button>
            </div>

            <div className="cms-form-grid">
              <label>
                Collection
                <select
                  value={collection}
                  onChange={(event) =>
                    changeCollection(
                      event.target.value as "settings" | "verb" | "question",
                    )
                  }
                >
                  <option value="settings">Settings</option>
                  <option value="verb">Verb</option>
                  <option value="question">Question</option>
                </select>
              </label>
              <label>
                Record ID
                <input
                  value={recordId}
                  onChange={(event) => setRecordId(event.target.value)}
                />
              </label>
              <label className="cms-checkbox">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                />
                Published
              </label>
            </div>

            <label>
              Payload JSON
              <textarea
                value={payloadText}
                onChange={(event) => setPayloadText(event.target.value)}
                rows={14}
                spellCheck={false}
              />
            </label>

            <div className="button-row">
              <button
                type="button"
                className="primary-button"
                disabled={isBusy}
                onClick={saveRecord}
              >
                Simpan record
              </button>
              {message ? <p className="cms-message">{message}</p> : null}
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">Records</span>
            <div className="cms-record-list">
              {records.map((record) => (
                <article key={record.id} className="cms-record">
                  <div>
                    <strong>{record.id}</strong>
                    <small>
                      {record.collection} | {record.published ? "published" : "draft"} |{" "}
                      {new Date(record.updatedAt).toLocaleString("id-ID")}
                    </small>
                  </div>
                  <div className="button-row">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => editExisting(record)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => deleteRecord(record.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">Audit log</span>
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
      ) : null}
    </main>
  );
}
