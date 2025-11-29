// src/components/categorias/CategoriaForm.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategoriasStore } from '@/stores/categorias.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SavingOverlay } from '@/components/ui/SavingOverlay'
import { Save, TrendingUp, TrendingDown } from 'lucide-react'
import type { Categoria, CategoriaCreate } from '@/types'

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
  const [isSuccess, setIsSuccess] = useState(false)
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      if (categoria) {
        await updateCategoria(categoria.id, formData)
      } else {
        await addCategoria(formData)
      }

      // Mostrar éxito
      setIsSuccess(true)

      // Esperar un momento para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/categorias')
        }
      }, 1500)

    } catch (error: any) {
      alert(error.message || 'Error al guardar la categoría')
      setLoading(false)
    }
  }

  return (
    <>
      <SavingOverlay
        isLoading={loading}
        isSuccess={isSuccess}
        loadingText={categoria ? "Actualizando categoría..." : "Creando categoría..."}
        successText={categoria ? "Categoría actualizada correctamente" : "Categoría creada correctamente"}
      />

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-green-100">
        {/* Header del Formulario */}
        <div className="flex items-center gap-3 mb-6 border-b border-green-100 pb-4">
          <div className={`p-3 rounded-full ${categoria ? 'bg-blue-100' : 'bg-green-100'}`}>
            {categoria ? (
              <Save className="w-6 h-6 text-blue-600" />
            ) : (
              <div className="w-6 h-6 flex items-center justify-center font-bold text-green-600 text-xl">+</div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <p className="text-sm text-gray-500">
              {categoria ? 'Modifica los datos de la categoría' : 'Crea una nueva categoría para tus transacciones'}
            </p>
          </div>
        </div>

        {/* Tipo de Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Transacción
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => !categoria && setFormData({ ...formData, tipo: 'ingreso' })}
              disabled={!!categoria} // No permitir cambiar tipo al editar
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${formData.tipo === 'ingreso'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-200 text-gray-600'
                } ${categoria ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <TrendingUp className={`w-5 h-5 ${formData.tipo === 'ingreso' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-semibold">Ingreso</span>
            </button>

            <button
              type="button"
              onClick={() => !categoria && setFormData({ ...formData, tipo: 'egreso' })}
              disabled={!!categoria}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${formData.tipo === 'egreso'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-200 text-gray-600'
                } ${categoria ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <TrendingDown className={`w-5 h-5 ${formData.tipo === 'egreso' ? 'text-red-600' : 'text-gray-400'}`} />
              <span className="font-semibold">Egreso</span>
            </button>
          </div>
          {categoria && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              El tipo de categoría no se puede cambiar una vez creada
            </p>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Categoría <span className="text-red-500">*</span>
          </label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Diezmos, Ofrendas, Servicios Públicos..."
            error={errors.nombre}
            disabled={loading}
            className="text-lg"
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (Opcional)
          </label>
          <textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            rows={3}
            placeholder="Breve descripción para identificar mejor esta categoría..."
            disabled={loading}
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/categorias')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="min-w-[140px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" color="white" />
                <span>Guardando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>{categoria ? 'Guardar Cambios' : 'Crear Categoría'}</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </>
  )
}