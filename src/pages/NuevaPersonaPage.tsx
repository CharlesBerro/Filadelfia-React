import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { PersonaForm } from '@/components/personas/PersonaForm'
import { UserPlus } from 'lucide-react'

export const NuevaPersonaPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nueva Persona
              </h1>
              <p className="text-gray-600 text-sm">
                Registra una nueva persona en el sistema
              </p>
            </div>
          </div>

          {/* Formulario */}
          <PersonaForm />
        </div>
      </div>
    </Layout>
  )
}