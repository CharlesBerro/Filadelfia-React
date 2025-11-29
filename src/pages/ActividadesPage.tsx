// src/pages/ActividadesPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ActividadesTable } from '@/components/actividades/ActividadesTable'
import { ActividadesStats } from '@/components/actividades/ActividadesStats'
import { ActividadesService } from '@/services/actividades.service'
import { useActividadesStore } from '@/stores/actividades.store'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Target, Plus } from 'lucide-react'

/**
 * Página principal de Actividades
 * 
 * Muestra:
 * - Estadísticas (cards con totales)
 * - Tabla de actividades
 * - Botón para crear nueva actividad
 */
export const ActividadesPage: React.FC = () => {
    const navigate = useNavigate()
    const { setActividades, setLoading, setError } = useActividadesStore()
    const [loadingData, setLoadingData] = useState(true)

    // Cargar actividades al montar el componente
    useEffect(() => {
        cargarActividades()
    }, [])

    const cargarActividades = async () => {
        setLoadingData(true)
        setLoading(true)
        setError(null)

        try {
            const data = await ActividadesService.obtenerTodas()
            setActividades(data)
        } catch (error: any) {
            setError(error.message || 'Error al cargar actividades')
        } finally {
            setLoadingData(false)
            setLoading(false)
        }
    }

    if (loadingData) {
        return (
            <Layout>
                <LoadingSpinner fullScreen text="Cargando actividades..." />
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 via-white to-purple-50">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Actividades</h1>
                                <p className="text-sm text-gray-600">
                                    Gestiona las actividades con metas financieras
                                </p>
                            </div>
                        </div>

                        <Button onClick={() => navigate('/actividades/nueva')} variant="primary">
                            <Plus className="w-5 h-5" />
                            Nueva Actividad
                        </Button>
                    </div>

                    {/* Estadísticas */}
                    <ActividadesStats />

                    {/* Tabla */}
                    <ActividadesTable />
                </div>
            </div>
        </Layout>
    )
}
