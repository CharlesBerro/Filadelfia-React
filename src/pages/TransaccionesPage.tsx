// pages/TransaccionesPage.tsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { TransaccionesStats } from '@/components/transacciones/TransaccionesStats'
import { TransaccionesFiltersComponent } from '@/components/transacciones/TransaccionesFilters'
import { TransaccionesTable } from '@/components/transacciones/TransaccionesTable'
import { TransaccionesService } from '@/services/transacciones.service'
import { useTransaccionesStore } from '@/stores/transacciones.store'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Receipt, Plus, FileDown, FileSpreadsheet } from 'lucide-react'

/**
 * Página principal de Transacciones
 * 
 * Muestra:
 * - Estadísticas
 * - Filtros
 * - Tabla de transacciones
 * - Botones de exportación
 */
export const TransaccionesPage: React.FC = () => {
    const navigate = useNavigate()
    const { setTransacciones, filters, loading, setLoading, setError } = useTransaccionesStore()

    useEffect(() => {
        cargarTransacciones()
    }, [filters])

    const cargarTransacciones = async () => {
        setLoading(true)
        setError(null)

        try {
            console.log('🔄 Cargando transacciones con filtros:', filters)
            const data = await TransaccionesService.obtenerTodas(filters)
            setTransacciones(data)
            console.log('✅ Transacciones cargadas:', data.length)
        } catch (error: any) {
            console.error('❌ Error cargando transacciones:', error)
            setError(error.message || 'Error al cargar transacciones')
        } finally {
            setLoading(false)
        }
    }

    const handleExportPDF = () => {
        // TODO: Implementar exportación PDF
        alert('Exportación PDF en desarrollo')
    }

    const handleExportExcel = () => {
        // TODO: Implementar exportación Excel
        alert('Exportación Excel en desarrollo')
    }

    if (loading && !filters) {
        return (
            <Layout>
                <LoadingSpinner fullScreen text="Cargando transacciones..." />
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Historial de Transacciones</h1>
                                <p className="text-sm text-gray-600">
                                    Gestiona ingresos y egresos
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={handleExportPDF} variant="secondary">
                                <FileDown className="w-5 h-5" />
                                Exportar PDF
                            </Button>
                            <Button onClick={handleExportExcel} variant="secondary">
                                <FileSpreadsheet className="w-5 h-5" />
                                Exportar Excel
                            </Button>
                            <Button onClick={() => navigate('/transacciones/nueva')} variant="primary">
                                <Plus className="w-5 h-5" />
                                Registrar Nuevo Movimiento
                            </Button>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <TransaccionesStats />

                    {/* Filtros */}
                    <TransaccionesFiltersComponent />

                    {/* Tabla */}
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm p-12">
                            <LoadingSpinner text="Cargando transacciones..." />
                        </div>
                    ) : (
                        <TransaccionesTable />
                    )}
                </div>
            </div>
        </Layout>
    )
}
