import { Star } from "lucide-react";
import { useNavigate } from "react-router";

import { useFavouriteTeams } from "@/hooks/useFavouriteTeams";

interface FavouriteStarProps {
  teamId: number;
  size?: number;
  className?: string;
}

const FavouriteStar = ({ teamId, size = 16, className = "" }: FavouriteStarProps) => {
  const { isFavourite, toggleFavouriteTeam, canUseFavourites } = useFavouriteTeams();
  const navigate = useNavigate();

  const favourite = isFavourite(teamId);
  const label = !canUseFavourites
    ? "Zaloguj się, aby dodać do ulubionych"
    : favourite
      ? "Usuń z ulubionych"
      : "Dodaj do ulubionych";

  return (
    <button
      onClick={() =>
        canUseFavourites ? toggleFavouriteTeam(teamId) : navigate("/login")
      }
      aria-pressed={favourite}
      aria-label={label}
      title={label}
      className={`rounded-md p-1 transition-colors hover:cursor-pointer hover:bg-accent ${
        favourite ? "text-primary" : "text-muted-foreground hover:text-primary"
      } ${className}`}
    >
      <Star
        size={size}
        strokeWidth={2}
        fill={favourite ? "currentColor" : "none"}
      />
    </button>
  );
};

export default FavouriteStar;
