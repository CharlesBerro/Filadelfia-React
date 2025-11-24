import React, { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { FileText, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TransaccionesService } from '@/services/transacciones.service'
import { ExportService } from '@/services/export.service'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export const ReportesPage: React.FC = () => {
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleExport = async (type: 'pdf' | 'excel') => {
        setIsLoading(true)
        setError(null)
        try {
            const transacciones = await TransaccionesService.obtenerTodas({
                fechaInicio: fechaInicio || undefined,
                fechaFin: fechaFin || undefined
            })

            if (transacciones.length === 0) {
                setError('No hay transacciones para exportar en el rango seleccionado')
                return
            }

            if (type === 'pdf') {
                ExportService.exportToPDF(transacciones, 'Reporte de Transacciones')
            } else {
                ExportService.exportToExcel(transacciones, 'reporte_transacciones')
            }
        } catch (err: any) {
            setError(err.message || 'Error al exportar')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-8 h-8 text-purple-600" />
                            Reportes y Exportación
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Genera reportes detallados de tus transacciones en formato PDF o Excel.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            Rango de Fechas
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => handleExport('pdf')}
                                disabled={isLoading}
                                variant="primary"
                                fullWidth
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar a PDF
                            </Button>
                            <Button
                                onClick={() => handleExport('excel')}
                                disabled={isLoading}
                                variant="secondary"
                                fullWidth
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar a Excel
                            </Button>
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-900 mb-2">Tips para reportes</h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Selecciona un rango de fechas para filtrar las transacciones.</li>
                            <li>Si no seleccionas fechas, se exportarán todas las transacciones históricas.</li>
                            <li>El reporte PDF incluye un resumen de totales y balance.</li>
                            <li>El reporte Excel es ideal para análisis detallados y cálculos propios.</li>
                        </ul>
                    </div>
                </div>
            </div>
            {isLoading && <LoadingSpinner fullScreen text="Generando reporte..." />}
        </Layout>
    )
}
