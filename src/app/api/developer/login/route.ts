import { setAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { password?: string }
    | null;

  if (!(await verifyAdminPassword(body?.password ?? ""))) {
    return Response.json({ error: "Password tidak valid." }, { status: 401 });
  }

  await setAdminSession();

  return Response.json({ ok: true });
}
