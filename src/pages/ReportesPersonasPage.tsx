import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ArrowLeft } from 'lucide-react'
import { PersonasCharts } from '@/components/reportes/PersonasCharts'
import { PersonasService } from '@/services/personas.service'

export const ReportesPersonasPage: React.FC = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [growthData, setGrowthData] = useState<any[]>([])
    const [genderData, setGenderData] = useState<any[]>([])
    const [ageData, setAgeData] = useState<any[]>([])

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            setIsLoading(true)
            // En un escenario real, el servicio debería devolver estos datos agregados
            // Por ahora simularemos el procesamiento con los datos crudos
            const personas = await PersonasService.obtenerMias()

            // 1. Crecimiento (Simulado basado en created_at)
            const growthMap = new Map<string, number>()
            const now = new Date()

            // Inicializar últimos 6 meses
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const key = d.toLocaleString('es-CO', { month: 'short', year: '2-digit' })
                growthMap.set(key, 0)
            }

            // Acumular
            let total = 0
            personas.forEach(p => {
                const d = new Date(p.created_at || new Date()) // Fallback a hoy si no hay fecha
                const key = d.toLocaleString('es-CO', { month: 'short', year: '2-digit' })

                // Solo contar si está en el rango de los últimos 6 meses para el gráfico mensual
                // Pero para el total acumulado, contamos todos hasta ese punto
                if (growthMap.has(key)) {
                    growthMap.set(key, (growthMap.get(key) || 0) + 1)
                }
            })

            // Calcular acumulado
            let runningTotal = 0
            // Ajustar runningTotal inicial con personas anteriores al rango (simulado)
            runningTotal = personas.length - Array.from(growthMap.values()).reduce((a, b) => a + b, 0)
            if (runningTotal < 0) runningTotal = 0

            const processedGrowth = Array.from(growthMap.entries()).map(([month, count]) => {
                runningTotal += count
                return { month, personas: count, total: runningTotal }
            })

            setGrowthData(processedGrowth)

            // 2. Género
            const genderMap = { 'M': 0, 'F': 0 }
            personas.forEach(p => {
                if (p.genero === 'M' || p.genero === 'F') {
                    genderMap[p.genero]++
                }
            })
            setGenderData([
                { name: 'Masculino', value: genderMap['M'] },
                { name: 'Femenino', value: genderMap['F'] }
            ])

            // 3. Edad (Simulado o calculado si hay fecha de nacimiento)
            const ageMap = { '0-18': 0, '19-30': 0, '31-50': 0, '50+': 0 }
            personas.forEach(p => {
                if (p.fecha_nacimiento) {
                    const age = new Date().getFullYear() - new Date(p.fecha_nacimiento).getFullYear()
                    if (age <= 18) ageMap['0-18']++
                    else if (age <= 30) ageMap['19-30']++
                    else if (age <= 50) ageMap['31-50']++
                    else ageMap['50+']++
                }
            })
            setAgeData([
                { name: '0-18 años', value: ageMap['0-18'] },
                { name: '19-30 años', value: ageMap['19-30'] },
                { name: '31-50 años', value: ageMap['31-50'] },
                { name: 'Mayor de 50', value: ageMap['50+'] }
            ])

        } catch (error) {
            console.error('Error cargando datos de personas:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gray-50">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/reportes')}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Reportes de Personas</h1>
                                <p className="text-gray-500">Estadísticas demográficas y de crecimiento</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mt-6">
                        <PersonasCharts
                            isLoading={isLoading}
                            growthData={growthData}
                            genderData={genderData}
                            ageData={ageData}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    )
}
