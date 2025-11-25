import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'

interface CashFlowData {
    name: string
    ingresos: number
    egresos: number
}

interface CashFlowChartProps {
    data: CashFlowData[]
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
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
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Flujo de Caja Mensual</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                        formatter={(value: number) => [formatCurrency(value), '']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f3f4f6' }}
                    />
                    <Legend iconType="circle" />
                    <Bar
                        dataKey="ingresos"
                        name="Ingresos"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                    <Bar
                        dataKey="egresos"
                        name="Egresos"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
