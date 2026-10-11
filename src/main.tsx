import "./globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, //odswiezanie fetcha co 5 min
      refetchOnWindowFocus: false, //brak refetcha po ponownym wejsciu na okno
      retry: 1, //ilosc ponowien nieudanego zapytania
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FavouriteTeamsProvider>
          <BrowserRouter>
            <Routes>
              {/*TODO: Auth */}
              <Route path="/login" element={<div>Login page...</div>} />
              <Route path="/register" element={<div>Register page...</div>} />

              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />

                <Route path="leagues" element={<Leagues />} />
                <Route path="league/:id" element={<LeagueDetails />} />

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
      
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  </StrictMode>,
);
