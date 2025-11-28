import React from 'react'
import {
    LineChart,
    Line,
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
        <div className="w-full h-[400px] bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Flujo de Caja Mensual</h3>
            <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 10,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0" />
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
                            tickFormatter={(value) => `$${value / 1000000}M`}
                        />
                        <Tooltip
                            formatter={(value: number) => [formatCurrency(value), '']}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5 5' }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ paddingBottom: '20px' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="ingresos"
                            name="Ingresos"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{ r: 5, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7, strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                        <Line
                            type="monotone"
                            dataKey="egresos"
                            name="Egresos"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7, strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
