/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react"

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

export const FavouriteTeamsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [favouriteTeamsIds, setFavouriteTeamsIds] = useState<number[]>([])
  const [isLoadingFavourites, setIsLoadingFavourites] = useState(true)

  useEffect(() => {
    getFavouriteTeamIds()
      .then(setFavouriteTeamsIds)
      .finally(() => setIsLoadingFavourites(false))
  }, [])

  const isFavourite = (teamId: number) => favouriteTeamsIds.includes(teamId)

  const toggleFavouriteTeam = async (teamId: number) => {
    if (isFavourite(teamId)) {
      await removeFavouriteTeam(teamId)
    } else {
      await addFavouriteTeam(teamId)
    }
    setFavouriteTeamsIds(await getFavouriteTeamIds())
  }

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
