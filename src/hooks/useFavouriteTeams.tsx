/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getFavouriteTeamIds,
  addFavouriteTeam,
  removeFavouriteTeam,
} from "@/services/favouriteTeamsService"

type FavouriteTeamsContextValue = {
  favouriteTeamsIds: number[]
  isLoadingFavourites: boolean
  isFavourite: (teamId: number) => boolean
  toggleFavouriteTeam: (teamId: number) => void
}

const FavouriteTeamsContext =
  createContext<FavouriteTeamsContextValue | null>(null)

const FAVOURITE_TEAMS_KEY = ["favourites", "teams"] as const
const EMPTY_IDS: number[] = []

export const FavouriteTeamsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const queryClient = useQueryClient()

  const { data: favouriteTeamsIds = EMPTY_IDS, isPending: isLoadingFavourites } =
    useQuery({
      queryKey: FAVOURITE_TEAMS_KEY,
      queryFn: getFavouriteTeamIds,
    })

  const isFavourite = (teamId: number) => favouriteTeamsIds.includes(teamId)

  const { mutate: toggleFavouriteTeam } = useMutation({
    mutationFn: async (teamId: number) => {
      if (isFavourite(teamId)) {
        await removeFavouriteTeam(teamId)
      } else {
        await addFavouriteTeam(teamId)
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: FAVOURITE_TEAMS_KEY }),
  })

  return (
    <FavouriteTeamsContext.Provider
      value={{
        favouriteTeamsIds,
        isLoadingFavourites,
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
