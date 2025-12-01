import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

// Lazy loading de páginas
const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then(module => ({ default: module.LoginPage })))
const SignupPage = lazy(() => import('@/pages/SignupPage').then(module => ({ default: module.SignupPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })))
const UpdatePasswordPage = lazy(() => import('@/pages/UpdatePasswordPage').then(module => ({ default: module.UpdatePasswordPage })))

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const PersonasPage = lazy(() => import('@/pages/PersonasPage').then(module => ({ default: module.PersonasPage })))
const NuevaPersonaPage = lazy(() => import('@/pages/NuevaPersonaPage').then(module => ({ default: module.NuevaPersonaPage })))
const PersonaDetallePage = lazy(() => import('@/pages/PersonaDetallePage').then(module => ({ default: module.PersonaDetallePage })))
const EditarPersonaPage = lazy(() => import('@/pages/EditarPersonaPage').then(module => ({ default: module.EditarPersonaPage })))

const CategoriasPage = lazy(() => import('@/pages/CategoriasPage').then(module => ({ default: module.CategoriasPage })))
const NuevaCategoriaPage = lazy(() => import('@/pages/NuevaCategoriaPage').then(module => ({ default: module.NuevaCategoriaPage })))
const EditarCategoriaPage = lazy(() => import('@/pages/EditarCategoriaPage').then(module => ({ default: module.EditarCategoriaPage })))

const ActividadesPage = lazy(() => import('@/pages/ActividadesPage').then(module => ({ default: module.ActividadesPage })))
const NuevaActividadPage = lazy(() => import('@/pages/NuevaActividadPage').then(module => ({ default: module.NuevaActividadPage })))
const ActividadDetallePage = lazy(() => import('@/pages/ActividadDetallePage').then(module => ({ default: module.ActividadDetallePage })))
const EditarActividadPage = lazy(() => import('@/pages/EditarActividadPage').then(module => ({ default: module.EditarActividadPage })))

const TransaccionesPage = lazy(() => import('@/pages/TransaccionesPage').then(module => ({ default: module.TransaccionesPage })))
const NuevaTransaccionPage = lazy(() => import('@/pages/NuevaTransaccionPage').then(module => ({ default: module.NuevaTransaccionPage })))
const TransaccionDetallePage = lazy(() => import('@/pages/TransaccionDetallePage').then(module => ({ default: module.TransaccionDetallePage })))
const EditarTransaccionPage = lazy(() => import('@/pages/EditarTransaccionPage').then(module => ({ default: module.EditarTransaccionPage })))

const ReportesPage = lazy(() => import('@/pages/ReportesPage').then(module => ({ default: module.ReportesPage })))
const UsuariosPage = lazy(() => import('@/pages/UsuariosPage').then(module => ({ default: module.UsuariosPage })))
const SedesPage = lazy(() => import('@/pages/SedesPage').then(module => ({ default: module.SedesPage })))

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" text="Cargando aplicación..." />
        </div>
      }>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />

          {/* Protegidas - Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protegidas - Personas */}
          <Route
            path="/personas"
            element={
              <ProtectedRoute>
                <PersonasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personas/nueva"
            element={
              <ProtectedRoute>
                <NuevaPersonaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personas/:id"
            element={
              <ProtectedRoute>
                <PersonaDetallePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personas/:id/editar"
            element={
              <ProtectedRoute>
                <EditarPersonaPage />
              </ProtectedRoute>
            }
          />

          {/* Protegidas - Contabilidad - Categorías */}
          <Route
            path="/categorias"
            element={
              <ProtectedRoute>
                <CategoriasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias/nueva"
            element={
              <ProtectedRoute>
                <NuevaCategoriaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias/:id/editar"
            element={
              <ProtectedRoute>
                <EditarCategoriaPage />
              </ProtectedRoute>
            }
          />

          {/* Protegidas - Contabilidad - Actividades */}
          <Route
            path="/actividades"
            element={
              <ProtectedRoute>
                <ActividadesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/actividades/nueva"
            element={
              <ProtectedRoute>
                <NuevaActividadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/actividades/:id"
            element={
              <ProtectedRoute>
                <ActividadDetallePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/actividades/:id/editar"
            element={
              <ProtectedRoute>
                <EditarActividadPage />
              </ProtectedRoute>
            }
          />

          {/* Protegidas - Contabilidad - Transacciones */}
          <Route
            path="/transacciones"
            element={
              <ProtectedRoute>
                <TransaccionesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transacciones/nueva"
            element={
              <ProtectedRoute>
                <NuevaTransaccionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transacciones/:id"
            element={
              <ProtectedRoute>
                <TransaccionDetallePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transacciones/:id/editar"
            element={
              <ProtectedRoute>
                <EditarTransaccionPage />
              </ProtectedRoute>
            }
          />

          {/* Protegidas - Reportes */}
          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <ReportesPage />
              </ProtectedRoute>
            }
          />

          {/* Protegidas - Admin */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sedes"
            element={
              <ProtectedRoute>
                <SedesPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}