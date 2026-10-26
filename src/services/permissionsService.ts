import { apiGet } from "@/services/http";
import type { Permission } from "@/data/types";

// GET /api/permissions
export async function getPermissions(): Promise<Permission[]> {
  return apiGet<Permission[]>("/api/permissions");
}
