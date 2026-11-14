import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router'
import { RequireSession } from './features/auth'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RouteLoading } from './pages/RouteLoading'

// A raspadinha (porta de entrada) vai no pacote principal; as demais telas
// são baixadas sob demanda.
const page = (load: () => Promise<{ default: ComponentType }>): Pick<RouteObject, 'lazy'> => ({
  lazy: async () => ({ Component: (await load()).default }),
})

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/ui',
        ...page(() =>
          import('./pages/dev/UiPreviewPage').then((m) => ({ default: m.UiPreviewPage })),
        ),
      },
    ]
  : []

export const routes: RouteObject[] = [
  {
    HydrateFallback: RouteLoading,
    children: [
      {
        // Telas que dependem de sessão (anônima ou com conta).
        element: <RequireSession />,
        children: [
          { path: '/', element: <HomePage /> },
          {
            path: '/cupom',
            ...page(() => import('./pages/CouponPage').then((m) => ({ default: m.CouponPage }))),
          },
          {
            path: '/closet',
            ...page(() => import('./pages/ClosetPage').then((m) => ({ default: m.ClosetPage }))),
          },
          {
            path: '/tenis/:slug',
            ...page(() => import('./pages/SneakerPage').then((m) => ({ default: m.SneakerPage }))),
          },
          {
            path: '/entrar',
            ...page(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage }))),
          },
        ],
      },
      {
        path: '/privacidade',
        ...page(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))),
      },
      ...devRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
