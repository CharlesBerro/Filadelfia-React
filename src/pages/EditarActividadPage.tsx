// src/pages/EditarActividadPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ActividadForm } from '@/components/actividades/ActividadForm'
import { ActividadesService } from '@/services/actividades.service'
import { useActividadesStore } from '@/stores/actividades.store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ArrowLeft, Target } from 'lucide-react'
import type { ActividadUpdate } from '@/types'

/**
 * Página para editar actividad existente
 */
export const EditarActividadPage: React.FC = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { updateActividad } = useActividadesStore()
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actividad, setActividad] = useState<any>(null)

    useEffect(() => {
        if (id) {
            cargarActividad()
        }
    }, [id])

    const cargarActividad = async () => {
        try {
            const data = await ActividadesService.obtenerPorId(id!)
            setActividad(data)
        } catch (error: any) {
            setError(error.message || 'Error al cargar actividad')
        } finally {
            setIsLoadingData(false)
        }
    }

    const handleSubmit = async (data: ActividadUpdate) => {
        if (!id) return

        setIsLoading(true)
        setError(null)

        try {
            console.log('📤 Actualizando actividad:', data)
            const actividadActualizada = await ActividadesService.actualizar(id, data)
            updateActividad(id, actividadActualizada)
            console.log('✅ Actividad actualizada exitosamente')
            navigate('/actividades')
        } catch (error: any) {
            console.error('❌ Error actualizando actividad:', error)
            setError(error.message || 'Error al actualizar actividad')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        navigate('/actividades')
    }

    if (isLoadingData) {
        return (
            <Layout>
                <LoadingSpinner fullScreen text="Cargando actividad..." />
            </Layout>
        )
    }

    if (error && !actividad) {
        return (
            <Layout>
                <div className="min-h-full p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/actividades')}
                            className="text-blue-600 hover:underline"
                        >
                            Volver a Actividades
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 via-white to-purple-50">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/actividades')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver a Actividades
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Editar Actividad</h1>
                                <p className="text-sm text-gray-600">
                                    Modifica los datos de la actividad
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Formulario */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <ActividadForm
                            initialData={actividad}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    )
}
