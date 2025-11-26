import React from 'react'
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Area,
    AreaChart,
    Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface PersonasChartsProps {
    growthData: any[]
    genderData: any[]
    ageData: any[]
    bautizadosData: any[]
    baptismByAgeData?: any[]
    isLoading: boolean
}

const GENDER_COLORS = ['#3B82F6', '#EC4899'] // Azul, Rosa
const BAPTISM_COLORS = ['#10B981', '#6B7280'] // Verde, Gris

export const PersonasCharts: React.FC<PersonasChartsProps> = ({
    growthData,
    genderData,
    ageData,
    bautizadosData,
    baptismByAgeData,
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
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={(entry) => `${entry.name}: ${entry.value}`}
                                        >
                                            {genderData.filter(d => d.value > 0).map((_entry, index) => (
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

                {/* Distribución por Edad */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución por Edad</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {ageData && ageData.length > 0 && ageData.some(d => d.value > 0) ? (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={ageData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="name" width={80} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Personas" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center">
                                <p className="text-gray-500 text-center">
                                    No hay datos de edad disponibles
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bautizados vs No Bautizados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Estado de Bautismo</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {bautizadosData && bautizadosData.length > 0 && bautizadosData.some(d => d.value > 0) ? (
                            <div className="h-[300px] w-full flex justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bautizadosData.filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={(entry) => `${entry.name}: ${entry.value}`}
                                        >
                                            {bautizadosData.filter(d => d.value > 0).map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={BAPTISM_COLORS[index % BAPTISM_COLORS.length]} />
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
                                    No hay datos de bautismo disponibles
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bautizados por Rango de Edad (Nuevo) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bautismo por Edad</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {baptismByAgeData && baptismByAgeData.length > 0 ? (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={baptismByAgeData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="bautizados" stackId="a" fill="#10B981" name="Bautizados" />
                                        <Bar dataKey="noBautizados" stackId="a" fill="#EF4444" name="No Bautizados" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center">
                                <p className="text-gray-500 text-center">
                                    No hay datos disponibles
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
