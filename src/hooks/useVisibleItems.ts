import { useState, useCallback } from "react"

export function useVisibleItems<T>(items: T[], pageSize = 20): {
  visibleItems: T[]
  hiddenCount: number
  showMore: () => void
  reset: () => void
} {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenCount = Math.max(0, items.length - visibleCount);

  const showMore = useCallback(() => setVisibleCount((c) => c+pageSize), [pageSize]);
  const reset = useCallback(() => setVisibleCount(pageSize), [pageSize]);


  return {visibleItems, hiddenCount, showMore, reset}
}