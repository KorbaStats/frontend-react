import { Star } from "lucide-react";

import { useFavouriteTeams } from "@/hooks/useFavouriteTeams";

interface FavouriteStarProps {
  teamId: number;
  size?: number;
  className?: string;
}

const FavouriteStar = ({ teamId, size = 16, className = "" }: FavouriteStarProps) => {
  const { isFavourite, toggleFavouriteTeam } = useFavouriteTeams();

  const favourite = isFavourite(teamId);
  const label = favourite ? "Usuń z ulubionych" : "Dodaj do ulubionych";

  return (
    <button
      onClick={() => toggleFavouriteTeam(teamId)}
      aria-pressed={favourite}
      aria-label={label}
      title={label}
      className={`rounded-md p-1 transition-colors hover:cursor-pointer hover:bg-accent ${
        favourite ? "text-primary" : "text-muted-foreground hover:text-primary"
      } ${className}`}
    >
      {/* currentColor - wypelnienie idzie za kolorem tekstu z klasy wyzej */}
      <Star
        size={size}
        strokeWidth={2}
        fill={favourite ? "currentColor" : "none"}
      />
    </button>
  );
};

export default FavouriteStar;
