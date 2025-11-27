import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PersonasCharts } from '@/components/reportes/PersonasCharts'
import { usePersonasStore } from '@/stores/personas.store'
import { ArrowLeft } from 'lucide-react'
import { format, parseISO, differenceInYears } from 'date-fns'
import { es } from 'date-fns/locale'

export const ReportesPersonasPage: React.FC = () => {
    const navigate = useNavigate()
    const { personas, fetchPersonas } = usePersonasStore()
    const [isLoading, setIsLoading] = useState(true)

    // Estados para los gráficos
    const [growthData, setGrowthData] = useState<any[]>([])
    const [genderData, setGenderData] = useState<any[]>([])
    const [ageData, setAgeData] = useState<any[]>([])
    const [bautizadosData, setBautizadosData] = useState<any[]>([])
    const [baptismByAgeData, setBaptismByAgeData] = useState<any[]>([])

    // Estados para filtros
    const [fechaInicio, setFechaInicio] = useState<string>('')
    const [fechaFin, setFechaFin] = useState<string>('')

    useEffect(() => {
        const loadData = async () => {
            console.log('🔍 [ReportesPersonas] Iniciando carga de datos...')
            console.log('🔍 [ReportesPersonas] Personas actuales en store:', personas?.length || 0)

            setIsLoading(true)
            try {
                console.log('🔍 [ReportesPersonas] Llamando fetchPersonas()...')
                await fetchPersonas()
                console.log('✅ [ReportesPersonas] fetchPersonas() completado')
            } catch (error) {
                console.error('❌ [ReportesPersonas] Error cargando personas:', error)
            } finally {
                setIsLoading(false)
                console.log('🔍 [ReportesPersonas] Carga finalizada. isLoading ahora es false')
            }
        }
        loadData()
    }, [fetchPersonas])

    // Procesar datos cuando cambian las personas o los filtros
    useEffect(() => {
        console.log('🔄 [ReportesPersonas useEffect#2] Ejecutando procesamiento...')
        console.log('🔄 [ReportesPersonas useEffect#2] personas:', personas?.length || 0)
        console.log('🔄 [ReportesPersonas useEffect#2] fechaInicio:', fechaInicio)
        console.log('🔄 [ReportesPersonas useEffect#2] fechaFin:', fechaFin)

        if (!personas || personas.length === 0) {
            console.warn('⚠️ [ReportesPersonas useEffect#2] No hay personas para procesar, saliendo...')
            return
        }

        console.log('📊 Procesando datos para reportes...', personas.length)

        // Filtrar personas
        let personasFiltradas = [...personas]

        if (fechaInicio) {
            personasFiltradas = personasFiltradas.filter(p =>
                new Date(p.created_at) >= new Date(fechaInicio)
            )
            console.log('📊 Después de filtro fechaInicio:', personasFiltradas.length)
        }

        if (fechaFin) {
            const fin = new Date(fechaFin)
            fin.setHours(23, 59, 59, 999)
            personasFiltradas = personasFiltradas.filter(p =>
                new Date(p.created_at) <= fin
            )
            console.log('📊 Después de filtro fechaFin:', personasFiltradas.length)
        }

        console.log('📊 Total personas filtradas:', personasFiltradas.length)

        // 1. Crecimiento (Por mes de creación)
        const growthMap = new Map<string, number>()

        const sortedPersonas = [...personasFiltradas].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )

        let runningTotal = 0
        sortedPersonas.forEach((p: any) => {
            const date = new Date(p.created_at)
            const key = format(date, 'MMM yyyy', { locale: es })
            runningTotal++
            growthMap.set(key, runningTotal)
        })

        const growthDataProcessed = Array.from(growthMap.entries()).map(([month, total]) => ({
            month,
            personas: 0,
            total
        }))
        setGrowthData(growthDataProcessed)

        // 2. Género
        let hombres = 0
        let mujeres = 0
        personasFiltradas.forEach((p: any) => {
            if (p.genero === 'M') hombres++
            else if (p.genero === 'F') mujeres++
        })
        setGenderData([
            { name: 'Hombres', value: hombres },
            { name: 'Mujeres', value: mujeres }
        ])

        // 3. Edad
        const ageRanges: Record<string, number> = {
            '0-12': 0,
            '13-17': 0,
            '18-30': 0,
            '31-50': 0,
            '51-70': 0,
            '70+': 0
        }

        console.log('📊 [Age Processing] Total personas filtradas para edad:', personasFiltradas.length)
        let personasConEdad = 0
        let personasSinEdad = 0

        personasFiltradas.forEach((p: any) => {
            if (p.fecha_nacimiento) {
                personasConEdad++
                const age = differenceInYears(new Date(), parseISO(p.fecha_nacimiento))
                console.log(`📊 [Age] Persona ${p.full_name}: edad ${age} (nacimiento: ${p.fecha_nacimiento})`)
                if (age <= 12) ageRanges['0-12']++
                else if (age <= 17) ageRanges['13-17']++
                else if (age <= 30) ageRanges['18-30']++
                else if (age <= 50) ageRanges['31-50']++
                else if (age <= 70) ageRanges['51-70']++
                else ageRanges['70+']++
            } else {
                personasSinEdad++
            }
        })

        console.log('📊 [Age Results] Personas con fecha de nacimiento:', personasConEdad)
        console.log('📊 [Age Results] Personas sin fecha de nacimiento:', personasSinEdad)
        console.log('📊 [Age Results] Distribución por rango:', ageRanges)

        const ageDataProcessed = Object.entries(ageRanges).map(([range, count]) => ({
            name: range,
            value: count
        }))
        console.log('📊 [Age Results] ageDataProcessed:', ageDataProcessed)
        setAgeData(ageDataProcessed)

        // 4. Bautizados
        let bautizadosCount = 0
        let noBautizadosCount = 0
        personasFiltradas.forEach((p: any) => {
            if (p.bautizado) bautizadosCount++
            else noBautizadosCount++
        })

        setBautizadosData([
            { name: 'Bautizados', value: bautizadosCount },
            { name: 'No Bautizados', value: noBautizadosCount }
        ])

        // 5. Bautizados por Rango de Edad (Nuevo Gráfico Solicitado)
        const baptismByAgeRanges: Record<string, { bautizados: number; noBautizados: number }> = {
            '0-12': { bautizados: 0, noBautizados: 0 },
            '13-17': { bautizados: 0, noBautizados: 0 },
            '18-30': { bautizados: 0, noBautizados: 0 },
            '31-50': { bautizados: 0, noBautizados: 0 },
            '51-70': { bautizados: 0, noBautizados: 0 },
            '70+': { bautizados: 0, noBautizados: 0 }
        }

        personasFiltradas.forEach((p: any) => {
            if (p.fecha_nacimiento) {
                const age = differenceInYears(new Date(), parseISO(p.fecha_nacimiento))
                let range = '70+'
                if (age <= 12) range = '0-12'
                else if (age <= 17) range = '13-17'
                else if (age <= 30) range = '18-30'
                else if (age <= 50) range = '31-50'
                else if (age <= 70) range = '51-70'

                if (p.bautizado) baptismByAgeRanges[range].bautizados++
                else baptismByAgeRanges[range].noBautizados++
            }
        })

        const baptismByAgeData = Object.entries(baptismByAgeRanges).map(([range, counts]) => ({
            name: range,
            bautizados: counts.bautizados,
            noBautizados: counts.noBautizados
        }))
        setBaptismByAgeData(baptismByAgeData)

    }, [personas, fechaInicio, fechaFin])

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
                        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-xl shadow-sm">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            {(fechaInicio || fechaFin) && (
                                <button
                                    onClick={() => {
                                        setFechaInicio('')
                                        setFechaFin('')
                                    }}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>

                        <PersonasCharts
                            growthData={growthData}
                            genderData={genderData}
                            ageData={ageData}
                            bautizadosData={bautizadosData}
                            baptismByAgeData={baptismByAgeData}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    )
}
