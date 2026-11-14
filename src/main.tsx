import { LazyMotion, MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { AuthProvider } from './features/auth'
// Fontes servidas pelo próprio site (sem requisição bloqueante ao Google Fonts).
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import './index.css'
import { supabase } from './lib/supabase'
import { routes } from './routes'

const router = createBrowserRouter(routes)

// Recursos de animação do Motion baixados depois do primeiro carregamento.
const loadMotionFeatures = () => import('./ui/motionFeatures').then((m) => m.default)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <AuthProvider client={supabase}>
          <RouterProvider router={router} />
        </AuthProvider>
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
)
