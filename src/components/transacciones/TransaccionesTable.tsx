// components/transacciones/TransaccionesTable.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Edit2, XCircle, Receipt } from 'lucide-react'
import { useTransaccionesStore } from '@/stores/transacciones.store'
import { TransaccionesService } from '@/services/transacciones.service'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/Button'
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
export const TransaccionesTable: React.FC = () => {
    const navigate = useNavigate()
    const { transacciones, updateTransaccion } = useTransaccionesStore()
    const { user } = useAuthStore()
    const [anulandoId, setAnulandoId] = useState<string | null>(null)
    const [paginaActual, setPaginaActual] = useState(1)
    const transaccionesPorPagina = 20

    // Paginación
    const indiceInicio = (paginaActual - 1) * transaccionesPorPagina
    const indiceFin = indiceInicio + transaccionesPorPagina
    const transaccionesPaginadas = transacciones.slice(indiceInicio, indiceFin)
    const totalPaginas = Math.ceil(transacciones.length / transaccionesPorPagina)

    const handleAnular = async (transaccion: TransaccionCompleta) => {
        const notas = prompt('Ingrese la razón de anulación (mínimo 10 caracteres):')

        if (!notas || notas.trim().length < 10) {
            alert('Debe proporcionar una razón detallada para la anulación')
            return
        }

        setAnulandoId(transaccion.id)
        try {
            const transaccionAnulada = await TransaccionesService.anular(transaccion.id, notas)
            updateTransaccion(transaccion.id, transaccionAnulada)
            alert('Transacción anulada exitosamente')
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
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
                            const puedeEditar = user?.rol === 'admin' || transaccion.user_id === user?.id
                            const puedeAnular = puedeEditar && transaccion.estado === 'activa'

                            return (
                                <tr
                                    key={transaccion.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/transacciones/${transaccion.id}`)}
                                >
                                    {/* N° Transacción */}
                                    <td className="px-3 py-2">
                                        <p className="font-mono font-semibold text-gray-900">
                                            {transaccion.numero_transaccion}
                                        </p>
                                    </td>

                                    {/* Fecha */}
                                    <td className="px-3 py-2">
                                        <p className="text-gray-900">{formatDate(transaccion.fecha)}</p>
                                    </td>

                                    {/* Monto */}
                                    <td className="px-3 py-2">
                                        <p className={`font-semibold ${transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(transaccion.monto)}
                                        </p>
                                    </td>

                                    {/* Tipo */}
                                    <td className="px-3 py-2">{getTipoBadge(transaccion.tipo)}</td>

                                    {/* Categoría */}
                                    <td className="px-3 py-2">
                                        <p className="text-gray-900">{transaccion.categoria?.nombre || '-'}</p>
                                    </td>

                                    {/* Actividad */}
                                    <td className="px-3 py-2">
                                        <p className="text-gray-900">{transaccion.actividad?.nombre || '-'}</p>
                                    </td>

                                    {/* Persona */}
                                    <td className="px-3 py-2">
                                        {transaccion.persona ? (
                                            <p className="text-gray-900">
                                                {transaccion.persona.nombres} {transaccion.persona.primer_apellido}
                                            </p>
                                        ) : (
                                            <p className="text-gray-500">-</p>
                                        )}
                                    </td>

                                    {/* Descripción */}
                                    <td className="px-3 py-2">
                                        <p className="text-gray-600 truncate max-w-xs">
                                            {transaccion.descripcion || '-'}
                                        </p>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-3 py-2">{getEstadoBadge(transaccion.estado)}</td>

                                    {/* Acciones */}
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
                                                        handleAnular(transaccion)
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

            {/* Paginación */}
            {totalPaginas > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Mostrando {indiceInicio + 1} a {Math.min(indiceFin, transacciones.length)} de {transacciones.length} transacciones
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                            disabled={paginaActual === 1}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaActual === totalPaginas}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
