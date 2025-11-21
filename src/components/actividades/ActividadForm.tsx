// src/components/actividades/ActividadForm.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import type { ActividadCreate, ActividadUpdate } from '@/types'
import { Button } from '@/components/ui/Button'

interface ActividadFormProps {
    initialData?: ActividadUpdate & { id?: string }
    onSubmit: (data: ActividadCreate | ActividadUpdate) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

/**
 * Formulario reutilizable para crear/editar actividades
 * 
 * Campos:
 * - nombre (requerido)
 * - descripcion (opcional)
 * - meta (número, requerido)
 * - fecha_inicio (date, requerido)
 * - fecha_fin (date, opcional)
 * - estado (select, requerido)
 */
export const ActividadForm: React.FC<ActividadFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ActividadCreate>({
        defaultValues: initialData || {
            nombre: '',
            descripcion: '',
            meta: 0,
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin: '',
            estado: 'planeada',
        },
    })

    const handleFormSubmit = async (data: ActividadCreate) => {
        try {
            await onSubmit(data)
        } catch (error) {
            console.error('Error en formulario:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Nombre */}
            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Actividad <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('nombre', {
                        required: 'El nombre es requerido',
                        minLength: {
                            value: 3,
                            message: 'El nombre debe tener al menos 3 caracteres',
                        },
                    })}
                    type="text"
                    id="nombre"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Compra de Piano"
                    disabled={isLoading}
                />
                {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                )}
            </div>

            {/* Descripción */}
            <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                </label>
                <textarea
                    {...register('descripcion')}
                    id="descripcion"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe la actividad..."
                    disabled={isLoading}
                />
            </div>

            {/* Meta */}
            <div>
                <label htmlFor="meta" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta (en pesos) <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('meta', {
                        required: 'La meta es requerida',
                        min: {
                            value: 1,
                            message: 'La meta debe ser mayor a 0',
                        },
                        valueAsNumber: true,
                    })}
                    type="number"
                    id="meta"
                    step="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="700000"
                    disabled={isLoading}
                />
                {errors.meta && (
                    <p className="mt-1 text-sm text-red-600">{errors.meta.message}</p>
                )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha Inicio */}
                <div>
                    <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('fecha_inicio', {
                            required: 'La fecha de inicio es requerida',
                        })}
                        type="date"
                        id="fecha_inicio"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    {errors.fecha_inicio && (
                        <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio.message}</p>
                    )}
                </div>

                {/* Fecha Fin */}
                <div>
                    <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Fin (opcional)
                    </label>
                    <input
                        {...register('fecha_fin')}
                        type="date"
                        id="fecha_fin"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Estado */}
            <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado <span className="text-red-500">*</span>
                </label>
                <select
                    {...register('estado', {
                        required: 'El estado es requerido',
                    })}
                    id="estado"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                >
                    <option value="planeada">Planeada</option>
                    <option value="en_curso">En Curso</option>
                    <option value="completada">Completada</option>
                </select>
                {errors.estado && (
                    <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
                )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                >
                    {isLoading ? 'Guardando...' : initialData?.id ? 'Actualizar' : 'Crear Actividad'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    )
}
