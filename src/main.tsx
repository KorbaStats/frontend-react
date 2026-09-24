import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './globals.css'
import { ThemeProvider } from './hooks/useTheme.tsx'

import MainLayout from './components/layout/MainLayout.tsx'
import Dashboard from './pages/Dashboard.tsx'
import TeamDetails from './pages/TeamDetails.tsx'
import Matches from './pages/Matches.tsx'
import MatchDetails from './pages/MatchDetails.tsx'
import Leagues from './pages/Leagues.tsx'
import LeagueDetails from './pages/LeagueDetails.tsx'
import NotFound from './pages/NotFound.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/*TODO: Auth */}
          <Route path='/login' element={<div>Login page...</div>} />
          <Route path='/register' element={<div>Register page...</div>}/>

          <Route path='/' element={<MainLayout />}>
            <Route index element={<Dashboard />} />

              {/* Liga */}
              <Route path='leagues' element={<Leagues />} />
              <Route path='league/:id' element={<LeagueDetails />}/>

              {/* Druzyna */}
              <Route path='team/:id' element={<TeamDetails />} />
              {/* Mecze */}
              <Route path='matches' element={<Matches />} />
              <Route path='match/:id' element={<MatchDetails />} />

              {/*TODO: Predykcje*/}
              <Route path='predictions' element={<div>Predictions page...</div>}/>

              {/* Not Found Page */}
              <Route path='*' element={<NotFound/>} />
          </Route>

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
