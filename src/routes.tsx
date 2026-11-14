import type { RouteObject } from 'react-router'
import { RequireSession } from './features/auth'
import { AuthPage } from './pages/AuthPage'
import { ClosetPage } from './pages/ClosetPage'
import { CouponPage } from './pages/CouponPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { SneakerPage } from './pages/SneakerPage'

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/ui',
        lazy: async () => {
          const { UiPreviewPage } = await import('./pages/dev/UiPreviewPage')
          return { Component: UiPreviewPage }
        },
      },
    ]
  : []

export const routes: RouteObject[] = [
  {
    // Telas que dependem de sessão (anônima ou com conta).
    element: <RequireSession />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/cupom', element: <CouponPage /> },
      { path: '/closet', element: <ClosetPage /> },
      { path: '/tenis/:slug', element: <SneakerPage /> },
      { path: '/entrar', element: <AuthPage /> },
    ],
  },
  { path: '/privacidade', element: <PrivacyPage /> },
  ...devRoutes,
  { path: '*', element: <NotFoundPage /> },
]
