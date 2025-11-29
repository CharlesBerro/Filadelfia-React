// pages/TransaccionesPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { TransaccionesStats } from '@/components/transacciones/TransaccionesStats'
import { TransaccionesFiltersComponent } from '@/components/transacciones/TransaccionesFilters'
import { TransaccionesTable } from '@/components/transacciones/TransaccionesTable'
import { PDFPreviewModal } from '@/components/transacciones/PDFPreviewModal'
import { TransaccionesService } from '@/services/transacciones.service'
import { useTransaccionesStore } from '@/stores/transacciones.store'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Receipt, Plus, FileSpreadsheet } from 'lucide-react'
import { TransaccionCompleta } from '@/types/transacciones'

/**
 * Página principal de Transacciones
 */
export const TransaccionesPage: React.FC = () => {
    const navigate = useNavigate()
    const { transacciones, setTransacciones, filters, loading, setLoading, setError } = useTransaccionesStore()

    // Estado para el modal de PDF
    const [pdfModalOpen, setPdfModalOpen] = useState(false)
    const [selectedTransaccion, setSelectedTransaccion] = useState<TransaccionCompleta | null>(null)

    useEffect(() => {
        cargarTransacciones()
    }, [filters])

    const cargarTransacciones = async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await TransaccionesService.obtenerTodas(filters)
            setTransacciones(data)
        } catch (error: any) {
            setError(error.message || 'Error al cargar transacciones')
        } finally {
            setLoading(false)
        }
    }

    const handleExportExcel = () => {
        if (!transacciones || transacciones.length === 0) {
            alert('No hay transacciones para exportar')
            return
        }


        // Definir cabeceras
        const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Estado', 'Persona', 'Actividad']

        // Convertir datos a formato CSV
        const csvContent = [
            headers.join(','),
            ...transacciones.map(t => {
                const fecha = new Date(t.fecha).toLocaleDateString('es-ES')
                const tipo = t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'
                const categoria = t.categoria?.nombre || 'Sin categoría'
                const descripcion = `"${(t.descripcion || '').replace(/"/g, '""')}"` // Escapar comillas
                const monto = t.monto.toFixed(2)
                const estado = t.estado === 'anulada' ? 'Anulada' : 'Activa'
                const persona = t.persona ? `"${t.persona.nombres} ${t.persona.primer_apellido}"` : '-'
                const actividad = t.actividad ? `"${t.actividad.nombre}"` : '-'

                return [fecha, tipo, categoria, descripcion, monto, estado, persona, actividad].join(',')
            })
        ].join('\n')

        // Crear blob y descargar
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        // Nombre del archivo con filtros aplicados
        let fileName = 'transacciones_filadelfia'
        if (filters.tipo) fileName += `_${filters.tipo}`
        if (filters.estado && filters.estado !== 'todas') fileName += `_${filters.estado}`
        fileName += `_${new Date().toISOString().split('T')[0]}.csv`

        link.setAttribute('href', url)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleViewReceipt = (transaccion: TransaccionCompleta) => {
        setSelectedTransaccion(transaccion)
        setPdfModalOpen(true)
    }

    const handleDownloadPDF = async () => {
        if (!transacciones || transacciones.length === 0) {
            alert('No hay transacciones para exportar')
            return
        }

        try {
            const { pdf } = await import('@react-pdf/renderer')
            const { ReportePDF } = await import('@/components/transacciones/ReportePDF')


            // Crear el documento PDF
            const blob = await pdf(<ReportePDF transacciones={transacciones} />).toBlob()

            // Descargar el PDF
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `reporte_transacciones_${new Date().toISOString().split('T')[0]}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

        } catch (error) {
            alert('Error al generar PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'))
        }
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
                            <Button onClick={handleDownloadPDF} variant="secondary">
                                <FileSpreadsheet className="w-5 h-5" />
                                Exportar PDF
                            </Button>
                            <Button onClick={handleExportExcel} variant="secondary">
                                <FileSpreadsheet className="w-5 h-5" />
                                Exportar CSV
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
                        <TransaccionesTable onViewReceipt={handleViewReceipt} />
                    )}
                </div>
            </div>

            {/* Modal de PDF */}
            <PDFPreviewModal
                isOpen={pdfModalOpen}
                onClose={() => setPdfModalOpen(false)}
                transaccion={selectedTransaccion}
            />
        </Layout>
    )
}
