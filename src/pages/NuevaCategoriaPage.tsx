// src/pages/NuevaCategoriaPage.tsx
import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { CategoriaForm } from '@/components/categorias/CategoriaForm'
import { Tag } from 'lucide-react'

/**
 * Página para crear una nueva categoría
 * 
 * Simplemente renderiza el CategoriaForm sin pasar categoría
 * El form detecta que está en modo "crear"
 */

export const NuevaCategoriaPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Categoría</h1>
              <p className="text-sm text-gray-600">
                Crea una nueva categoría para clasificar tus transacciones
              </p>
            </div>
          </div>

          {/* Formulario */}
          <CategoriaForm />
        </div>
      </div>
    </Layout>
  )
}