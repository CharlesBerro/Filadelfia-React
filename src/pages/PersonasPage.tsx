// src/pages/PersonasPage.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PersonasTable } from '@/components/personas/PersonasTable'
import { PersonasStats } from '@/components/personas/PersonasStats'
import { usePersonasStore } from '@/stores/personas.store'
import { Button } from '@/components/ui/Button'
import { Users, UserPlus } from 'lucide-react'
import { SedesService } from '@/services/sedes.service'
import type { Sede } from '@/types'

export const PersonasPage: React.FC = () => {
  const navigate = useNavigate()
  const { personas, fetchPersonas } = usePersonasStore()
  const [sedes, setSedes] = useState<Sede[]>([])

  // Estado de Filtros Elevado
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estadoCivil: '',
    bautizado: '',
    sede: '',
  })

  // Cargar personas al montar
  useEffect(() => {
    fetchPersonas()
  }, [fetchPersonas])

  // Cargar sedes al montar
  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const data = await SedesService.obtenerTodas()
        setSedes(data)
      } catch (error) {
      }
    }
    cargarSedes()
  }, [])

  // Lógica de Filtrado Centralizada
  const filteredPersonas = useMemo(() => {
    return personas.filter((persona) => {
      // Filtro por búsqueda (nombre, apellido, cédula)
      if (filtros.busqueda) {
        const searchLower = filtros.busqueda.toLowerCase()
        const nombreCompleto =
          `${persona.nombres || ''} ${persona.primer_apellido || ''} ${persona.segundo_apellido || ''}`.toLowerCase()
        const cedula = persona.numero_id?.toLowerCase() || ''

        if (!nombreCompleto.includes(searchLower) && !cedula.includes(searchLower)) {
          return false
        }
      }

      // Filtro por Estado Civil
      if (filtros.estadoCivil && persona.estado_civil !== filtros.estadoCivil) {
        return false
      }

      // Filtro por Bautizado
      if (filtros.bautizado) {
        const esBautizado = filtros.bautizado === 'si'
        if (persona.bautizado !== esBautizado) {
          return false
        }
      }

      // Filtro por Sede
      if (filtros.sede) {
        // Comparación estricta de strings
        const personaSedeId = String(persona.sede_id || '').trim()
        const filtroSedeId = String(filtros.sede).trim()
        if (personaSedeId !== filtroSedeId) {
          return false
        }
      }

      return true
    })
  }, [personas, filtros])

  return (
    <Layout>
      <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Personas</h1>
                <p className="text-sm text-gray-600">
                  Gestiona las personas de tu congregación
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/personas/nueva')}
              variant="primary"
            >
              <UserPlus className="w-5 h-5" />
              ➕ Nueva Persona
            </Button>
          </div>

          {/* Estadísticas con datos filtrados */}
          <PersonasStats personas={filteredPersonas} />

          {/* Tabla con datos filtrados y control de filtros */}
          <PersonasTable
            personas={filteredPersonas}
            filtros={filtros}
            onFilterChange={setFiltros}
            sedes={sedes}
          />


        </div>
      </div>
    </Layout>
  )
}