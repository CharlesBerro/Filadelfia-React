// src/pages/NuevaActividadPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ActividadForm } from '@/components/actividades/ActividadForm'
import { ActividadesService } from '@/services/actividades.service'
import { useActividadesStore } from '@/stores/actividades.store'
import { ArrowLeft, Target } from 'lucide-react'
import type { ActividadCreate } from '@/types'

/**
 * Página para crear nueva actividad
 */
export const NuevaActividadPage: React.FC = () => {
    const navigate = useNavigate()
    const { addActividad } = useActividadesStore()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (data: ActividadCreate) => {
        setIsLoading(true)
        setError(null)

        try {
            console.log('📤 Creando actividad:', data)
            const nuevaActividad = await ActividadesService.crear(data)
            addActividad(nuevaActividad)
            console.log('✅ Actividad creada exitosamente')
            navigate('/actividades')
        } catch (error: any) {
            console.error('❌ Error creando actividad:', error)
            setError(error.message || 'Error al crear actividad')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        navigate('/actividades')
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
                                <h1 className="text-3xl font-bold text-gray-900">Nueva Actividad</h1>
                                <p className="text-sm text-gray-600">
                                    Crea una actividad con meta financiera
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
