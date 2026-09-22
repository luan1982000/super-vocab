import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ConfigNotice } from './components/ConfigNotice'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './hooks/AuthProvider'
import { isSupabaseConfigured } from './lib/supabase'
import { LoginPage } from './pages/LoginPage'
import { PracticePage } from './pages/PracticePage'
import { VocabPage } from './pages/VocabPage'

export default function App() {
  if (!isSupabaseConfigured) return <ConfigNotice />

  return (
    <HashRouter>
      <AuthProvider>
        <div className="min-h-screen bg-paper text-ink">
          <Navbar />
          <main className="mx-auto w-full max-w-[56rem] px-6 py-10 sm:py-12">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/vocab"
                element={
                  <ProtectedRoute>
                    <VocabPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practice"
                element={
                  <ProtectedRoute>
                    <PracticePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/vocab" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </HashRouter>
  )
}
