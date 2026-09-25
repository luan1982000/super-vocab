import type { ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ConfigNotice } from './components/ConfigNotice'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './hooks/AuthProvider'
import { isSupabaseConfigured } from './lib/supabase'
import { FlashcardPage } from './pages/FlashcardPage'
import { LoginPage } from './pages/LoginPage'
import { PracticePage } from './pages/PracticePage'
import { VocabListPage } from './pages/VocabListPage'
import { VocabPage } from './pages/VocabPage'
import { WritingPage } from './pages/WritingPage'

/** Mọi trang trong app đều cần đăng nhập; chỉ `/login` là ngoại lệ. */
const protectedPage = (element: ReactNode) => <ProtectedRoute>{element}</ProtectedRoute>

export default function App() {
  if (!isSupabaseConfigured) return <ConfigNotice />

  return (
    <HashRouter>
      <AuthProvider>
        <AppShell>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/vocab" element={protectedPage(<VocabPage />)} />
            <Route path="/vocab/list" element={protectedPage(<VocabListPage />)} />
            <Route path="/practice" element={protectedPage(<PracticePage />)} />
            <Route path="/practice/flashcard" element={protectedPage(<FlashcardPage />)} />
            <Route path="/practice/writing" element={protectedPage(<WritingPage />)} />
            <Route path="*" element={<Navigate to="/vocab" replace />} />
          </Routes>
        </AppShell>
      </AuthProvider>
    </HashRouter>
  )
}
