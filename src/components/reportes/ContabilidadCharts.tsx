import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface CashFlowData {
    month: string
    ingresos: number
    egresos: number
}

interface CategoryData {
    name: string
    value: number
}

interface ContabilidadChartsProps {
    cashFlowData: CashFlowData[]
    incomeByCategory: CategoryData[]
    expensesByCategory: CategoryData[]
    isLoading: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']
const EXPENSE_COLORS = ['#FF8042', '#FFBB28', '#FF6B6B', '#D64545', '#8884d8']

export const ContabilidadCharts: React.FC<ContabilidadChartsProps> = ({
    cashFlowData,
    incomeByCategory,
    expensesByCategory,
    isLoading,
}) => {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando gráficos...</div>
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)

    return (
        <div className="space-y-8">
            {/* Flujo de Caja */}
            <Card>
                <CardHeader>
                    <CardTitle>Flujo de Caja Mensual</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={cashFlowData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    labelStyle={{ color: '#333' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="ingresos"
                                    name="Ingresos"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10B981', r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="egresos"
                                    name="Egresos"
                                    stroke="#EF4444"
                                    strokeWidth={3}
                                    dot={{ fill: '#EF4444', r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ingresos por Categoría */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ingresos por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={incomeByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {incomeByCategory.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Gastos por Categoría */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gastos por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expensesByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {expensesByCategory.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
