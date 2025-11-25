import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface GrowthData {
    month: string
    personas: number
    total: number
}

interface DemographicsData {
    name: string
    value: number
}

interface PersonasChartsProps {
    growthData: GrowthData[]
    genderData: DemographicsData[]
    ageData: DemographicsData[]
    isLoading: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
const GENDER_COLORS = ['#3B82F6', '#EC4899', '#9CA3AF'] // Azul, Rosa, Gris

export const PersonasCharts: React.FC<PersonasChartsProps> = ({
    growthData,
    genderData,
    ageData,
    isLoading,
}) => {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando gráficos...</div>
    }

    return (
        <div className="space-y-8">
            {/* Crecimiento de la Comunidad */}
            <Card>
                <CardHeader>
                    <CardTitle>Crecimiento de la Comunidad</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {growthData && growthData.length > 0 && growthData.some(d => d.total > 0) ? (
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={growthData}
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#10B981"
                                        fill="#D1FAE5"
                                        name="Total Personas"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[400px] flex items-center justify-center">
                            <p className="text-gray-500 text-center">
                                No hay datos suficientes para mostrar el gráfico de crecimiento
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distribución por Género */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución por Género</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {genderData && genderData.some(d => d.value > 0) ? (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={genderData.filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {genderData.filter(d => d.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center">
                                <p className="text-gray-500 text-center">
                                    No hay datos de género disponibles
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Distribución por Edad (Ejemplo) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rangos de Edad</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {ageData && ageData.some(d => d.value > 0) ? (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={ageData.filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {ageData.filter(d => d.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center">
                                <p className="text-gray-500 text-center">
                                    No hay datos de edad disponibles.<br />
                                    <span className="text-sm">Registra fechas de nacimiento para ver este gráfico.</span>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
