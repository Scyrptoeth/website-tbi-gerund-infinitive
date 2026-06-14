import { Pool } from "pg";
import type { CmsPublicPayload, CmsSiteSettings } from "@/lib/cms-public";

type CmsCollection = "settings" | "verb" | "question";

export type CmsRecord = {
  id: string;
  collection: CmsCollection;
  payload: unknown;
  published: boolean;
  updatedAt: string;
  updatedBy: string;
};

export type AuditRecord = {
  id: number;
  action: string;
  recordId: string;
  collection: string;
  createdAt: string;
  actor: string;
};

let pool: Pool | null = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? "";
}

export function getDatabaseConfigStatus() {
  return {
    hasDatabaseUrl: Boolean(getDatabaseUrl()),
  };
}

function getPool() {
  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  pool ??= new Pool({
    connectionString,
    max: 3,
    ssl: connectionString.includes("localhost")
      ? undefined
      : { rejectUnauthorized: false },
  });

  return pool;
}

export async function ensureCmsSchema() {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS cms_content (
        id TEXT PRIMARY KEY,
        collection TEXT NOT NULL CHECK (collection IN ('settings', 'verb', 'question')),
        payload JSONB NOT NULL,
        published BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by TEXT NOT NULL DEFAULT 'developer'
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS cms_audit_log (
        id BIGSERIAL PRIMARY KEY,
        action TEXT NOT NULL,
        record_id TEXT NOT NULL,
        collection TEXT NOT NULL,
        actor TEXT NOT NULL DEFAULT 'developer',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listCmsRecords() {
  await ensureCmsSchema();

  const result = await getPool().query<{
    id: string;
    collection: CmsCollection;
    payload: unknown;
    published: boolean;
    updated_at: Date;
    updated_by: string;
  }>(`
    SELECT id, collection, payload, published, updated_at, updated_by
    FROM cms_content
    ORDER BY collection, id
  `);

  return result.rows.map<CmsRecord>((row) => ({
    id: row.id,
    collection: row.collection,
    payload: row.payload,
    published: row.published,
    updatedAt: row.updated_at.toISOString(),
    updatedBy: row.updated_by,
  }));
}

export async function listAuditRecords() {
  await ensureCmsSchema();

  const result = await getPool().query<{
    id: string;
    action: string;
    record_id: string;
    collection: string;
    created_at: Date;
    actor: string;
  }>(`
    SELECT id, action, record_id, collection, created_at, actor
    FROM cms_audit_log
    ORDER BY id DESC
    LIMIT 50
  `);

  return result.rows.map<AuditRecord>((row) => ({
    id: Number(row.id),
    action: row.action,
    recordId: row.record_id,
    collection: row.collection,
    createdAt: row.created_at.toISOString(),
    actor: row.actor,
  }));
}

export async function upsertCmsRecord(record: {
  id: string;
  collection: CmsCollection;
  payload: unknown;
  published: boolean;
}) {
  await ensureCmsSchema();

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `
        INSERT INTO cms_content (id, collection, payload, published, updated_by)
        VALUES ($1, $2, $3::jsonb, $4, 'developer')
        ON CONFLICT (id)
        DO UPDATE SET
          collection = EXCLUDED.collection,
          payload = EXCLUDED.payload,
          published = EXCLUDED.published,
          updated_at = NOW(),
          updated_by = EXCLUDED.updated_by
      `,
      [
        record.id,
        record.collection,
        JSON.stringify(record.payload),
        record.published,
      ],
    );
    await client.query(
      `
        INSERT INTO cms_audit_log (action, record_id, collection, actor)
        VALUES ('upsert', $1, $2, 'developer')
      `,
      [record.id, record.collection],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteCmsRecord(id: string) {
  await ensureCmsSchema();

  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const existing = await client.query<{ collection: string }>(
      "SELECT collection FROM cms_content WHERE id = $1",
      [id],
    );
    await client.query("DELETE FROM cms_content WHERE id = $1", [id]);
    await client.query(
      `
        INSERT INTO cms_audit_log (action, record_id, collection, actor)
        VALUES ('delete', $1, $2, 'developer')
      `,
      [id, existing.rows[0]?.collection ?? "unknown"],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getPublicCmsPayload(): Promise<CmsPublicPayload> {
  if (!getDatabaseUrl()) {
    return {
      configured: false,
      settings: {},
      verbs: [],
      questions: [],
    };
  }

  await ensureCmsSchema();

  const result = await getPool().query<{
    id: string;
    collection: CmsCollection;
    payload: unknown;
  }>(`
    SELECT id, collection, payload
    FROM cms_content
    WHERE published = TRUE
    ORDER BY collection, id
  `);

  const settings = result.rows.find((row) => row.id === "site-settings")
    ?.payload as CmsSiteSettings | undefined;

  return {
    configured: true,
    settings: settings ?? {},
    verbs: result.rows
      .filter((row) => row.collection === "verb")
      .map((row) => ({ id: row.id.replace(/^verb:/, ""), ...(row.payload as object) })),
    questions: result.rows
      .filter((row) => row.collection === "question")
      .map((row) => ({
        id: row.id.replace(/^question:/, ""),
        ...(row.payload as object),
      })),
  };
}
