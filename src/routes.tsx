import type { RouteObject } from 'react-router'
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
  { path: '/', element: <HomePage /> },
  { path: '/cupom', element: <CouponPage /> },
  { path: '/closet', element: <ClosetPage /> },
  { path: '/tenis/:slug', element: <SneakerPage /> },
  { path: '/privacidade', element: <PrivacyPage /> },
  ...devRoutes,
  { path: '*', element: <NotFoundPage /> },
]
