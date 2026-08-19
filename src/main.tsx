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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
    <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path='/team/:id' element={<TeamDetails />} />
            {/* Mecze */}
            <Route path='/matches' element={<Matches />} />
            <Route path='/match/:id' element={<MatchDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
