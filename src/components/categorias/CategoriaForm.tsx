// src/components/categorias/CategoriaForm.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CategoriasService } from '@/services/categorias.services'
import { useCategoriasStore } from '@/stores/categorias.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ArrowLeft, Save, TrendingUp, TrendingDown } from 'lucide-react'
import type { Categoria, CategoriaCreate } from '@/types'

/**
 * Formulario de Categoría
 * 
 * Puede usarse para:
 * - Crear nueva categoría (modo: 'create')
 * - Editar categoría existente (modo: 'edit')
 * 
 * Props:
 * - categoria?: Categoria → Si existe, es modo editar
 * - onSuccess?: () => void → Callback al guardar exitosamente
 */

interface CategoriaFormProps {
  categoria?: Categoria
  onSuccess?: () => void
}

export const CategoriaForm: React.FC<CategoriaFormProps> = ({
  categoria,
  onSuccess,
}) => {
  const navigate = useNavigate()
  const { addCategoria, updateCategoria } = useCategoriasStore()

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Estado del formulario
  const [formData, setFormData] = useState<CategoriaCreate>({
    nombre: categoria?.nombre || '',
    tipo: categoria?.tipo || 'ingreso',
    descripcion: categoria?.descripcion || '',
  })

  // Si cambia la categoría (modo editar), actualizar formulario
  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        descripcion: categoria.descripcion || '',
      })
    }
  }, [categoria])

  // Manejar cambios en los inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Validar formulario
  const validar = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Selecciona un tipo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validar()) return

    setLoading(true)

    try {
      if (categoria) {
        // Modo EDITAR
        const actualizada = await CategoriasService.actualizar(
          categoria.id,
          formData
        )
        updateCategoria(categoria.id, actualizada)
        console.log('✅ Categoría actualizada')
      } else {
        // Modo CREAR
        const nueva = await CategoriasService.crear(formData)
        addCategoria(nueva)
        console.log('✅ Categoría creada')
      }

      // Callback de éxito
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/categorias')
      }
    } catch (error: any) {
      console.error('❌ Error:', error)
      setErrors({
        general: error.message || 'Error al guardar la categoría',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {loading && (
        <LoadingSpinner
          fullScreen
          text={categoria ? 'Actualizando categoría...' : 'Creando categoría...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/categorias')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Volver</span>
        </button>

        <Button type="submit" variant="primary" disabled={loading}>
          <Save className="w-5 h-5" />
          {categoria ? 'Actualizar' : 'Crear'} Categoría
        </Button>
      </div>

      {/* Error general */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100 space-y-4">
        {/* Nombre */}
        <Input
          label="Nombre de la Categoría *"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Diezmos, Ofrendas, Servicios públicos..."
          error={errors.nombre}
          disabled={loading}
        />

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, tipo: 'ingreso' }))
              }
              className={`p-4 rounded-lg border-2 transition ${
                formData.tipo === 'ingreso'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={loading || !!categoria} // No cambiar tipo al editar
            >
              <TrendingUp
                className={`w-6 h-6 mx-auto mb-2 ${
                  formData.tipo === 'ingreso' ? 'text-green-600' : 'text-gray-400'
                }`}
              />
              <span
                className={`block text-sm font-medium ${
                  formData.tipo === 'ingreso' ? 'text-green-700' : 'text-gray-600'
                }`}
              >
                Ingreso
              </span>
              <span className="block text-xs text-gray-500 mt-1">
                Dinero que entra
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, tipo: 'egreso' }))}
              className={`p-4 rounded-lg border-2 transition ${
                formData.tipo === 'egreso'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={loading || !!categoria} // No cambiar tipo al editar
            >
              <TrendingDown
                className={`w-6 h-6 mx-auto mb-2 ${
                  formData.tipo === 'egreso' ? 'text-red-600' : 'text-gray-400'
                }`}
              />
              <span
                className={`block text-sm font-medium ${
                  formData.tipo === 'egreso' ? 'text-red-700' : 'text-gray-600'
                }`}
              >
                Egreso
              </span>
              <span className="block text-xs text-gray-500 mt-1">
                Dinero que sale
              </span>
            </button>
          </div>
          {errors.tipo && <p className="text-red-500 text-sm mt-2">{errors.tipo}</p>}
          {categoria && (
            <p className="text-sm text-gray-500 mt-2">
              ℹ️ No se puede cambiar el tipo de una categoría existente
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label
            htmlFor="descripcion"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Descripción (opcional)
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Describe para qué se usa esta categoría..."
            disabled={loading}
          />
        </div>
      </div>

      {/* Botones finales */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/categorias')}
          fullWidth
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {categoria ? 'Actualizar' : 'Crear'} Categoría
        </Button>
      </div>
    </form>
  )
}