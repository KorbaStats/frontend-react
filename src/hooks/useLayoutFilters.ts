import { useOutletContext } from "react-router";
import type { MatchFilters } from "@/lib/matchFilters";

export type LayoutContext = {
  filters: MatchFilters;
  setFilters: (next: MatchFilters) => void;
};

export function useLayoutFilters(): LayoutContext {
  return useOutletContext<LayoutContext>();
}
