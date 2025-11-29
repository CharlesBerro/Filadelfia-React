import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TransaccionesService } from '@/services/transacciones.service'
import { ExportService } from '@/services/export.service'
import type { TransaccionCompleta } from '@/types/transacciones'

export const ReportesContabilidadPage: React.FC = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [transacciones, setTransacciones] = useState<TransaccionCompleta[]>([])
    const [transaccionesFiltradas, setTransaccionesFiltradas] = useState<TransaccionCompleta[]>([])

    // Filtros
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            setIsLoading(true)
            const data = await TransaccionesService.obtenerTodas()
            setTransacciones(data)
            setTransaccionesFiltradas(data)
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }

    // Aplicar filtros
    const aplicarFiltros = () => {
        if (!fechaInicio && !fechaFin) {
            setTransaccionesFiltradas(transacciones)
            return
        }

        const filtered = transacciones.filter(t => {
            const fecha = new Date(t.fecha)
            const inicio = fechaInicio ? new Date(fechaInicio) : null
            const fin = fechaFin ? new Date(fechaFin) : null

            if (inicio && fecha < inicio) return false
            if (fin && fecha > fin) return false
            return true
        })

        setTransaccionesFiltradas(filtered)
    }

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFechaInicio('')
        setFechaFin('')
        setTransaccionesFiltradas(transacciones)
    }

    // Calcular estadísticas
    const calcularStats = () => {
        let totalIngresos = 0
        let totalEgresos = 0

        transaccionesFiltradas.forEach(t => {
            if (t.tipo === 'ingreso') totalIngresos += t.monto
            else totalEgresos += t.monto
        })

        return {
            totalIngresos,
            totalEgresos,
            balance: totalIngresos - totalEgresos
        }
    }

    const stats = calcularStats()

    // Exportar
    const handleExportPDF = () => {
        ExportService.exportToPDF(transaccionesFiltradas, 'Reporte de Transacciones')
    }

    const handleExportExcel = () => {
        ExportService.exportToExcel(transaccionesFiltradas, 'reporte_transacciones')
    }

    const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando datos...</p>
                    </div>
                </div>
            </Layout>
        )
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
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    💰 Reportes de Contabilidad
                                </h1>
                                <p className="text-gray-500">Análisis financiero de ingresos y egresos</p>
                            </div>
                        </div>
                    </div>

                    {/* Filtros de Fecha */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Filtros de Fecha</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Desde
                                </label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Hasta
                                </label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={aplicarFiltros}>
                                Aplicar Filtros
                            </Button>
                            <Button onClick={limpiarFiltros} variant="secondary">
                                Limpiar
                            </Button>
                        </div>
                    </div>

                    {/* Tarjetas de Resumen */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Total Ingresos</span>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIngresos)}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-red-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Total Egresos</span>
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalEgresos)}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Balance</span>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.balance)}</p>
                        </div>
                    </div>

                    {/* Botones de Exportación */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Exportar Datos</h3>
                        <div className="flex gap-4">
                            <Button onClick={handleExportPDF} className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Exportar a PDF
                            </Button>
                            <Button onClick={handleExportExcel} variant="secondary" className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Exportar a Excel
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                            {transaccionesFiltradas.length} transacciones serán exportadas
                        </p>
                    </div>

                    {/* Lista de Transacciones (para debug) */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Transacciones Cargadas</h3>
                        <p className="text-sm text-gray-600 mb-2">Total: {transacciones.length} transacciones</p>
                        <p className="text-sm text-gray-600">Filtradas: {transaccionesFiltradas.length} transacciones</p>

                        {transaccionesFiltradas.length > 0 && (
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Trans</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transaccionesFiltradas.slice(0, 10).map((t) => (
                                            <tr key={t.id}>
                                                <td className="px-3 py-2 text-sm">{new Date(t.fecha).toLocaleDateString('es-CO')}</td>
                                                <td className="px-3 py-2 text-sm">{t.numero_transaccion}</td>
                                                <td className="px-3 py-2 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs ${t.tipo === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {t.tipo}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium">{formatCurrency(t.monto)}</td>
                                                <td className="px-3 py-2 text-sm">{t.categoria?.nombre || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {transaccionesFiltradas.length > 10 && (
                                    <p className="text-sm text-gray-500 mt-2 text-center">
                                        Mostrando 10 de {transaccionesFiltradas.length} transacciones
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}
