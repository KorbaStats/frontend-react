import { apiGet, apiRequest } from "@/services/http";
import type { Role, RoleInput } from "@/data/types";

// GET /api/roles
export async function getRoles(): Promise<Role[]> {
  return apiGet<Role[]>("/api/roles");
}

// POST /api/roles
export async function createRole(input: RoleInput): Promise<Role> {
  return apiRequest<Role>("/api/roles", { method: "POST", body: input });
}

// PATCH /api/roles/:id
export async function updateRole(id: number, input: RoleInput): Promise<Role> {
  return apiRequest<Role>(`/api/roles/${id}`, { method: "PATCH", body: input });
}

// DELETE /api/roles/:id
export async function deleteRole(id: number): Promise<void> {
  await apiRequest<void>(`/api/roles/${id}`, { method: "DELETE" });
}
