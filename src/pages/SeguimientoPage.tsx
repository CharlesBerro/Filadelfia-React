import React, { useEffect, useMemo, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { useAuthStore } from '@/stores/auth.store'
import { SeguimientoService } from '@/services/seguimiento.service'
import type { EscalaCrecimiento, GrupoEscalaDetallado, Persona, PersonaEscala, User } from '@/types'

type EstadoSeguimiento = 'pendiente' | 'en_curso' | 'aprobado' | 'retirado'

export const SeguimientoPage: React.FC = () => {
  const { user } = useAuthStore()
  const canManageGroups = user?.role === 'admin' || user?.role === 'lider'

  const [grupos, setGrupos] = useState<GrupoEscalaDetallado[]>([])
  const [escalas, setEscalas] = useState<EscalaCrecimiento[]>([])
  const [formadores, setFormadores] = useState<User[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('')
  const [seguimientoGrupo, setSeguimientoGrupo] = useState<Array<PersonaEscala & { persona?: Persona | null }>>([])
  const [loading, setLoading] = useState(true)
  const [loadingGrupo, setLoadingGrupo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formGrupo, setFormGrupo] = useState({
    nombre_grupo: '',
    escala_id: '',
    formador_id: '',
    fecha_inicio: '',
    fecha_fin_manual: '',
  })

  const [formInscripcion, setFormInscripcion] = useState({
    persona_id: '',
    fecha_estudio: '',
    estado: 'pendiente' as EstadoSeguimiento,
  })

  const grupoActivo = useMemo(
    () => grupos.find((g) => g.id === grupoSeleccionado) || null,
    [grupos, grupoSeleccionado]
  )

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const [gruposData, escalasData, formadoresData, personasData] = await Promise.all([
          SeguimientoService.obtenerGruposPorSede(),
          SeguimientoService.obtenerEscalasActivas(),
          SeguimientoService.obtenerFormadoresPorSede(),
          SeguimientoService.obtenerPersonasDisponiblesPorSede(),
        ])

        setGrupos(gruposData)
        setEscalas(escalasData)
        setFormadores(formadoresData)
        setPersonas(personasData)

        if (gruposData.length > 0) {
          setGrupoSeleccionado(gruposData[0].id)
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar seguimiento')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  useEffect(() => {
    const cargarSeguimiento = async () => {
      if (!grupoSeleccionado) {
        setSeguimientoGrupo([])
        return
      }
      setLoadingGrupo(true)
      try {
        const data = await SeguimientoService.obtenerSeguimientoPorGrupo(grupoSeleccionado)
        setSeguimientoGrupo(data)
      } catch (err: any) {
        setError(err.message || 'Error al cargar seguimiento del grupo')
      } finally {
        setLoadingGrupo(false)
      }
    }
    cargarSeguimiento()
  }, [grupoSeleccionado])

  const crearGrupo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManageGroups) return

    if (!formGrupo.nombre_grupo || !formGrupo.escala_id || !formGrupo.formador_id || !formGrupo.fecha_inicio) {
      alert('Completa los campos requeridos del grupo')
      return
    }

    setSaving(true)
    try {
      const sedeId = user?.sede_id || ''
      const creado = await SeguimientoService.crearGrupo({
        sede_id: sedeId,
        escala_id: formGrupo.escala_id,
        formador_id: formGrupo.formador_id,
        nombre_grupo: formGrupo.nombre_grupo,
        fecha_inicio: formGrupo.fecha_inicio,
        fecha_fin_manual: formGrupo.fecha_fin_manual || null,
        estado: 'activo',
      })
      const nuevos = await SeguimientoService.obtenerGruposPorSede()
      setGrupos(nuevos)
      setGrupoSeleccionado(creado.id)
      setFormGrupo({ nombre_grupo: '', escala_id: '', formador_id: '', fecha_inicio: '', fecha_fin_manual: '' })
    } catch (err: any) {
      alert(err.message || 'No se pudo crear el grupo')
    } finally {
      setSaving(false)
    }
  }

  const inscribirPersona = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!grupoActivo) return
    if (!formInscripcion.persona_id) {
      alert('Selecciona una persona')
      return
    }

    setSaving(true)
    try {
      await SeguimientoService.inscribirPersona({
        persona_id: formInscripcion.persona_id,
        grupo_id: grupoActivo.id,
        escala_id: grupoActivo.escala_id,
        sede_id: grupoActivo.sede_id,
        estado: formInscripcion.estado,
        fecha_estudio: formInscripcion.fecha_estudio || undefined,
      })

      const data = await SeguimientoService.obtenerSeguimientoPorGrupo(grupoActivo.id)
      setSeguimientoGrupo(data)
      setFormInscripcion({ persona_id: '', fecha_estudio: '', estado: 'pendiente' })
    } catch (err: any) {
      alert(err.message || 'No se pudo inscribir la persona')
    } finally {
      setSaving(false)
    }
  }

  const actualizarEstado = async (itemId: string, estado: EstadoSeguimiento, fechaEstudio?: string) => {
    setSaving(true)
    try {
      await SeguimientoService.actualizarEstadoSeguimiento(itemId, estado, {
        fechaEstudio,
      })
      if (grupoSeleccionado) {
        const data = await SeguimientoService.obtenerSeguimientoPorGrupo(grupoSeleccionado)
        setSeguimientoGrupo(data)
      }
    } catch (err: any) {
      alert(err.message || 'No se pudo actualizar el estado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seguimiento</h1>
            <p className="text-gray-600">Control de grupos, formadores y avance por escalas</p>
          </div>

          {loading && <p className="text-sm text-gray-600">Cargando módulo...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && (
            <>
              {canManageGroups && (
                <form onSubmit={crearGrupo} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">Crear Grupo</h2>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Nombre del grupo"
                      value={formGrupo.nombre_grupo}
                      onChange={(e) => setFormGrupo((p) => ({ ...p, nombre_grupo: e.target.value }))}
                    />
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={formGrupo.escala_id}
                      onChange={(e) => setFormGrupo((p) => ({ ...p, escala_id: e.target.value }))}
                    >
                      <option value="">Escala</option>
                      {escalas.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.orden}. {e.nombre}
                        </option>
                      ))}
                    </select>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={formGrupo.formador_id}
                      onChange={(e) => setFormGrupo((p) => ({ ...p, formador_id: e.target.value }))}
                    >
                      <option value="">Formador</option>
                      {formadores.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.full_name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={formGrupo.fecha_inicio}
                      onChange={(e) => setFormGrupo((p) => ({ ...p, fecha_inicio: e.target.value }))}
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-green-600 text-white rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      Crear
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">Grupos</h2>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={grupoSeleccionado}
                    onChange={(e) => setGrupoSeleccionado(e.target.value)}
                  >
                    <option value="">Selecciona grupo</option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre_grupo} - {g.escala?.nombre_escala || 'Escala'}
                      </option>
                    ))}
                  </select>
                </div>

                {grupoActivo && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500">Escala</p>
                        <p className="font-medium">{grupoActivo.escala?.nombre_escala || grupoActivo.escala_id}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500">Formador</p>
                        <p className="font-medium">{grupoActivo.formador?.full_name || grupoActivo.formador_id}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500">Inicio</p>
                        <p className="font-medium">{grupoActivo.fecha_inicio}</p>
                      </div>
                    </div>

                    <form onSubmit={inscribirPersona} className="border-t border-gray-100 pt-4">
                      <h3 className="font-medium text-gray-900 mb-3">Inscribir Persona</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          value={formInscripcion.persona_id}
                          onChange={(e) => setFormInscripcion((p) => ({ ...p, persona_id: e.target.value }))}
                        >
                          <option value="">Persona</option>
                          {personas.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombres} {p.primer_apellido}
                            </option>
                          ))}
                        </select>
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          value={formInscripcion.estado}
                          onChange={(e) => setFormInscripcion((p) => ({ ...p, estado: e.target.value as EstadoSeguimiento }))}
                        >
                          <option value="pendiente">pendiente</option>
                          <option value="en_curso">en_curso</option>
                          <option value="aprobado">aprobado</option>
                          <option value="retirado">retirado</option>
                        </select>
                        <input
                          type="date"
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          value={formInscripcion.fecha_estudio}
                          onChange={(e) => setFormInscripcion((p) => ({ ...p, fecha_estudio: e.target.value }))}
                        />
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium"
                        >
                          Inscribir
                        </button>
                      </div>
                    </form>

                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="font-medium text-gray-900 mb-3">Personas del Grupo</h3>
                      {loadingGrupo ? (
                        <p className="text-sm text-gray-600">Cargando inscripciones...</p>
                      ) : seguimientoGrupo.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay personas inscritas.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left">Persona</th>
                                <th className="px-3 py-2 text-left">Estado</th>
                                <th className="px-3 py-2 text-left">Fecha estudio</th>
                                <th className="px-3 py-2 text-left">Fecha aprobación</th>
                                <th className="px-3 py-2 text-left">Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {seguimientoGrupo.map((item) => (
                                <tr key={item.id} className="border-t border-gray-100">
                                  <td className="px-3 py-2">
                                    {item.persona?.nombres} {item.persona?.primer_apellido}
                                  </td>
                                  <td className="px-3 py-2">{item.estado || 'pendiente'}</td>
                                  <td className="px-3 py-2">{item.fecha_estudio || '-'}</td>
                                  <td className="px-3 py-2">{item.fecha_aprobacion_manual || '-'}</td>
                                  <td className="px-3 py-2">
                                    <select
                                      className="border border-gray-300 rounded px-2 py-1"
                                      value={item.estado || 'pendiente'}
                                      onChange={(e) => {
                                        const nuevoEstado = e.target.value as EstadoSeguimiento
                                        const fecha = window.prompt('Fecha del estudio (YYYY-MM-DD), opcional:', item.fecha_estudio || '')
                                        actualizarEstado(item.id, nuevoEstado, fecha || undefined)
                                      }}
                                    >
                                      <option value="pendiente">pendiente</option>
                                      <option value="en_curso">en_curso</option>
                                      <option value="aprobado">aprobado</option>
                                      <option value="retirado">retirado</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
