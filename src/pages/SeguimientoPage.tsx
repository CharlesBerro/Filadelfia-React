import React, { useEffect, useMemo, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { useAuthStore } from '@/stores/auth.store'
import { SeguimientoService } from '@/services/seguimiento.service'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { EscalaCrecimiento, GrupoEscalaDetallado, Persona, PersonaEscala } from '@/types'

type EstadoSeguimiento = 'pendiente' | 'en_curso' | 'finalizado' | 'retirado'

export const SeguimientoPage: React.FC = () => {
  const { user } = useAuthStore()
  const canManageGroups = user?.role === 'admin' || user?.role === 'lider' || user?.role === 'organizador'

  const [grupos, setGrupos] = useState<GrupoEscalaDetallado[]>([])
  const [escalas, setEscalas] = useState<EscalaCrecimiento[]>([])
  const [formadores, setFormadores] = useState<Persona[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('')
  const [seguimientoGrupo, setSeguimientoGrupo] = useState<Array<PersonaEscala & { persona?: Persona | null }>>([])
  const [loading, setLoading] = useState(true)
  const [loadingGrupo, setLoadingGrupo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<'todos' | EstadoSeguimiento>('todos')
  const [estadoModalOpen, setEstadoModalOpen] = useState(false)
  const [estadoTarget, setEstadoTarget] = useState<(PersonaEscala & { persona?: Persona | null }) | null>(null)
  const [estadoDraft, setEstadoDraft] = useState<EstadoSeguimiento>('pendiente')
  const [fechaEstudioDraft, setFechaEstudioDraft] = useState('')

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
  const [personaSearch, setPersonaSearch] = useState('')

  const grupoActivo = useMemo(
    () => grupos.find((g) => g.id === grupoSeleccionado) || null,
    [grupos, grupoSeleccionado]
  )

  const personasFiltradas = useMemo(() => {
    const term = personaSearch.trim().toLowerCase()
    if (!term) return personas
    return personas.filter((p) => {
      const nombre = `${p.nombres || ''} ${p.primer_apellido || ''} ${p.segundo_apellido || ''}`.toLowerCase()
      const cedula = (p.numero_id || '').toLowerCase()
      const telefono = (p.telefono || '').toLowerCase()
      return nombre.includes(term) || cedula.includes(term) || telefono.includes(term)
    })
  }, [personas, personaSearch])

  const inscritosFiltrados = useMemo(() => {
    if (filtroEstado === 'todos') return seguimientoGrupo
    return seguimientoGrupo.filter((i) => (i.estado || 'pendiente') === filtroEstado)
  }, [seguimientoGrupo, filtroEstado])

  const resumenEstados = useMemo(() => {
    const base = { pendiente: 0, en_curso: 0, finalizado: 0, retirado: 0 }
    seguimientoGrupo.forEach((i) => {
      const key = (i.estado || 'pendiente') as EstadoSeguimiento
      base[key] += 1
    })
    return base
  }, [seguimientoGrupo])

  useEffect(() => {
    if (personasFiltradas.length === 1) {
      setFormInscripcion((prev) => ({ ...prev, persona_id: personasFiltradas[0].id }))
      return
    }

    if (!personasFiltradas.some((p) => p.id === formInscripcion.persona_id)) {
      setFormInscripcion((prev) => ({ ...prev, persona_id: '' }))
    }
  }, [personasFiltradas, formInscripcion.persona_id])

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
      setPersonaSearch('')
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.toLowerCase().includes('duplicate key value')) {
        alert('Esta persona ya está inscrita en este grupo.')
      } else {
        alert(msg || 'No se pudo inscribir la persona')
      }
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

  const abrirModalEstado = (item: PersonaEscala & { persona?: Persona | null }) => {
    setEstadoTarget(item)
    setEstadoDraft((item.estado || 'pendiente') as EstadoSeguimiento)
    setFechaEstudioDraft(item.fecha_estudio || '')
    setEstadoModalOpen(true)
  }

  const guardarEstadoModal = async () => {
    if (!estadoTarget) return
    await actualizarEstado(estadoTarget.id, estadoDraft, fechaEstudioDraft || undefined)
    setEstadoModalOpen(false)
    setEstadoTarget(null)
  }

  const eliminarInscripcion = async (id: string) => {
    if (!canManageGroups) return
    if (!window.confirm('¿Eliminar esta inscripción del grupo?')) return
    setSaving(true)
    try {
      await SeguimientoService.eliminarInscripcion(id)
      if (grupoSeleccionado) {
        const data = await SeguimientoService.obtenerSeguimientoPorGrupo(grupoSeleccionado)
        setSeguimientoGrupo(data)
      }
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar la inscripción')
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
            <p className="text-gray-600">Control de grupos, tutores formadores y avance por escalas</p>
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
                      <option value="">Formador (persona)</option>
                      {formadores.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nombres} {f.primer_apellido}
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

                {grupos.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    {user?.role === 'formador'
                      ? 'No tienes grupos asignados todavía. Pide al líder o administrador que te asigne un grupo.'
                      : 'No hay grupos registrados para tu sede todavía.'}
                  </div>
                )}

                {grupoActivo && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <p className="text-amber-700">Pendiente</p>
                        <p className="text-xl font-bold text-amber-900">{resumenEstados.pendiente}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <p className="text-blue-700">En curso</p>
                        <p className="text-xl font-bold text-blue-900">{resumenEstados.en_curso}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                        <p className="text-emerald-700">Finalizado</p>
                        <p className="text-xl font-bold text-emerald-900">{resumenEstados.finalizado}</p>
                      </div>
                      <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                        <p className="text-rose-700">Retirado</p>
                        <p className="text-xl font-bold text-rose-900">{resumenEstados.retirado}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500">Escala</p>
                        <p className="font-medium">{grupoActivo.escala?.nombre_escala || grupoActivo.escala_id}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500">Formador</p>
                        <p className="font-medium">
                          {grupoActivo.formador
                            ? `${grupoActivo.formador.nombres} ${grupoActivo.formador.primer_apellido}`
                            : grupoActivo.formador_id}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500">Inicio</p>
                        <p className="font-medium">{grupoActivo.fecha_inicio}</p>
                      </div>
                    </div>

                    <form onSubmit={inscribirPersona} className="border-t border-gray-100 pt-4">
                      <h3 className="font-medium text-gray-900 mb-3">Inscribir Persona</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="relative">
                          <input
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                            placeholder="Buscar por nombre, cédula o teléfono"
                            value={personaSearch}
                            onChange={(e) => setPersonaSearch(e.target.value)}
                          />
                          {personaSearch.trim() && personasFiltradas.length > 0 && (
                            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                              {personasFiltradas.slice(0, 12).map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setFormInscripcion((prev) => ({ ...prev, persona_id: p.id }))
                                    setPersonaSearch(`${p.nombres} ${p.primer_apellido}`)
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                  {p.nombres} {p.primer_apellido} ({p.numero_id})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          value={formInscripcion.persona_id}
                          onChange={(e) => setFormInscripcion((p) => ({ ...p, persona_id: e.target.value }))}
                        >
                          <option value="">Persona</option>
                          {personasFiltradas.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombres} {p.primer_apellido} ({p.numero_id})
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
                          <option value="finalizado">finalizado</option>
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
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h3 className="font-medium text-gray-900">Personas del Grupo</h3>
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          value={filtroEstado}
                          onChange={(e) => setFiltroEstado(e.target.value as any)}
                        >
                          <option value="todos">Todos</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="en_curso">En curso</option>
                          <option value="finalizado">Finalizado</option>
                          <option value="retirado">Retirado</option>
                        </select>
                      </div>
                      {loadingGrupo ? (
                        <p className="text-sm text-gray-600">Cargando inscripciones...</p>
                      ) : inscritosFiltrados.length === 0 ? (
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
                                {canManageGroups && <th className="px-3 py-2 text-left">Eliminar</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {inscritosFiltrados.map((item) => (
                                <tr key={item.id} className="border-t border-gray-100">
                                  <td className="px-3 py-2">
                                    {item.persona?.nombres} {item.persona?.primer_apellido}
                                  </td>
                                  <td className="px-3 py-2">{item.estado || 'pendiente'}</td>
                                  <td className="px-3 py-2">{item.fecha_estudio || '-'}</td>
                                  <td className="px-3 py-2">{item.fecha_aprobacion_manual || '-'}</td>
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => abrirModalEstado(item)}
                                      className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                    >
                                      Actualizar
                                    </button>
                                  </td>
                                  {canManageGroups && (
                                    <td className="px-3 py-2">
                                      <button
                                        type="button"
                                        onClick={() => eliminarInscripcion(item.id)}
                                        className="text-red-600 hover:text-red-700 text-xs font-medium"
                                      >
                                        Quitar
                                      </button>
                                    </td>
                                  )}
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
      <Modal
        isOpen={estadoModalOpen}
        onClose={() => setEstadoModalOpen(false)}
        title="Actualizar estado de seguimiento"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {estadoTarget?.persona?.nombres} {estadoTarget?.persona?.primer_apellido}
          </p>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={estadoDraft}
            onChange={(e) => setEstadoDraft(e.target.value as EstadoSeguimiento)}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_curso">En curso</option>
            <option value="finalizado">Finalizado</option>
            <option value="retirado">Retirado</option>
          </select>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={fechaEstudioDraft}
            onChange={(e) => setFechaEstudioDraft(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEstadoModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={guardarEstadoModal} disabled={saving}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
