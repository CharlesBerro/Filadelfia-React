import React, { useMemo, useState, useEffect } from 'react'
import { ArrowLeft, Users, Heart, UserCheck, Baby, TrendingUp, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePersonasStore } from '@/stores/personas.store'
import { SedesService } from '@/services/sedes.service'
import type { Sede } from '@/types'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts'

interface PeopleReportsProps {
    onBack: () => void
}

export const PeopleReports: React.FC<PeopleReportsProps> = ({ onBack }) => {
    const { personas } = usePersonasStore()
    const [sedes, setSedes] = useState<Sede[]>([])

    useEffect(() => {
        const cargarSedes = async () => {
            try {
                const data = await SedesService.obtenerTodas()
                setSedes(data)
            } catch (error) {
                console.error('Error cargando sedes:', error)
            }
        }
        cargarSedes()
    }, [])

    const stats = useMemo(() => {
        const total = personas.length
        const bautizados = personas.filter(p => p.bautizado).length
        const hombres = personas.filter(p => p.genero?.toLowerCase() === 'masculino' || p.genero === 'M').length
        const mujeres = personas.filter(p => p.genero?.toLowerCase() === 'femenino' || p.genero === 'F').length

        // Marital Status
        const civilStatus = personas.reduce((acc, p) => {
            const status = p.estado_civil || 'No especificado'
            acc[status] = (acc[status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        // Sede Distribution
        const sedeDistribution = personas.reduce((acc, p) => {
            const sedeId = p.sede_id
            if (sedeId) {
                acc[sedeId] = (acc[sedeId] || 0) + 1
            }
            return acc
        }, {} as Record<string, number>)

        return { total, bautizados, hombres, mujeres, civilStatus, sedeDistribution }
    }, [personas])

    const genderData = [
        { name: 'Hombres', value: stats.hombres },
        { name: 'Mujeres', value: stats.mujeres },
    ]

    const civilStatusData = Object.entries(stats.civilStatus)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    const sedeData = Object.entries(stats.sedeDistribution)
        .map(([sedeId, value]) => {
            const sede = sedes.find(s => s.id === sedeId)
            return {
                name: sede?.nombre_sede || 'Sin sede',
                value
            }
        })
        .sort((a, b) => b.value - a.value)

    const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-7 h-7 text-blue-600" />
                            Reportes de Personas
                        </h2>
                        <p className="text-gray-500 text-sm">Análisis demográfico y de crecimiento</p>
                    </div>
                </div>
                <Button variant="secondary" onClick={onBack}>
                    Volver a Reportes
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Total Miembros</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        <div className="mt-2 flex items-center text-xs text-green-600 font-medium">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span>Activos</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <UserCheck className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Bautizados</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.bautizados}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {stats.total > 0 ? ((stats.bautizados / stats.total) * 100).toFixed(1) : 0}% del total
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-pink-100 rounded-lg">
                                <Heart className="w-5 h-5 text-pink-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Mujeres</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.mujeres}</p>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-pink-500 h-full rounded-full"
                                style={{ width: `${stats.total > 0 ? (stats.mujeres / stats.total) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Baby className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Hombres</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.hombres}</p>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full rounded-full"
                                style={{ width: `${stats.total > 0 ? (stats.hombres / stats.total) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gender Distribution - Donut Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Distribución por Género</h3>
                    <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#3b82f6" /> {/* Hombres - Blue */}
                                    <Cell fill="#ec4899" /> {/* Mujeres - Pink */}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                    <tspan x="50%" dy="-10" fontSize="24" fontWeight="bold" fill="#1f2937">
                                        {stats.total}
                                    </tspan>
                                    <tspan x="50%" dy="24" fontSize="14" fill="#6b7280">
                                        Total
                                    </tspan>
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Civil Status - Horizontal Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Estado Civil</h3>
                    <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={civilStatusData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                                    {civilStatusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sede Distribution - Vertical Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Building2 className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-800">Personas por Sede</h3>
                    </div>
                    <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={sedeData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                    {sedeData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
