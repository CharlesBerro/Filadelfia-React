import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

interface IncomeExpenseData {
    name: string
    value: number
    type: 'ingreso' | 'egreso'
}

interface IncomeExpenseChartProps {
    data: IncomeExpenseData[]
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    return (
        <div className="w-full h-[400px] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Ingresos vs Egresos por Categoría</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={10}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Monto']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.type === 'ingreso' ? '#22c55e' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
