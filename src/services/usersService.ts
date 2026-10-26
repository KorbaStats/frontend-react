import { apiGetAllPages, apiRequest } from "@/services/http";
import type { PaginatedResponse, UserAccount, UserAccountInput } from "@/data/types";

// GET /api/users
export async function getUsers(): Promise<PaginatedResponse<UserAccount>> {
  return apiGetAllPages<UserAccount>("/api/users");
}

// POST /api/users
export async function createUser(input: UserAccountInput): Promise<void> {
  await apiRequest("/api/users", { method: "POST", body: input });
}

// PATCH /api/users/:id
export async function updateUser(id: number, input: UserAccountInput): Promise<void> {
  await apiRequest(`/api/users/${id}`, { method: "PATCH", body: input });
}

// DELETE /api/users/:id
export async function deleteUser(id: number): Promise<void> {
  await apiRequest<void>(`/api/users/${id}`, { method: "DELETE" });
}
