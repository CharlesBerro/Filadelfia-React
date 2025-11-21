// src/pages/EditarCategoriaPage.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { CategoriaForm } from '@/components/categorias/CategoriaForm'
import { CategoriasService } from '@/services/categorias.services'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { Tag } from 'lucide-react'
import type { Categoria } from '@/types'

/**
 * Página para editar una categoría existente
 * 
 * 1. Obtiene el ID de la URL (ej: /categorias/123/editar)
 * 2. Carga la categoría desde Supabase
 * 3. Renderiza el CategoriaForm con los datos
 */

export const EditarCategoriaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('ID de categoría no proporcionado')
      setLoading(false)
      return
    }

    cargarCategoria()
  }, [id])

  const cargarCategoria = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Cargando categoría:', id)

      // Obtener todas las categorías y buscar la que necesitamos
      const categorias = await CategoriasService.obtenerTodas()
      const categoriaEncontrada = categorias.find((c) => c.id === id)

      if (!categoriaEncontrada) {
        throw new Error('Categoría no encontrada')
      }

      setCategoria(categoriaEncontrada)
      console.log('✅ Categoría cargada:', categoriaEncontrada)
    } catch (error: any) {
      console.error('❌ Error cargando categoría:', error)
      setError(error.message || 'Error al cargar la categoría')
    } finally {
      setLoading(false)
    }
  }

  // Estado de carga
  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen text="Cargando categoría..." />
      </Layout>
    )
  }

  // Estado de error
  if (error || !categoria) {
    return (
      <Layout>
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Tag className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Error al cargar
            </h2>
            <p className="text-red-600 mb-4">{error || 'Categoría no encontrada'}</p>
            <Button variant="secondary" onClick={() => navigate('/categorias')}>
              Volver a Categorías
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  // Estado exitoso
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
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Categoría
              </h1>
              <p className="text-sm text-gray-600">{categoria.nombre}</p>
            </div>
          </div>

          {/* Formulario */}
          <CategoriaForm categoria={categoria} />
        </div>
      </div>
    </Layout>
  )
}