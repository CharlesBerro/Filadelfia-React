import React, { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { Layout } from '@/components/layout/Layout'
import { SeguimientoService } from '@/services/seguimiento.service'
import type { GrupoEscalaDetallado, Persona, PersonaEscala } from '@/types'

type Row = PersonaEscala & { persona?: Persona | null; grupo?: GrupoEscalaDetallado | null }

export const SeguimientoReportesPage: React.FC = () => {
  const [grupos, setGrupos] = useState<GrupoEscalaDetallado[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroGrupo, setFiltroGrupo] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'en_curso' | 'finalizado' | 'retirado'>('todos')

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const gruposData = await SeguimientoService.obtenerGruposPorSede()
        setGrupos(gruposData)

        const data = await Promise.all(
          gruposData.map(async (g) => {
            const ins = await SeguimientoService.obtenerSeguimientoPorGrupo(g.id)
            return ins.map((i) => ({ ...i, grupo: g }))
          })
        )
        setRows(data.flat())
      } catch (err: any) {
        setError(err.message || 'Error cargando reportes de seguimiento')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const rowsFiltradas = useMemo(() => {
    return rows.filter((r) => {
      if (filtroGrupo !== 'todos' && r.grupo_id !== filtroGrupo) return false
      if (filtroEstado !== 'todos' && (r.estado || 'pendiente') !== filtroEstado) return false
      return true
    })
  }, [rows, filtroGrupo, filtroEstado])

  const resumenPorFormador = useMemo(() => {
    const map = new Map<string, { formador: string; total: number }>()
    rowsFiltradas.forEach((r) => {
      const formador = r.grupo?.formador
        ? `${r.grupo.formador.nombres} ${r.grupo.formador.primer_apellido}`
        : 'Sin formador'
      const key = r.grupo?.formador_id || 'none'
      const current = map.get(key) || { formador, total: 0 }
      current.total += 1
      map.set(key, current)
    })
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [rowsFiltradas])

  const exportarExcel = () => {
    const data = rowsFiltradas.map((r) => ({
      Grupo: r.grupo?.nombre_grupo || '',
      Escala: r.grupo?.escala?.nombre_escala || '',
      Formador: r.grupo?.formador ? `${r.grupo.formador.nombres} ${r.grupo.formador.primer_apellido}` : '',
      Persona: r.persona ? `${r.persona.nombres} ${r.persona.primer_apellido}` : '',
      Cedula: r.persona?.numero_id || '',
      Estado: r.estado || 'pendiente',
      FechaEstudio: r.fecha_estudio || '',
      FechaFinalizacion: r.fecha_aprobacion_manual || '',
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'Seguimiento')
    XLSX.writeFile(wb, `reporte_seguimiento_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <Layout>
      <div className="min-h-full p-3 sm:p-6 lg:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes de Seguimiento</h1>
              <p className="text-sm text-gray-600">Grupos por formador, personas por grupo y estados</p>
            </div>
            <button
              onClick={exportarExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Exportar Excel
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
            >
              <option value="todos">Todos los grupos</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre_grupo}
                </option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_curso">En curso</option>
              <option value="finalizado">Finalizado</option>
              <option value="retirado">Retirado</option>
            </select>
          </div>

          {loading && <p className="text-sm text-gray-600">Cargando reportes...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                <h2 className="font-semibold text-gray-900 mb-3">Cantidad por Formador</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[420px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Formador</th>
                        <th className="px-3 py-2 text-left">Cantidad Personas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenPorFormador.map((r, idx) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-3 py-2">{r.formador}</td>
                          <td className="px-3 py-2">{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                <h2 className="font-semibold text-gray-900 mb-3">Detalle por Grupo</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[860px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Grupo</th>
                        <th className="px-3 py-2 text-left">Escala</th>
                        <th className="px-3 py-2 text-left">Formador</th>
                        <th className="px-3 py-2 text-left">Persona</th>
                        <th className="px-3 py-2 text-left">Estado</th>
                        <th className="px-3 py-2 text-left">Fecha Estudio</th>
                        <th className="px-3 py-2 text-left">Finalización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowsFiltradas.map((r) => (
                        <tr key={r.id} className="border-t border-gray-100">
                          <td className="px-3 py-2">{r.grupo?.nombre_grupo || '-'}</td>
                          <td className="px-3 py-2">{r.grupo?.escala?.nombre_escala || '-'}</td>
                          <td className="px-3 py-2">
                            {r.grupo?.formador ? `${r.grupo.formador.nombres} ${r.grupo.formador.primer_apellido}` : '-'}
                          </td>
                          <td className="px-3 py-2">
                            {r.persona ? `${r.persona.nombres} ${r.persona.primer_apellido}` : '-'}
                          </td>
                          <td className="px-3 py-2">{r.estado || 'pendiente'}</td>
                          <td className="px-3 py-2">{r.fecha_estudio || '-'}</td>
                          <td className="px-3 py-2">{r.fecha_aprobacion_manual || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
