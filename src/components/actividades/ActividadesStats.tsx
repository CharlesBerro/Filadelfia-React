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
            console.error('Error cargando estadísticas:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon
                return (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${card.iconColor}`} />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </div>
                )
            })}
        </div>
    )
}
