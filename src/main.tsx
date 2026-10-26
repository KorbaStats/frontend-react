import "./globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./hooks/useAuth.tsx";
import { ThemeProvider } from "./hooks/useTheme.tsx";
import { FavouriteTeamsProvider } from "./hooks/useFavouriteTeams.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import MainLayout from "./components/layout/MainLayout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import TeamDetails from "./pages/TeamDetails.tsx";
import Matches from "./pages/Matches.tsx";
import MatchDetails from "./pages/MatchDetails.tsx";
import Leagues from "./pages/Leagues.tsx";
import LeagueDetails from "./pages/LeagueDetails.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Profile from "./pages/Profile.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminUsersRoles from "./pages/admin/AdminUsersRoles.tsx";
import AdminDataLayout from "./components/admin/AdminDataLayout.tsx";
import AdminLeagues from "./pages/admin/AdminLeagues.tsx";
import AdminTeams from "./pages/admin/AdminTeams.tsx";
import AdminStadiums from "./pages/admin/AdminStadiums.tsx";
import AdminMatches from "./pages/admin/AdminMatches.tsx";
import AdminWeather from "./pages/admin/AdminWeather.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <FavouriteTeamsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Dashboard />} />

                  <Route path="leagues" element={<Leagues />} />
                  <Route path="league/:id" element={<LeagueDetails />} />

                  <Route path="profile" element={<Profile />} />

                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<AdminUsersRoles />} />
                    <Route path="data" element={<AdminDataLayout />}>
                      <Route path="leagues" element={<AdminLeagues />} />
                      <Route path="teams" element={<AdminTeams />} />
                      <Route path="stadiums" element={<AdminStadiums />} />
                      <Route path="matches" element={<AdminMatches />} />
                    </Route>
                    <Route path="weather" element={<AdminWeather />} />
                  </Route>

                  <Route path="team/:id" element={<TeamDetails />} />
                  <Route path="matches" element={<Matches />} />
                  <Route path="match/:id" element={<MatchDetails />} />

                  {/*TODO: Predykcje*/}
                  <Route
                    path="predictions"
                    element={<div>Predictions page...</div>}
                  />

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </FavouriteTeamsProvider>
        </ThemeProvider>
      </AuthProvider>


      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  </StrictMode>,
);
