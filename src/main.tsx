import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './globals.css'
import { ThemeProvider } from './hooks/useTheme.tsx'

import MainLayout from './components/layout/MainLayout.tsx'
import Dashboard from './pages/Dashboard.tsx'
import TeamPage from './pages/TeamPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path='/team/:id' element={<TeamPage />} />
          </Route>
          
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
