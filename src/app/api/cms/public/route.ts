import { getPublicCmsPayload } from "@/lib/cms-db";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getPublicCmsPayload());
}
