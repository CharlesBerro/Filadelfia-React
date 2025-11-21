// src/pages/ActividadDetallePage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProgresoCard } from '@/components/actividades/ProgresoCard'
import { ActividadesService } from '@/services/actividades.service'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Edit2, Calendar, FileText, Target } from 'lucide-react'
import type { Actividad } from '@/types'

/**
 * Página de detalle de actividad
 * 
 * Muestra:
 * - Información completa de la actividad
 * - Card de progreso grande
 * - Botón para editar (si tiene permisos)
 */
export const ActividadDetallePage: React.FC = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const [actividad, setActividad] = useState<Actividad | null>(null)
    const [progreso, setProgreso] = useState({ recaudado: 0, meta: 0, porcentaje: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (id) {
            cargarDatos()
        }
    }, [id])

    const cargarDatos = async () => {
        try {
            const [actividadData, progresoData] = await Promise.all([
                ActividadesService.obtenerPorId(id!),
                ActividadesService.calcularProgreso(id!),
            ])

            setActividad(actividadData)
            setProgreso(progresoData)
        } catch (error: any) {
            setError(error.message || 'Error al cargar actividad')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const getEstadoBadge = (estado: Actividad['estado']) => {
        const badges = {
            planeada: 'bg-yellow-100 text-yellow-800',
            en_curso: 'bg-blue-100 text-blue-800',
            completada: 'bg-green-100 text-green-800',
        }

        const labels = {
            planeada: 'Planeada',
            en_curso: 'En Curso',
            completada: 'Completada',
        }

        return (
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badges[estado]}`}>
                {labels[estado]}
            </span>
        )
    }

    if (isLoading) {
        return (
            <Layout>
                <LoadingSpinner fullScreen text="Cargando actividad..." />
            </Layout>
        )
    }

    if (error || !actividad) {
        return (
            <Layout>
                <div className="min-h-full p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error || 'Actividad no encontrada'}</p>
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
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/actividades')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver a Actividades
                        </button>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{actividad.nombre}</h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        {getEstadoBadge(actividad.estado)}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => navigate(`/actividades/${id}/editar`)}
                                variant="secondary"
                            >
                                <Edit2 className="w-5 h-5" />
                                Editar
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Información */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Descripción */}
                            {actividad.descripcion && (
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-gray-600" />
                                        <h2 className="text-lg font-semibold text-gray-900">Descripción</h2>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{actividad.descripcion}</p>
                                </div>
                            )}

                            {/* Fechas */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5 text-gray-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Fechas</h2>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Fecha de Inicio</p>
                                        <p className="text-gray-900 font-medium">
                                            {formatDate(actividad.fecha_inicio)}
                                        </p>
                                    </div>
                                    {actividad.fecha_fin && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Fecha de Fin</p>
                                            <p className="text-gray-900 font-medium">
                                                {formatDate(actividad.fecha_fin)}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Creada el</p>
                                        <p className="text-gray-900 font-medium">
                                            {formatDate(actividad.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Transacciones - Próxima fase */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Transacciones Relacionadas
                                </h2>
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        Las transacciones se mostrarán en la siguiente fase
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progreso */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6">
                                <ProgresoCard
                                    recaudado={progreso.recaudado}
                                    meta={progreso.meta}
                                    porcentaje={progreso.porcentaje}
                                    size="large"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
