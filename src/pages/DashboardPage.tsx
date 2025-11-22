import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Heart, MapPin, Users, Calendar } from 'lucide-react'
import { CumpleanosCard } from '@/components/common/CumpleanosCard'
import { CumpleanosHoyCard } from '@/components/common/CumpleanosHoyCard'

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleNewPersona = () => navigate('/personas/nueva')
  const handleNewTransaccion = () => navigate('/transacciones/nueva')
  const handleReportes = () => navigate('/reportes')

  return (
    <Layout>
      <div className="min-h-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Bienvenida */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Bienvenido, <span className="bg-gradient-to-r from-green-600 to-green-500 text-transparent bg-clip-text">{user?.full_name}</span>
            </h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Tarjetas de Información */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Sede */}
            <Card className="bg-white hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Tu Sede
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-2">
                    {user?.sede_nombre}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </Card>

            {/* Líder */}
            <Card className="bg-white hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Líder
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-2">
                    {user?.sede_lider}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </Card>

            {/* Rol */}
            <Card className="bg-white hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Tu Rol
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 mt-2 capitalize">
                    {user?.rol === 'admin'
                      ? 'Administrador'
                      : user?.rol === 'contador'
                        ? 'Contador'
                        : 'Usuario'}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </Card>

            {/* Desde */}
            <Card className="bg-white hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Desde
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-2">
                    {new Date(user?.created_at || '').toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </Card>

          </div>
          {/* Sección de Cumpleaños */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/*  Cumpleaños de Hoy */}
            <CumpleanosHoyCard />

            {/* Próximos Cumpleaños */}
            <CumpleanosCard />
          </div>

          {/* Accesos Rápidos */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Accesos Rápidos
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Button
                onClick={handleNewPersona}
                variant="primary"
                fullWidth
              >
                ➕ Nueva Persona
              </Button>
              <Button
                onClick={handleNewTransaccion}
                variant="primary"
                fullWidth
              >
                ➕ Nueva Transacción
              </Button>
              <Button
                onClick={handleReportes}
                variant="primary"
                fullWidth
              >
                📊 Ver Reportes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}