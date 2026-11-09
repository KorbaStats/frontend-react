/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/hooks/useAuth"
import {
  getFavouriteTeamIds,
  addFavouriteTeam,
  removeFavouriteTeam,
  takeLegacyFavouriteTeamIds,
} from "@/services/favouriteTeamsService"

type FavouriteTeamsContextValue = {
  favouriteTeamsIds: number[]
  isLoadingFavourites: boolean
  // ulubione są zapisywane na koncie - niezalogowany użytkownik ich nie ma
  canUseFavourites: boolean
  isFavourite: (teamId: number) => boolean
  toggleFavouriteTeam: (teamId: number) => void
}

const FavouriteTeamsContext =
  createContext<FavouriteTeamsContextValue | null>(null)

const EMPTY_IDS: number[] = []

export const FavouriteTeamsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const queryKey = ["favourites", "teams", user?.id ?? null] as const

  const { data: favouriteTeamsIds = EMPTY_IDS, isPending } = useQuery({
    queryKey,
    queryFn: async () => {
      const legacyIds = takeLegacyFavouriteTeamIds()
      // drużyna mogła zostać usunięta z bazy - pomijamy błędy pojedynczych wpisów
      await Promise.allSettled(legacyIds.map(addFavouriteTeam))
      return getFavouriteTeamIds()
    },
    enabled: user !== null,
  })

  const isFavourite = (teamId: number) => favouriteTeamsIds.includes(teamId)

  const { mutate: toggleFavouriteTeam } = useMutation({
    mutationFn: async (teamId: number) => {
      if (isFavourite(teamId)) await removeFavouriteTeam(teamId)
      else await addFavouriteTeam(teamId)
    },
    // gwiazdka zmienia się od razu, przy błędzie wracamy do poprzedniego stanu
    onMutate: async (teamId: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<number[]>(queryKey)
      queryClient.setQueryData<number[]>(queryKey, (ids = []) =>
        ids.includes(teamId) ? ids.filter((id) => id !== teamId) : [teamId, ...ids],
      )
      return { previous }
    },
    onError: (_error, _teamId, context) =>
      queryClient.setQueryData(queryKey, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  return (
    <FavouriteTeamsContext.Provider
      value={{
        favouriteTeamsIds: user ? favouriteTeamsIds : EMPTY_IDS,
        isLoadingFavourites: user !== null && isPending,
        canUseFavourites: user !== null,
        isFavourite,
        toggleFavouriteTeam,
      }}
    >
      {children}
    </FavouriteTeamsContext.Provider>
  )
}

export const useFavouriteTeams = () => {
  const ctx = useContext(FavouriteTeamsContext)
  if (!ctx)
    throw new Error(
      "useFavouriteTeams must be used within a FavouriteTeamsProvider",
    )
  return ctx
}
