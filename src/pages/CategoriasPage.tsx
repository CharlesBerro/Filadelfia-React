// src/pages/CategoriasPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { CategoriasTable } from '@/components/categorias/CategoriasTable'
import { CategoriasStats } from '@/components/categorias/CategoriasStats'
import { CategoriasService } from '@/services/categorias.services'
import { useCategoriasStore } from '@/stores/categorias.store'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Tag, Plus } from 'lucide-react'

/**
 * Página principal de Categorías
 * 
 * Muestra:
 * - Estadísticas (cards con totales)
 * - Tabla de categorías
 * - Botón para crear nueva categoría
 */

export const CategoriasPage: React.FC = () => {
  const navigate = useNavigate()
  const { setCategorias, setLoading, setError } = useCategoriasStore()
  const [loadingData, setLoadingData] = useState(true)

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    setLoadingData(true)
    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Cargando categorías...')
      const data = await CategoriasService.obtenerTodas()
      setCategorias(data)
      console.log('✅ Categorías cargadas:', data.length)
    } catch (error: any) {
      console.error('❌ Error cargando categorías:', error)
      setError(error.message || 'Error al cargar categorías')
    } finally {
      setLoadingData(false)
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <Layout>
        <LoadingSpinner fullScreen text="Cargando categorías..." />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
                <p className="text-sm text-gray-600">
                  Gestiona las categorías de ingresos y egresos
                </p>
              </div>
            </div>

            <Button onClick={() => navigate('/categorias/nueva')} variant="primary">
              <Plus className="w-5 h-5" />
              Nueva Categoría
            </Button>
          </div>

          {/* Estadísticas */}
          <CategoriasStats />

          {/* Tabla */}
          <CategoriasTable />
        </div>
      </div>
    </Layout>
  )
}