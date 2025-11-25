import React, { useState } from 'react'
import { ArrowLeft, FileText, Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TransaccionesService } from '@/services/transacciones.service'
import { ExportService } from '@/services/export.service'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ExportReportsProps {
    onBack: () => void
}

export const ExportReports: React.FC<ExportReportsProps> = ({ onBack }) => {
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleExport = async (type: 'pdf' | 'excel') => {
        if (!fechaInicio || !fechaFin) {
            setError('Por favor seleccione un rango de fechas')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const transacciones = await TransaccionesService.obtenerTodas({
                fechaInicio,
                fechaFin
            })

            if (transacciones.length === 0) {
                setError('No hay transacciones para exportar en el rango seleccionado')
                return
            }

            if (type === 'pdf') {
                ExportService.exportToPDF(transacciones, `Reporte_${fechaInicio}_${fechaFin}`)
            } else {
                ExportService.exportToExcel(transacciones, `reporte_transacciones_${fechaInicio}_${fechaFin}`)
            }
        } catch (err: any) {
            console.error('Error exporting:', err)
            setError(err.message || 'Error al exportar los datos')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Download className="w-6 h-6 text-blue-600" />
                            Exportar Datos
                        </h2>
                        <p className="text-gray-500 text-sm">Descarga reportes detallados en PDF o Excel</p>
                    </div>
                </div>
                <Button variant="secondary" onClick={onBack}>
                    Volver a Reportes
                </Button>
            </div>

            {/* Content */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Seleccionar Rango de Fechas</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        )}
                        <div className="text-left">
                            <p className="font-semibold">Exportar PDF</p>
                            <p className="text-xs opacity-75">Formato imprimible</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleExport('excel')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl border border-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        )}
                        <div className="text-left">
                            <p className="font-semibold">Exportar Excel</p>
                            <p className="text-xs opacity-75">Formato hoja de cálculo</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}
