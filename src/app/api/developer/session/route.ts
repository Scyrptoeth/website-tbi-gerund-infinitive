import { getAdminConfigStatus, isAdminAuthenticated } from "@/lib/admin-auth";
import { getDatabaseConfigStatus } from "@/lib/cms-db";

export async function GET() {
  return Response.json({
    authenticated: await isAdminAuthenticated(),
    auth: getAdminConfigStatus(),
    database: getDatabaseConfigStatus(),
  });
}
