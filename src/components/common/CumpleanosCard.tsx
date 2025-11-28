import React, { useEffect, useState } from 'react'
import { PersonasService } from '@/services/personas.service'
import type { Persona } from '@/types'
import { Cake, AlertCircle } from 'lucide-react'

export const CumpleanosCard: React.FC = () => {
  const [proximosCumpleanios, setProximosCumpleanios] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarCumpleanios = async () => {
      try {
        const datos = await PersonasService.obtenerProximosCumpleanos()

        // Excluir cumpleaños de HOY (solo mostrar próximos)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)

        const soloProximos = datos.filter(persona => {
          if (!persona.fecha_nacimiento) return false

          // Parsear manualmente para evitar problemas de zona horaria
          const fechaStr = persona.fecha_nacimiento.includes('T')
            ? persona.fecha_nacimiento.split('T')[0]
            : persona.fecha_nacimiento
          const [, mes, dia] = fechaStr.split('-').map(Number)

          // Excluir si es HOY (usando comparación estricta de día/mes)
          const esHoy = dia === hoy.getDate() && (mes - 1) === hoy.getMonth()
          return !esHoy
        })

        setProximosCumpleanios(soloProximos.slice(0, 3)) // Top 3 próximos
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    cargarCumpleanios()
  }, [])

  const calcularDiasRestantes = (fecha: string): number => {
    const hoy = new Date()
    const fechaStr = fecha.includes('T') ? fecha.split('T')[0] : fecha
    const [, mes, dia] = fechaStr.split('-').map(Number)

    // Si es el mismo día y mes, es HOY (0 días)
    if (dia === hoy.getDate() && (mes - 1) === hoy.getMonth()) {
      return 0
    }

    const cumpleanosEsteAno = new Date(
      hoy.getFullYear(),
      mes - 1,
      dia
    )
    cumpleanosEsteAno.setHours(0, 0, 0, 0)
    hoy.setHours(0, 0, 0, 0)

    if (cumpleanosEsteAno < hoy) {
      cumpleanosEsteAno.setFullYear(hoy.getFullYear() + 1)
    }

    const diferencia = cumpleanosEsteAno.getTime() - hoy.getTime()
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))
    return dias
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-green-100 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Cake className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Próximos Cumpleaños</h3>
      </div>

      {proximosCumpleanios.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay cumpleaños próximos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proximosCumpleanios.map((persona) => {
            const diasRestantes = calcularDiasRestantes(persona.fecha_nacimiento)
            const estaProximo = diasRestantes <= 7

            return (
              <div
                key={persona.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition ${estaProximo
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {persona.nombres} {persona.primer_apellido}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(() => {
                      const fechaStr = persona.fecha_nacimiento.includes('T')
                        ? persona.fecha_nacimiento.split('T')[0]
                        : persona.fecha_nacimiento
                      const [, mes, dia] = fechaStr.split('-').map(Number)
                      const fechaObj = new Date(new Date().getFullYear(), mes - 1, dia)
                      return fechaObj.toLocaleDateString('es-CO', { month: 'long', day: 'numeric' })
                    })()}
                  </p>
                </div>

                <div
                  className={`text-right px-3 py-1 rounded-lg font-bold text-sm ${estaProximo
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  {diasRestantes === 0 ? '¡Hoy!' : `${diasRestantes}d`}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}