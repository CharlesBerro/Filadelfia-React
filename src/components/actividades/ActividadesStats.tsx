// src/components/actividades/ActividadesStats.tsx
import React, { useEffect, useState } from 'react'
import { Target, TrendingUp, CheckCircle2, DollarSign } from 'lucide-react'
import { ActividadesService } from '@/services/actividades.service'

/**
 * Componente de estadísticas de actividades
 * 
 * Muestra cards con:
 * - Total de actividades
 * - Actividades planeadas
 * - Actividades en curso
 * - Actividades completadas
 */
export const ActividadesStats: React.FC = () => {
    const [stats, setStats] = useState({
        total: 0,
        planeadas: 0,
        enCurso: 0,
        completadas: 0,
        totalMetas: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        cargarEstadisticas()
    }, [])

    const cargarEstadisticas = async () => {
        try {
            const data = await ActividadesService.obtenerEstadisticas()
            setStats(data)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
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
            title: 'Total Actividades',
            value: stats.total,
            icon: Target,
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            title: 'Planeadas',
            value: stats.planeadas,
            icon: TrendingUp,
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
        },
        {
            title: 'En Curso',
            value: stats.enCurso,
            icon: DollarSign,
            color: 'orange',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
        },
        {
            title: 'Completadas',
            value: stats.completadas,
            icon: CheckCircle2,
            color: 'green',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
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
                        <p className={`text-lg sm:text-2xl font-bold text-gray-900 truncate`}>
                            {card.value}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
