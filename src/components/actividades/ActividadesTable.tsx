// src/components/actividades/ActividadesTable.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, Eye, Calendar } from 'lucide-react'
import { useActividadesStore } from '@/stores/actividades.store'
import { ActividadesService } from '@/services/actividades.service'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SavingOverlay } from '@/components/ui/SavingOverlay'
import type { Actividad } from '@/types'

/**
 * Tabla de actividades
 * 
 * Muestra:
 * - Lista de actividades
 * - Progreso visual
 * - Badges de estado
 * - Acciones (ver, editar, eliminar)
 */
export const ActividadesTable: React.FC = () => {
    const navigate = useNavigate()
    const { actividades, removeActividad } = useActividadesStore()

    // Estados para eliminación
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [modalEliminarOpen, setModalEliminarOpen] = useState(false)
    const [actividadAEliminar, setActividadAEliminar] = useState<Actividad | null>(null)
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)

    const [progresosMap, setProgresosMap] = useState<Record<string, number>>({})

    // Cargar progresos al montar
    React.useEffect(() => {
        cargarProgresos()
    }, [actividades])

    const cargarProgresos = async () => {
        const map: Record<string, number> = {}
        for (const actividad of actividades) {
            try {
                const { porcentaje } = await ActividadesService.calcularProgreso(actividad.id)
                map[actividad.id] = porcentaje
            } catch (error) {
                map[actividad.id] = 0
            }
        }
        setProgresosMap(map)
    }

    const abrirModalEliminar = (actividad: Actividad) => {
        setActividadAEliminar(actividad)
        setModalEliminarOpen(true)
    }

    const cerrarModalEliminar = () => {
        setModalEliminarOpen(false)
        setActividadAEliminar(null)
    }

    const confirmarEliminacion = async () => {
        if (!actividadAEliminar) return

        setDeletingId(actividadAEliminar.id)
        try {
            await ActividadesService.eliminar(actividadAEliminar.id)
            removeActividad(actividadAEliminar.id)
            cerrarModalEliminar()
            setShowSuccessOverlay(true)
            setTimeout(() => setShowSuccessOverlay(false), 2000)
        } catch (error: any) {
            alert(error.message || 'Error al eliminar actividad')
        } finally {
            setDeletingId(null)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[estado]}`}>
                {labels[estado]}
            </span>
        )
    }

    const getProgressColor = (porcentaje: number) => {
        if (porcentaje >= 100) return 'bg-green-500'
        if (porcentaje >= 75) return 'bg-blue-500'
        if (porcentaje >= 50) return 'bg-yellow-500'
        if (porcentaje >= 25) return 'bg-orange-500'
        return 'bg-red-500'
    }

    if (actividades.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay actividades registradas
                </h3>
                <p className="text-gray-600 mb-6">
                    Comienza creando tu primera actividad con meta financiera
                </p>
                <Button onClick={() => navigate('/actividades/nueva')} variant="primary">
                    Crear Primera Actividad
                </Button>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actividad
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Meta
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Progreso
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Fechas
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {actividades.map((actividad) => {
                                const progreso = progresosMap[actividad.id] || 0

                                return (
                                    <tr
                                        key={actividad.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/actividades/${actividad.id}`)}
                                    >
                                        {/* Nombre */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{actividad.nombre}</p>
                                                {actividad.descripcion && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                        {actividad.descripcion}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Meta */}
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(actividad.meta)}
                                            </p>
                                        </td>

                                        {/* Progreso */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${getProgressColor(progreso)} transition-all duration-500`}
                                                            style={{ width: `${Math.min(progreso, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 min-w-[50px] text-right">
                                                    {progreso.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* Estado */}
                                        <td className="px-6 py-4">{getEstadoBadge(actividad.estado)}</td>

                                        {/* Fechas */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="text-gray-900">
                                                    Inicio: {formatDate(actividad.fecha_inicio)}
                                                </p>
                                                {actividad.fecha_fin && (
                                                    <p className="text-gray-500 mt-1">
                                                        Fin: {formatDate(actividad.fecha_fin)}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(`/actividades/${actividad.id}`)
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(`/actividades/${actividad.id}/editar`)
                                                    }}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        abrirModalEliminar(actividad)
                                                    }}
                                                    disabled={deletingId === actividad.id}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Eliminación */}
            <Modal
                isOpen={modalEliminarOpen}
                onClose={cerrarModalEliminar}
                title="Eliminar Actividad"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={cerrarModalEliminar}
                            disabled={!!deletingId}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmarEliminacion}
                            disabled={!!deletingId}
                            loading={!!deletingId}
                        >
                            Confirmar Eliminación
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <Trash2 className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-red-900">¿Estás seguro?</h4>
                            <p className="text-sm text-red-700 mt-1">
                                Esta acción eliminará la actividad <strong>{actividadAEliminar?.nombre}</strong>.
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>

            <SavingOverlay
                isLoading={false}
                isSuccess={showSuccessOverlay}
                loadingText="Eliminando actividad..."
                successText="¡Actividad eliminada exitosamente!"
            />
        </>
    )
}
