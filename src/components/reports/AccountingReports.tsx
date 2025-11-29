import React, { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, Calendar, Plus, Minus, DollarSign, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CashFlowChart } from '@/components/charts/CashFlowChart'
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart'
import { TransaccionesService } from '@/services/transacciones.service'
import { format, subDays, startOfMonth, isWithinInterval, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TransaccionCompleta } from '@/types/transacciones'

interface AccountingReportsProps {
    onBack: () => void
}

export const AccountingReports: React.FC<AccountingReportsProps> = ({ onBack }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [transacciones, setTransacciones] = useState<TransaccionCompleta[]>([])
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    })

    const cargarDatos = async () => {
        try {
            setIsLoading(true)
            // Obtenemos todas las transacciones activas para generar reportes precisos
            const data = await TransaccionesService.obtenerTodas()
            setTransacciones(data)
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        cargarDatos()
    }, [])

    // Filter transactions based on date range
    const filteredTransactions = useMemo(() => {
        return transacciones.filter(t => {
            if (!dateRange.start || !dateRange.end) return true
            return isWithinInterval(parseISO(t.fecha), {
                start: parseISO(dateRange.start),
                end: parseISO(dateRange.end)
            })
        })
    }, [transacciones, dateRange])

    // Calculate Summary Stats
    const stats = useMemo(() => {
        const ingresos = filteredTransactions
            .filter(t => t.tipo === 'ingreso')
            .reduce((acc, curr) => acc + curr.monto, 0)

        const egresos = filteredTransactions
            .filter(t => t.tipo === 'egreso')
            .reduce((acc, curr) => acc + curr.monto, 0)

        return {
            ingresos,
            egresos,
            balance: ingresos - egresos,
            actividades: filteredTransactions.filter(t => t.actividad_id).length
        }
    }, [filteredTransactions])

    // Prepare Chart Data
    const chartData = useMemo(() => {
        // Group by month for CashFlow
        const monthlyData = filteredTransactions.reduce((acc, t) => {
            const dateObj = parseISO(t.fecha)
            const sortKey = format(dateObj, 'yyyy-MM') // Clave para ordenar: 2025-01

            if (!acc[sortKey]) {
                acc[sortKey] = {
                    dateObj, // Guardamos fecha real
                    ingresos: 0,
                    egresos: 0
                }
            }
            if (t.tipo === 'ingreso') acc[sortKey].ingresos += t.monto
            else acc[sortKey].egresos += t.monto
            return acc
        }, {} as Record<string, any>)

        // Generar últimos 6 meses para rellenar huecos (Zero-filling)
        const filledCashFlowData = []
        const today = new Date()

        for (let i = 5; i >= 0; i--) {
            // Calcular el mes correspondiente (hacia atrás desde hoy)
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
            const sortKey = format(d, 'yyyy-MM')
            const displayDate = format(d, 'MMM yyyy', { locale: es })

            if (monthlyData[sortKey]) {
                filledCashFlowData.push({
                    name: displayDate,
                    ingresos: monthlyData[sortKey].ingresos,
                    egresos: monthlyData[sortKey].egresos
                })
            } else {
                filledCashFlowData.push({
                    name: displayDate,
                    ingresos: 0,
                    egresos: 0
                })
            }
        }

        const cashFlowData = filledCashFlowData

        // Group by category for IncomeExpense
        const categoryData = filteredTransactions.reduce((acc, t) => {
            const catName = t.categoria?.nombre || 'Sin Categoría'
            if (!acc[catName]) {
                acc[catName] = { name: catName, value: 0, type: t.tipo }
            }
            acc[catName].value += t.monto
            return acc
        }, {} as Record<string, any>)

        const incomeExpenseData = Object.values(categoryData)
            .sort((a, b) => b.value - a.value)
            .slice(0, 10) // Top 10 categories

        return { cashFlowData, incomeExpenseData }
    }, [filteredTransactions])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const setQuickFilter = (days: number) => {
        const end = new Date()
        const start = subDays(end, days)
        setDateRange({
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd')
        })
    }

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando datos financieros...</div>
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
                            💰 Reportes de Contabilidad
                        </h2>
                        <p className="text-gray-500 text-sm">Análisis financiero de ingresos, egresos y actividades</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={cargarDatos} title="Recargar datos">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" onClick={onBack}>
                        Volver a Reportes
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-700">Filtros de Fecha</h3>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-end">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Fecha Desde</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Fecha Hasta</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500 self-center mr-2">Filtros Rápidos:</span>
                        <button onClick={() => setQuickFilter(7)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors">Últimos 7 días</button>
                        <button onClick={() => setQuickFilter(30)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors">Último mes</button>
                        <button onClick={() => setQuickFilter(90)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors">Últimos 3 meses</button>
                        <button onClick={() => setQuickFilter(365)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors">Último año</button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Ingresos</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.ingresos)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <Minus className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Egresos</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.egresos)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(stats.balance)}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Actividades</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.actividades}</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CashFlowChart data={chartData.cashFlowData} />
                <IncomeExpenseChart data={chartData.incomeExpenseData} />
            </div>
        </div>
    )
}
