import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PersonasPage } from '@/pages/PersonasPage'
import { NuevaPersonaPage } from '@/pages/NuevaPersonaPage'
import { PersonaDetallePage } from '@/pages/PersonaDetallePage'
import { EditarPersonaPage } from '@/pages/EditarPersonaPage'
import { CategoriasPage } from '@/pages/CategoriasPage'
import { NuevaCategoriaPage } from '@/pages/NuevaCategoriaPage'
import { EditarCategoriaPage } from '@/pages/EditarCategoriaPage'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ActividadesPage } from '@/pages/ActividadesPage'
import { NuevaActividadPage } from '@/pages/NuevaActividadPage'
import { EditarActividadPage } from '@/pages/EditarActividadPage'
import { ActividadDetallePage } from '@/pages/ActividadDetallePage'
import { TransaccionesPage } from '@/pages/TransaccionesPage'
import { NuevaTransaccionPage } from '@/pages/NuevaTransaccionPage'
import { EditarTransaccionPage } from '@/pages/EditarTransaccionPage'
import { TransaccionDetallePage } from '@/pages/TransaccionDetallePage'
import { ReportesPage } from '@/pages/ReportesPage'
import { UsuariosPage } from '@/pages/UsuariosPage'

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

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

        {/* Protegidas - Categorías */}
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

        {/* Protegidas - Transacciones */}
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

        {/* Protegidas - Usuarios (Admin) */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}