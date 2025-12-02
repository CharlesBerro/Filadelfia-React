// components/transacciones/TransaccionesStats.tsx
import React, { useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react'
import { TransaccionesService } from '@/services/transacciones.service'
import { useTransaccionesStore } from '@/stores/transacciones.store'

/**
 * Componente de estadísticas de transacciones
 * 
 * Muestra 4 cards compactas:
 * - Total Ingresos (verde)
 * - Total Egresos (rojo)
 * - Balance (azul)
 * - Total Transacciones (morado)
 */
export const TransaccionesStats: React.FC = () => {
    const { stats, filters, loadingStats, setStats, setLoadingStats, setError } = useTransaccionesStore()

    useEffect(() => {
        cargarEstadisticas()
    }, [filters])

    const cargarEstadisticas = async () => {
        setLoadingStats(true)
        try {
            const data = await TransaccionesService.obtenerEstadisticas(filters)
            setStats(data)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoadingStats(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value)
    }

    if (loadingStats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        )
    }

    const cards = [
        {
            title: 'Total Ingresos',
            value: stats?.totalIngresos || 0,
            icon: TrendingUp,
            color: 'green',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            textColor: 'text-green-600',
        },
        {
            title: 'Total Egresos',
            value: stats?.totalEgresos || 0,
            icon: TrendingDown,
            color: 'red',
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
            textColor: 'text-red-600',
        },
        {
            title: 'Balance',
            value: stats?.balance || 0,
            icon: DollarSign,
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-600',
        },
        {
            title: 'Total Transacciones',
            value: stats?.totalTransacciones || 0,
            icon: Receipt,
            color: 'purple',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            textColor: 'text-purple-600',
            isCount: true,
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map((card, index) => {
                const Icon = card.icon
                return (
                    <div
                        key={index}
                        className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${card.bgColor} flex items-center justify-center shrink-0`}>
                                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.iconColor}`} />
                            </div>
                            <h3 className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">{card.title}</h3>
                        </div>
                        <p className={`text-lg sm:text-2xl font-bold ${card.textColor} truncate`}>
                            {card.isCount ? card.value : formatCurrency(card.value)}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
