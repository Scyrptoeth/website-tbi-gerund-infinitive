import { requireAdmin } from "@/lib/admin-auth";
import { ensureCmsSchema } from "@/lib/cms-db";

export async function POST() {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  await ensureCmsSchema();

  return Response.json({ ok: true });
}
