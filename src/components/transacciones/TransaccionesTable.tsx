// components/transacciones/TransaccionesTable.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Edit2, XCircle, Receipt } from 'lucide-react'
import { useTransaccionesStore } from '@/stores/transacciones.store'
import { TransaccionesService } from '@/services/transacciones.service'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SavingOverlay } from '@/components/ui/SavingOverlay'
import type { TransaccionCompleta } from '@/types/transacciones'

/**
 * Tabla de transacciones
 * 
 * Muestra:
 * - Todas las columnas de la transacción
 * - Badges de tipo y estado
 * - Acciones: Ver, Editar, Anular
 * - Paginación
 */
interface TransaccionesTableProps {
    onViewReceipt?: (transaccion: TransaccionCompleta) => void
}

export const TransaccionesTable: React.FC<TransaccionesTableProps> = ({ onViewReceipt }) => {
    const navigate = useNavigate()
    const { transacciones, updateTransaccion } = useTransaccionesStore()
    const { user } = useAuthStore()

    // Estados para paginación
    const [paginaActual, setPaginaActual] = useState(1)
    const transaccionesPorPagina = 20

    // Estados para anulación
    const [anulandoId, setAnulandoId] = useState<string | null>(null)
    const [modalAnularOpen, setModalAnularOpen] = useState(false)
    const [transaccionAAnular, setTransaccionAAnular] = useState<TransaccionCompleta | null>(null)
    const [motivoAnulacion, setMotivoAnulacion] = useState('')
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)

    // Paginación
    const indiceInicio = (paginaActual - 1) * transaccionesPorPagina
    const indiceFin = indiceInicio + transaccionesPorPagina
    const transaccionesPaginadas = transacciones.slice(indiceInicio, indiceFin)
    const totalPaginas = Math.ceil(transacciones.length / transaccionesPorPagina)

    // Manejadores del Modal
    const abrirModalAnular = (transaccion: TransaccionCompleta) => {
        setTransaccionAAnular(transaccion)
        setMotivoAnulacion('')
        setModalAnularOpen(true)
    }

    const cerrarModalAnular = () => {
        setModalAnularOpen(false)
        setTransaccionAAnular(null)
        setMotivoAnulacion('')
    }

    const confirmarAnulacion = async () => {
        if (!transaccionAAnular || !motivoAnulacion || motivoAnulacion.trim().length < 10) {
            return
        }

        setAnulandoId(transaccionAAnular.id)
        try {
            const transaccionAnulada = await TransaccionesService.anular(transaccionAAnular.id, motivoAnulacion)
            updateTransaccion(transaccionAAnular.id, transaccionAnulada)
            cerrarModalAnular()
            setShowSuccessOverlay(true)
            setTimeout(() => setShowSuccessOverlay(false), 2000)
        } catch (error: any) {
            alert(error.message || 'Error al anular transacción')
        } finally {
            setAnulandoId(null)
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

    const getTipoBadge = (tipo: 'ingreso' | 'egreso') => {
        return tipo === 'ingreso' ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Ingreso
            </span>
        ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                Egreso
            </span>
        )
    }

    const getEstadoBadge = (estado: 'activa' | 'anulada') => {
        return estado === 'activa' ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                Activa
            </span>
        ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                Anulada
            </span>
        )
    }

    if (transacciones.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay transacciones registradas
                </h3>
                <p className="text-gray-600 mb-6">
                    Comienza registrando tu primera transacción
                </p>
                <Button onClick={() => navigate('/transacciones/nueva')} variant="primary">
                    Registrar Primera Transacción
                </Button>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Vista Desktop - Tabla */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-max text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                    N° Trans.
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                    Fecha
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                    Monto
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                    Tipo
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                    Categoría
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                    Actividad
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                    Persona
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider max-w-xs">
                                    Descripción
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                    Estado
                                </th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transaccionesPaginadas.map((transaccion) => {
                                const puedeEditar = user?.role === 'admin' || transaccion.user_id === user?.id
                                const puedeAnular = puedeEditar && transaccion.estado === 'activa'

                                return (
                                    <tr
                                        key={transaccion.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/transacciones/${transaccion.id}`)}
                                    >
                                        <td className="px-3 py-2">
                                            <p className="font-mono font-semibold text-gray-900">
                                                {transaccion.numero_transaccion}
                                            </p>
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className="text-gray-900">{formatDate(transaccion.fecha)}</p>
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className={`font-semibold ${transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(transaccion.monto)}
                                            </p>
                                        </td>
                                        <td className="px-3 py-2">{getTipoBadge(transaccion.tipo)}</td>
                                        <td className="px-3 py-2">
                                            <p className="text-gray-900">{transaccion.categoria?.nombre || '-'}</p>
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className="text-gray-900">{transaccion.actividad?.nombre || '-'}</p>
                                        </td>
                                        <td className="px-3 py-2">
                                            {transaccion.persona ? (
                                                <p className="text-gray-900">
                                                    {transaccion.persona.nombres} {transaccion.persona.primer_apellido}
                                                </p>
                                            ) : (
                                                <p className="text-gray-500">-</p>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className="text-gray-600 truncate max-w-xs">
                                                {transaccion.descripcion || '-'}
                                            </p>
                                        </td>
                                        <td className="px-3 py-2">{getEstadoBadge(transaccion.estado)}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(`/transacciones/${transaccion.id}`)
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {onViewReceipt && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onViewReceipt(transaccion)
                                                        }}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Ver Comprobante"
                                                    >
                                                        <Receipt className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {puedeEditar && transaccion.estado === 'activa' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            navigate(`/transacciones/${transaccion.id}/editar`)
                                                        }}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {puedeAnular && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            abrirModalAnular(transaccion)
                                                        }}
                                                        disabled={anulandoId === transaccion.id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Anular"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Vista Mobile - Cards Compactas en Grid 2 Columnas */}
                <div className="md:hidden p-3 space-y-3">
                    {transaccionesPaginadas.map((transaccion) => {
                        const puedeEditar = user?.role === 'admin' || transaccion.user_id === user?.id
                        const puedeAnular = puedeEditar && transaccion.estado === 'activa'

                        return (
                            <div
                                key={transaccion.id}
                                onClick={() => navigate(`/transacciones/${transaccion.id}`)}
                                className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm active:shadow-md transition-shadow"
                            >
                                {/* Header: N° y Monto */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-medium">N° {transaccion.numero_transaccion}</p>
                                        <p className={`text-lg font-bold ${transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(transaccion.monto)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {getTipoBadge(transaccion.tipo)}
                                        {getEstadoBadge(transaccion.estado)}
                                    </div>
                                </div>

                                {/* Grid 2 Columnas - Info Compacta */}
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-2">
                                    <div>
                                        <p className="text-gray-500">Fecha</p>
                                        <p className="text-gray-900 font-medium">{formatDate(transaccion.fecha)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Categoría</p>
                                        <p className="text-gray-900 font-medium truncate">{transaccion.categoria?.nombre || '-'}</p>
                                    </div>
                                    {transaccion.actividad && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500">Actividad</p>
                                            <p className="text-gray-900 font-medium truncate">{transaccion.actividad.nombre}</p>
                                        </div>
                                    )}
                                    {transaccion.persona && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500">Persona</p>
                                            <p className="text-gray-900 font-medium truncate">
                                                {transaccion.persona.nombres} {transaccion.persona.primer_apellido}
                                            </p>
                                        </div>
                                    )}
                                    {transaccion.descripcion && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500">Descripción</p>
                                            <p className="text-gray-900 text-xs line-clamp-2">{transaccion.descripcion}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/transacciones/${transaccion.id}`)
                                        }}
                                        className="flex-1 px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Ver
                                    </button>

                                    {onViewReceipt && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onViewReceipt(transaccion)
                                            }}
                                            className="flex-1 px-2 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Receipt className="w-3.5 h-3.5" />
                                            PDF
                                        </button>
                                    )}

                                    {puedeEditar && transaccion.estado === 'activa' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/transacciones/${transaccion.id}/editar`)
                                            }}
                                            className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Editar
                                        </button>
                                    )}

                                    {puedeAnular && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                abrirModalAnular(transaccion)
                                            }}
                                            disabled={anulandoId === transaccion.id}
                                            className="flex-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                            Anular
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs sm:text-sm text-gray-600">
                            {indiceInicio + 1}-{Math.min(indiceFin, transacciones.length)} de {transacciones.length}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                disabled={paginaActual === 1}
                                className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                disabled={paginaActual === totalPaginas}
                                className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Anulación */}
            <Modal
                isOpen={modalAnularOpen}
                onClose={cerrarModalAnular}
                title="Anular Transacción"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={cerrarModalAnular}
                            disabled={!!anulandoId}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmarAnulacion}
                            disabled={!motivoAnulacion || motivoAnulacion.trim().length < 10 || !!anulandoId}
                            loading={!!anulandoId}
                        >
                            Confirmar Anulación
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-red-900">¿Estás seguro?</h4>
                            <p className="text-sm text-red-700 mt-1">
                                Esta acción anulará la transacción <strong>{transaccionAAnular?.numero_transaccion}</strong>.
                                El monto será revertido y esta acción no se puede deshacer.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Motivo de anulación <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={motivoAnulacion}
                            onChange={(e) => setMotivoAnulacion(e.target.value)}
                            placeholder="Describe por qué estás anulando esta transacción..."
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 min-h-[100px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Mínimo 10 caracteres. Caracteres actuales: {motivoAnulacion.length}
                        </p>
                    </div>
                </div>
            </Modal>

            <SavingOverlay
                isLoading={false}
                isSuccess={showSuccessOverlay}
                loadingText="Anulando transacción..."
                successText="¡Transacción anulada exitosamente!"
            />
        </>
    )
}
