import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";

import { Input } from "@/components/ui/input";
import type { Team } from "@/data/types";
import { useTeamSearch } from "@/hooks/useTeamSearch";
import { cn } from "@/lib/utils";

const Searchbar = () => {
  const { query, setQuery, results, loading, error, loadTeams } = useTeamSearch();
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const open = isFocused && query.trim().length >= 2;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsFocused(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const close = () => {
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleSelect = (team: Team | undefined) => {
    if (!team) return;
    navigate(`/team/${team.id}`);
    setQuery("");
    close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (!open || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      handleSelect(results[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
        }}
        onFocus={() => {
          setIsFocused(true);
          loadTeams();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Wyszukaj drużynę..."
        className="w-48 pl-8 xl:w-64"
        role="combobox"
        aria-expanded={open}
        aria-controls="team-search-results"
        aria-autocomplete="list"
      />

      {open && (
        <div
          id="team-search-results"
          role="listbox"
          className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-md border bg-popover shadow-md"
        >
          {loading && (
            <p className="px-3 py-2 text-sm text-muted-foreground">Ładowanie...</p>
          )}

          {error && <p className="px-3 py-2 text-sm text-destructive">{error}</p>}

          {!loading && !error && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Brak wyników dla „{query.trim()}”
            </p>
          )}

          {!loading &&
            !error &&
            results.map((team, index) => (
              <button
                key={team.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => handleSelect(team)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left",
                  index === activeIndex && "bg-accent",
                )}
              >
                <span className="truncate text-sm font-medium">{team.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {team.league?.name ?? team.city}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default Searchbar;
