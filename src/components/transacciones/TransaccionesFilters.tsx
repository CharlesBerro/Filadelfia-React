import React from 'react'
import { X } from 'lucide-react'
import { useTransaccionesStore } from '@/stores/transacciones.store'
import { Button } from '@/components/ui/Button'
import type { TransaccionesFilters } from '@/types/transacciones'

export const TransaccionesFiltersComponent: React.FC = () => {
    const { filters, setFilters, clearFilters } = useTransaccionesStore()

    const handleFilterChange = (key: keyof TransaccionesFilters, value: string) => {
        setFilters({
            ...filters,
            [key]: value || undefined,
        })
    }

    const aplicarFiltroRapido = (tipo: 'hoy' | 'semana' | 'mes' | 'todo') => {
        const hoy = new Date()
        let fechaInicio: string | undefined
        let fechaFin: string | undefined

        switch (tipo) {
            case 'hoy':
                fechaInicio = hoy.toISOString().split('T')[0]
                fechaFin = hoy.toISOString().split('T')[0]
                break
            case 'semana':
                const inicioSemana = new Date(hoy)
                inicioSemana.setDate(hoy.getDate() - hoy.getDay())
                fechaInicio = inicioSemana.toISOString().split('T')[0]
                fechaFin = hoy.toISOString().split('T')[0]
                break
            case 'mes':
                const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
                fechaInicio = inicioMes.toISOString().split('T')[0]
                fechaFin = hoy.toISOString().split('T')[0]
                break
            case 'todo':
                fechaInicio = undefined
                fechaFin = undefined
                break
        }

        setFilters({
            ...filters,
            fechaInicio,
            fechaFin,
        })
    }

    const tieneFiltros = Object.keys(filters).length > 0

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filtrar Transacciones</h3>
                {tieneFiltros && (
                    <Button onClick={clearFilters} variant="secondary">
                        <X className="w-4 h-4 mr-2" />
                        Limpiar
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {/* Filtros Rápidos */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filtros Rápidos
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => aplicarFiltroRapido('hoy')}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Hoy
                        </button>
                        <button
                            onClick={() => aplicarFiltroRapido('semana')}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Esta Semana
                        </button>
                        <button
                            onClick={() => aplicarFiltroRapido('mes')}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Este Mes
                        </button>
                        <button
                            onClick={() => aplicarFiltroRapido('todo')}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Todo
                        </button>
                    </div>
                </div>

                {/* Rango de Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            id="fechaInicio"
                            value={filters.fechaInicio || ''}
                            onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            id="fechaFin"
                            value={filters.fechaFin || ''}
                            onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Tipo y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo
                        </label>
                        <select
                            id="tipo"
                            value={filters.tipo || ''}
                            onChange={(e) => handleFilterChange('tipo', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Todos</option>
                            <option value="ingreso">Ingresos</option>
                            <option value="egreso">Egresos</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                        </label>
                        <select
                            id="estado"
                            value={filters.estado || ''}
                            onChange={(e) => handleFilterChange('estado', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Activas</option>
                            <option value="activa">Solo Activas</option>
                            <option value="anulada">Solo Anuladas</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}
