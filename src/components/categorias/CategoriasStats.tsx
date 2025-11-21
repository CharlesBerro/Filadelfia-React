// src/components/categorias/CategoriasStats.tsx
import React from 'react'
import { useCategoriasStore } from '@/stores/categorias.store'
import { TrendingUp, TrendingDown, Tag } from 'lucide-react'

/**
 * Estadísticas de Categorías
 * 
 * Muestra:
 * - Total de categorías
 * - Categorías de ingreso
 * - Categorías de egreso
 */

export const CategoriasStats: React.FC = () => {
  const { categorias } = useCategoriasStore()

  const stats = [
    {
      label: 'Total Categorías',
      value: categorias.length,
      icon: Tag,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Categorías de Ingreso',
      value: categorias.filter((c) => c.tipo === 'ingreso').length,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Categorías de Egreso',
      value: categorias.filter((c) => c.tipo === 'egreso').length,
      icon: TrendingDown,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-green-100 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}