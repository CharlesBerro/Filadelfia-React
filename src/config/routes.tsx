import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { NuevaPersonaPage } from '@/pages/NuevaPersonaPage'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PersonasPage } from '@/pages/PersonasPage'
export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<HomePage />} />



        {/* Protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Personas */}
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
             <NuevaPersonaPage/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/personas/:id"
          element={
            <ProtectedRoute>
              <div>Detalle Persona (próximamente)</div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/personas/:id/editar"
          element={
            <ProtectedRoute>
              <div>Editar Persona (próximamente)</div>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}