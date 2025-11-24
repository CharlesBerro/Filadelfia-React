import React, { useEffect, useState } from 'react'
import { PersonasService } from '@/services/personas.service'
import type { Persona } from '@/types'
import { Cake, PartyPopper } from 'lucide-react'
export const CumpleanosHoyCard: React.FC = () => {
    const [cumpleanosHoy, setCumpleanosHoy] = useState<Persona[]>([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const cargarCumpleanosHoy = async () => {
            try {
                const todas = await PersonasService.obtenerProximosCumpleanos()
                console.log('🎂 Todas las personas:', todas)

                // Filtrar solo las personas que cumplen HOY
                const hoy = new Date()
                console.log('📅 HOY es:', {
                    fecha: hoy.toISOString(),
                    día: hoy.getDate(),
                    mes: hoy.getMonth()
                })
                const cumpleanosHoyFiltrado = todas.filter(persona => {
                    if (!persona.fecha_nacimiento) return false

                    // Parsear manualmente para evitar problemas de zona horaria
                    const fechaStr = persona.fecha_nacimiento.includes('T')
                        ? persona.fecha_nacimiento.split('T')[0]
                        : persona.fecha_nacimiento
                    const [anio, mes, dia] = fechaStr.split('-').map(Number)

                    console.log(`👤 ${persona.nombres}:`, {
                        fecha_original: persona.fecha_nacimiento,
                        dia_parseado: dia,
                        mes_parseado: mes,
                        hoy_dia: hoy.getDate(),
                        hoy_mes: hoy.getMonth() + 1
                    })

                    return dia === hoy.getDate() && (mes - 1) === hoy.getMonth()
                })

                console.log('🎉 Personas que cumplen HOY:', cumpleanosHoyFiltrado)
                setCumpleanosHoy(cumpleanosHoyFiltrado)
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }

        cargarCumpleanosHoy()
    }, [])
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-amber-100">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-12 bg-gray-100 rounded"></div>
                </div>
            </div>
        )
    }
    if (cumpleanosHoy.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Cake className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Cumpleaños de Hoy</h3>
                </div>
                <p className="text-sm text-gray-500 text-center py-4">
                    No hay cumpleaños hoy
                </p>
            </div>
        )
    }
    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-md p-6 border-2 border-amber-200 hover:shadow-lg transition">
            {/* Header con animación */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center animate-bounce">
                    <PartyPopper className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-amber-900">¡Cumpleaños de Hoy! 🎉</h3>
            </div>
            {/* Lista de cumpleañeros */}
            <div className="space-y-3">
                {cumpleanosHoy.map((persona) => {
                    const edad = persona.fecha_nacimiento
                        ? new Date().getFullYear() - new Date(persona.fecha_nacimiento).getFullYear()
                        : null
                    return (
                        <div
                            key={persona.id}
                            className="bg-white rounded-lg p-4 border-2 border-amber-300 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                                        <Cake className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {persona.nombres} {persona.primer_apellido}
                                        </p>
                                        {edad && (
                                            <p className="text-sm text-amber-700 font-medium">
                                                Cumple {edad} años hoy
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-4xl animate-pulse">🎂</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}