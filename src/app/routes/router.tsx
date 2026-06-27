import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { AuthLayout } from './AuthLayout'
import { NotFoundPage } from './NotFoundPage'

// `RequireAuth` (./RequireAuth.tsx) is built and ready, but not applied here
// yet: sign-in is still simulated (no real session ever exists), so the
// guard would only bounce every visit straight back to /login. Once
// LoginPage calls real Supabase Auth, wrap the routes below with
// `{ element: <RequireAuth />, children: [...] }` — see ADR-0009.
//
// Page components are lazy-loaded per route (React Router's `lazy` route
// field) rather than imported eagerly: each page pulls in its own feature
// code (forms, dialogs, etc.) that the *other* pages don't need on first
// paint, and splitting at this boundary is what keeps the initial bundle
// from bundling every page's code into one chunk — see ADR-0019.
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        lazy: () => import('./HomePage').then((m) => ({ Component: m.HomePage })),
      },
      {
        path: '/decks',
        lazy: () => import('./DecksPage').then((m) => ({ Component: m.DecksPage })),
      },
      {
        path: '/decks/:deckId',
        lazy: () => import('./DeckDetailPage').then((m) => ({ Component: m.DeckDetailPage })),
      },
      {
        path: '/settings',
        lazy: () => import('./SettingsPage').then((m) => ({ Component: m.SettingsPage })),
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        lazy: () => import('./LoginPage').then((m) => ({ Component: m.LoginPage })),
      },
      {
        path: '/signup',
        lazy: () => import('./SignUpPage').then((m) => ({ Component: m.SignUpPage })),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
