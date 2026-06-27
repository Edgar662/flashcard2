import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { AuthLayout } from './AuthLayout'
import { HomePage } from './HomePage'
import { DecksPage } from './DecksPage'
import { DeckDetailPage } from './DeckDetailPage'
import { SettingsPage } from './SettingsPage'
import { LoginPage } from './LoginPage'
import { SignUpPage } from './SignUpPage'
import { NotFoundPage } from './NotFoundPage'

// `RequireAuth` (./RequireAuth.tsx) is built and ready, but not applied here
// yet: sign-in is still simulated (no real session ever exists), so the
// guard would only bounce every visit straight back to /login. Once
// LoginPage calls real Supabase Auth, wrap the routes below with
// `{ element: <RequireAuth />, children: [...] }` — see ADR-0009.
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/decks', element: <DecksPage /> },
      { path: '/decks/:deckId', element: <DeckDetailPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignUpPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
