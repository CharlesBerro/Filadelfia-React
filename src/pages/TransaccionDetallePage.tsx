// pages/TransaccionDetallePage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { TransaccionesService } from '@/services/transacciones.service'
import { useTransaccionesStore } from '@/stores/transacciones.store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Edit2, XCircle, Receipt, Calendar, User, FileText, Link as LinkIcon } from 'lucide-react'
import type { TransaccionCompleta } from '@/types/transacciones'

/**
 * Página de detalle de transacción
 * 
 * Muestra:
 * - Información completa de la transacción
 * - Botones para editar/anular
 * - Información de auditoría
 */
export const TransaccionDetallePage: React.FC = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { updateTransaccion } = useTransaccionesStore()
    const [transaccion, setTransaccion] = useState<TransaccionCompleta | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [anulando, setAnulando] = useState(false)

    useEffect(() => {
        if (id) {
            cargarTransaccion()
        }
    }, [id])

    const cargarTransaccion = async () => {
        try {
            const data = await TransaccionesService.obtenerPorId(id!)
            setTransaccion(data)
        } catch (error: any) {
            setError(error.message || 'Error al cargar transacción')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAnular = async () => {
        if (!transaccion) return

        const notas = prompt('Ingrese la razón de anulación (mínimo 10 caracteres):')

        if (!notas || notas.trim().length < 10) {
            alert('Debe proporcionar una razón detallada para la anulación')
            return
        }

        setAnulando(true)
        try {
            const transaccionAnulada = await TransaccionesService.anular(transaccion.id, notas)
            setTransaccion(transaccionAnulada)
            updateTransaccion(transaccion.id, transaccionAnulada)
            alert('Transacción anulada exitosamente')
        } catch (error: any) {
            alert(error.message || 'Error al anular transacción')
        } finally {
            setAnulando(false)
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
            month: 'long',
            day: 'numeric',
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (isLoading) {
        return (
            <Layout>
                <LoadingSpinner fullScreen text="Cargando transacción..." />
            </Layout>
        )
    }

    if (error || !transaccion) {
        return (
            <Layout>
                <div className="min-h-full p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error || 'Transacción no encontrada'}</p>
                        <button
                            onClick={() => navigate('/transacciones')}
                            className="text-blue-600 hover:underline"
                        >
                            Volver al listado
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    const puedeEditar = transaccion.estado === 'activa'

    return (
        <Layout>
            <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/transacciones')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver al listado
                        </button>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
                                    <Receipt className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {transaccion.numero_transaccion}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${transaccion.tipo === 'ingreso'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {transaccion.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${transaccion.estado === 'activa'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {transaccion.estado === 'activa' ? 'Activa' : 'Anulada'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {puedeEditar && (
                                    <>
                                        <Button
                                            onClick={() => navigate(`/transacciones/${id}/editar`)}
                                            variant="secondary"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                            Editar
                                        </Button>
                                        <Button
                                            onClick={handleAnular}
                                            variant="secondary"
                                            disabled={anulando}
                                        >
                                            <XCircle className="w-5 h-5" />
                                            {anulando ? 'Anulando...' : 'Anular'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Información Principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Monto y Fecha */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Monto</p>
                                        <p className={`text-3xl font-bold ${transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {formatCurrency(transaccion.monto)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Fecha</p>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {formatDate(transaccion.fecha)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Categoría</p>
                                        <p className="text-gray-900 font-medium">
                                            {transaccion.categoria?.nombre || '-'}
                                        </p>
                                    </div>

                                    {transaccion.actividad && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Actividad</p>
                                            <p className="text-gray-900 font-medium">
                                                {transaccion.actividad.nombre}
                                            </p>
                                        </div>
                                    )}

                                    {transaccion.persona && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Persona</p>
                                            <p className="text-gray-900 font-medium">
                                                {transaccion.persona.nombres} {transaccion.persona.primer_apellido} {transaccion.persona.segundo_apellido}
                                            </p>
                                        </div>
                                    )}

                                    {transaccion.descripcion && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Descripción</p>
                                            <p className="text-gray-700">{transaccion.descripcion}</p>
                                        </div>
                                    )}

                                    {transaccion.evidencia && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Evidencia</p>
                                            <a
                                                href={transaccion.evidencia}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center gap-2"
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                                Ver evidencia
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Anulación */}
                            {transaccion.estado === 'anulada' && transaccion.notas_anulacion && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                    <h2 className="text-lg font-semibold text-red-900 mb-2">Transacción Anulada</h2>
                                    <p className="text-red-700">{transaccion.notas_anulacion}</p>
                                </div>
                            )}
                        </div>

                        {/* Auditoría */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Auditoría</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Creada el</p>
                                        <p className="text-gray-900 text-sm">
                                            {formatDateTime(transaccion.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Última actualización</p>
                                        <p className="text-gray-900 text-sm">
                                            {formatDateTime(transaccion.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
