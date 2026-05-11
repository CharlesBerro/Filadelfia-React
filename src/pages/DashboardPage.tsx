import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BarChart3, Calendar, Heart, MapPin, Plus, Receipt, Users } from 'lucide-react'
import { CumpleanosCard } from '@/components/common/CumpleanosCard'
import { CumpleanosHoyCard } from '@/components/common/CumpleanosHoyCard'

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleNewPersona = () => navigate('/personas/nueva')
  const handleNewTransaccion = () => navigate('/transacciones/nueva')
  const handleReportes = () => navigate('/reportes')

  const roleLabel =
    user?.role === 'admin'
      ? 'Administrador'
      : user?.role === 'lider'
        ? 'Lider'
        : user?.role === 'organizador'
          ? 'Organizador'
          : user?.role === 'formador'
            ? 'Formador'
            : 'Usuario'

  const summaryCards = [
    {
      label: 'Tu Sede',
      value: user?.sede_nombre || 'Sin sede',
      icon: MapPin,
      emphasis: false,
    },
    {
      label: 'Lider',
      value: user?.sede_lider || 'Sin asignar',
      icon: Heart,
      emphasis: false,
    },
    {
      label: 'Tu Rol',
      value: roleLabel,
      icon: Users,
      emphasis: true,
    },
    {
      label: 'Desde',
      value: new Date(user?.created_at || '').toLocaleDateString('es-CO'),
      icon: Calendar,
      emphasis: false,
    },
  ]

  return (
    <Layout>
      <div className="min-h-full bg-gradient-to-b from-green-50/60 via-white to-white px-3 py-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-5 sm:space-y-8">
          <section className="rounded-xl border border-green-100 bg-white px-4 py-4 shadow-sm sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
            <p className="text-xs font-semibold uppercase text-green-700 sm:hidden">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight text-gray-900 sm:mt-0 sm:text-4xl">
              Bienvenido,{' '}
              <span className="block break-words bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent sm:inline">
                {user?.full_name}
              </span>
            </h1>
            <p className="mt-2 text-sm capitalize text-gray-600 sm:text-base">
              {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {summaryCards.map((item) => {
              const Icon = item.icon

              return (
                <Card
                  key={item.label}
                  className="min-h-[112px] p-4 shadow-sm hover:shadow-lg sm:min-h-0 sm:p-6"
                >
                  <div className="flex h-full flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-600 sm:text-sm">
                        {item.label}
                      </p>
                      <p
                        className={`mt-1 line-clamp-2 text-base font-bold leading-snug sm:mt-2 sm:text-2xl ${item.emphasis ? 'text-green-600' : 'text-gray-900'
                          }`}
                      >
                        {item.value}
                      </p>
                    </div>
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 sm:h-12 sm:w-12 sm:rounded-full">
                      <Icon className="h-5 w-5 text-green-600 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </Card>
              )
            })}
          </section>

          <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <CumpleanosHoyCard />
            <CumpleanosCard />
          </section>

          <section className="rounded-xl border border-green-100 bg-white p-4 shadow-sm sm:p-8 sm:shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-gray-900 sm:mb-6 sm:text-2xl">
              Accesos Rapidos
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <Button
                onClick={handleNewPersona}
                variant="primary"
                fullWidth
                className="min-h-12 justify-start sm:justify-center"
              >
                <Plus className="h-4 w-4" />
                Nueva Persona
              </Button>
              <Button
                onClick={handleNewTransaccion}
                variant="primary"
                fullWidth
                className="min-h-12 justify-start sm:justify-center"
              >
                <Receipt className="h-4 w-4" />
                Nueva Transaccion
              </Button>
              <Button
                onClick={handleReportes}
                variant="primary"
                fullWidth
                className="min-h-12 justify-start sm:justify-center"
              >
                <BarChart3 className="h-4 w-4" />
                Ver Reportes
              </Button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
