// src/components/personas/PersonasStats.tsx
import React from 'react'
import { Users, UserCheck, UserX, Droplet } from 'lucide-react'
import type { Persona } from '@/types'

/**
 * Cards de estadísticas de personas
 * 
 * ¿Qué muestra?
 * - Total de personas
 * - Personas bautizadas
 * - Personas no bautizadas
 * - Género (masculino/femenino)
 */

interface PersonasStatsProps {
  personas: Persona[]
}

export const PersonasStats: React.FC<PersonasStatsProps> = ({ personas }) => {
  // Calcular estadísticas
  const total = personas.length
  const bautizados = personas.filter((p) => p.bautizado).length
  const noBautizados = total - bautizados
  const masculinos = personas.filter((p) => p.genero === 'Masculino').length
  const femeninos = personas.filter((p) => p.genero === 'Femenino').length

  const stats = [
    {
      label: 'Total Personas',
      value: total,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Bautizados',
      value: bautizados,
      icon: Droplet,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'No Bautizados',
      value: noBautizados,
      icon: UserX,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
    {
      label: 'Masculino / Femenino',
      value: `${masculinos} / ${femeninos}`,
      icon: UserCheck,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 border border-green-100 hover:shadow-lg transition"
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