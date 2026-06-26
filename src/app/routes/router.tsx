import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './RootLayout'
import { RequireAuth } from './RequireAuth'
import { HomePage } from './HomePage'
import { LoginPage } from './LoginPage'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [{ index: true, element: <HomePage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
