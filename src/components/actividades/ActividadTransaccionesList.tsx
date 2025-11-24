import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Receipt } from 'lucide-react'
import type { TransaccionCompleta } from '@/types/transacciones'

interface ActividadTransaccionesListProps {
    transacciones: TransaccionCompleta[]
    isLoading: boolean
}

export const ActividadTransaccionesList: React.FC<ActividadTransaccionesListProps> = ({ transacciones, isLoading }) => {
    const navigate = useNavigate()

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

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    if (transacciones.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay transacciones registradas para esta actividad</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 whitespace-nowrap">Fecha</th>
                        <th className="px-4 py-3 whitespace-nowrap">Tipo</th>
                        <th className="px-4 py-3 whitespace-nowrap">Monto</th>
                        <th className="px-4 py-3 whitespace-nowrap">Categoría</th>
                        <th className="px-4 py-3 whitespace-nowrap">Descripción</th>
                        <th className="px-4 py-3 text-right whitespace-nowrap">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {transacciones.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-4 py-3 text-gray-900">{formatDate(t.fecha)}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.tipo === 'ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                                </span>
                            </td>
                            <td className={`px-4 py-3 font-medium ${t.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formatCurrency(t.monto)}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{t.categoria?.nombre || '-'}</td>
                            <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={t.descripcion || ''}>
                                {t.descripcion || '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button
                                    onClick={() => navigate(`/transacciones/${t.id}`)}
                                    className="text-gray-400 hover:text-purple-600 transition-colors p-1 rounded-full hover:bg-purple-50"
                                    title="Ver detalle"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
