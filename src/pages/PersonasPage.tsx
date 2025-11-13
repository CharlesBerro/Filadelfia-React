// src/pages/PersonasPage.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PersonasTable } from '@/components/personas/PersonasTable'
import { PersonasStats } from '@/components/personas/PersonasStats'
import { usePersonasStore } from '@/stores/personas.store'
import { Button } from '@/components/ui/Button'
import { Users, UserPlus } from 'lucide-react'

export const PersonasPage: React.FC = () => {
  const navigate = useNavigate()
  const { personas } = usePersonasStore()

  return (
    <Layout>
      <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Personas</h1>
                <p className="text-sm text-gray-600">
                  Gestiona las personas de tu congregación
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/personas/nueva')}
              variant="primary"
            >
              <UserPlus className="w-5 h-5" />
              ➕ Nueva Persona
            </Button>
          </div>

          {/* Estadísticas */}
          <PersonasStats personas={personas} />

          {/* Tabla */}
          <PersonasTable />
        </div>
      </div>
    </Layout>
  )
}