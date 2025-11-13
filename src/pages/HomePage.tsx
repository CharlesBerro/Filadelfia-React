import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/auth.store'


export const HomePage: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogin = () => {
    navigate('/login')
  }

  const handleDashboard = () => {
    navigate('/dashboard')
  }
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Bienvenido a FiladelFia
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Plataforma de Gestión de Personas y Contabilidad para Congregaciones
        </p>

        <div className="flex gap-4 justify-center">
          {!user ? (
            <Button
              onClick={handleLogin}
              variant="primary"
            >
              Iniciar Sesión
            </Button>
          ) : (
            <>
              <Button
                onClick={handleDashboard}
                variant="primary"
              >
                🗓️ Ir al Dashboard
              </Button >
              <Button
                onClick={handleLogout}
                variant="secondary"
              >
                Cerrar Sesión
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}