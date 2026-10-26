const PERMISSION_LABELS: Record<string, string> = {
  users: "Użytkownicy",
  roles: "Role",
  leagues: "Ligi",
  teams: "Drużyny",
  matches: "Mecze",
  stadiums: "Stadiony",
  weather: "Pogoda",
};

export function getPermissionLabel(name: string): string {
  return PERMISSION_LABELS[name] ?? name;
}
