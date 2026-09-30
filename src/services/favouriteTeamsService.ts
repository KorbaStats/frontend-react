// GET /api/favourites/teams
// POST /api/favourites/teams/:teamId
// DELETE /api/favourites/teams/:teamId
// bez userID - backend ma wiedziec ktory uzytkownik ma jakie druzyny 

// placeholder - zapisujemy druzyny w localStorage na potrzeby dzialania aplikacji, TODO: zmienic ciało funkcji pod backend
const KEY = "korbastats:favourite-teams";

export async function getFavouriteTeamIds(): Promise<number[]> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    return parsed;
  } catch {
    return []
  }
}

function saveHelper(ids: number[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export async function addFavouriteTeam(teamId: number): Promise<void> {
  const ids = await getFavouriteTeamIds();
  if (ids.includes(teamId)) return;

  saveHelper([...ids, teamId]);
}

export async function removeFavouriteTeam(teamId: number): Promise<void> {
  const ids = await getFavouriteTeamIds();
  saveHelper(ids.filter((id) => id !== teamId));
}