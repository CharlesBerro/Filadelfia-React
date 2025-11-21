// src/components/actividades/ProgresoCard.tsx
import React from 'react'
import { TrendingUp } from 'lucide-react'

interface ProgresoCardProps {
    recaudado: number
    meta: number
    porcentaje: number
    size?: 'small' | 'large'
}

/**
 * Card de progreso de actividad
 * 
 * Muestra:
 * - Barra de progreso
 * - Monto recaudado / Meta
 * - Porcentaje
 */
export const ProgresoCard: React.FC<ProgresoCardProps> = ({
    recaudado,
    meta,
    porcentaje,
    size = 'small',
}) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value)
    }

    const getColorClass = () => {
        if (porcentaje >= 100) return 'bg-green-500'
        if (porcentaje >= 75) return 'bg-blue-500'
        if (porcentaje >= 50) return 'bg-yellow-500'
        if (porcentaje >= 25) return 'bg-orange-500'
        return 'bg-red-500'
    }

    const isLarge = size === 'large'

    return (
        <div className={`bg-white rounded-xl ${isLarge ? 'p-8' : 'p-4'} shadow-sm`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className={`${isLarge ? 'w-6 h-6' : 'w-5 h-5'} text-blue-600`} />
                    <h3 className={`${isLarge ? 'text-lg' : 'text-sm'} font-semibold text-gray-700`}>
                        Progreso
                    </h3>
                </div>
                <span className={`${isLarge ? 'text-2xl' : 'text-lg'} font-bold text-gray-900`}>
                    {porcentaje.toFixed(1)}%
                </span>
            </div>

            {/* Barra de progreso */}
            <div className="mb-4">
                <div className={`w-full ${isLarge ? 'h-4' : 'h-2'} bg-gray-200 rounded-full overflow-hidden`}>
                    <div
                        className={`h-full ${getColorClass()} transition-all duration-500 ease-out`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                    />
                </div>
            </div>

            {/* Montos */}
            <div className="flex items-center justify-between">
                <div>
                    <p className={`${isLarge ? 'text-sm' : 'text-xs'} text-gray-500 mb-1`}>Recaudado</p>
                    <p className={`${isLarge ? 'text-xl' : 'text-sm'} font-bold text-green-600`}>
                        {formatCurrency(recaudado)}
                    </p>
                </div>
                <div className="text-right">
                    <p className={`${isLarge ? 'text-sm' : 'text-xs'} text-gray-500 mb-1`}>Meta</p>
                    <p className={`${isLarge ? 'text-xl' : 'text-sm'} font-bold text-gray-900`}>
                        {formatCurrency(meta)}
                    </p>
                </div>
            </div>

            {/* Faltante */}
            {recaudado < meta && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className={`${isLarge ? 'text-sm' : 'text-xs'} text-gray-500 mb-1`}>
                        Falta por recaudar
                    </p>
                    <p className={`${isLarge ? 'text-lg' : 'text-sm'} font-semibold text-orange-600`}>
                        {formatCurrency(meta - recaudado)}
                    </p>
                </div>
            )}

            {/* Completado */}
            {porcentaje >= 100 && (
                <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-center text-green-600 font-semibold flex items-center justify-center gap-2">
                        <span className="text-2xl">🎉</span>
                        ¡Meta alcanzada!
                    </p>
                </div>
            )}
        </div>
    )
}
