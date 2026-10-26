import type { User } from "@/data/types";

export type AdminSection = {
  label: string;
  to: string;
  permissions: string[];
  end?: boolean;
};

export const DATA_SECTIONS: AdminSection[] = [
  { label: "Ligi", to: "/admin/data/leagues", permissions: ["leagues"] },
  { label: "Drużyny", to: "/admin/data/teams", permissions: ["teams"] },
  { label: "Stadiony", to: "/admin/data/stadiums", permissions: ["stadiums"] },
  { label: "Mecze", to: "/admin/data/matches", permissions: ["matches"] },
];

export const ADMIN_SECTIONS: AdminSection[] = [
  { label: "Użytkownicy i role", to: "/admin", permissions: ["users", "roles"], end: true },
  {
    label: "Dane",
    to: "/admin/data",
    permissions: DATA_SECTIONS.flatMap((section) => section.permissions),
  },
  { label: "Pogoda", to: "/admin/weather", permissions: ["weather"] },
];

export function hasPermission(user: User | null, permission: string): boolean {
  return user?.permissions.includes(permission) ?? false;
}

export function canAccessSection(user: User | null, section: AdminSection): boolean {
  return section.permissions.some((permission) => hasPermission(user, permission));
}

export function canAccessAdmin(user: User | null): boolean {
  return ADMIN_SECTIONS.some((section) => canAccessSection(user, section));
}

export function getAdminHome(user: User | null): string {
  return ADMIN_SECTIONS.find((section) => canAccessSection(user, section))?.to ?? "/";
}
