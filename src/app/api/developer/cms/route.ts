import { requireAdmin } from "@/lib/admin-auth";
import {
  deleteCmsRecord,
  listAuditRecords,
  listCmsRecords,
  upsertCmsRecord,
} from "@/lib/cms-db";

export async function GET() {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  return Response.json({
    records: await listCmsRecords(),
    audit: await listAuditRecords(),
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const body = (await request.json().catch(() => null)) as
    | {
        id?: string;
        collection?: "settings" | "verb" | "question";
        payload?: unknown;
        published?: boolean;
      }
    | null;

  if (!body?.id || !body.collection || typeof body.payload !== "object") {
    return Response.json({ error: "Payload CMS tidak valid." }, { status: 400 });
  }

  await upsertCmsRecord({
    id: body.id,
    collection: body.collection,
    payload: body.payload,
    published: body.published ?? true,
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID wajib diisi." }, { status: 400 });
  }

  await deleteCmsRecord(id);

  return Response.json({ ok: true });
}
