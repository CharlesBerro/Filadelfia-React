// src/components/personas/PersonasTable.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PersonasService } from '@/services/personas.service'
import { MinisteriosService } from '@/services/ministerios.service'
import { EscalasService } from '@/services/escalas_services'
import { SedesService } from '@/services/sedes.service'
import { usePersonasStore } from '@/stores/personas.store'
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Search, X, AlertTriangle } from 'lucide-react'
import type { Persona, Ministerio, EscalaCrecimiento, Sede } from '@/types'

/**
 * Tabla de Personas con:
 * ✅ Paginación
 * ✅ Filtros de búsqueda
 * ✅ Columnas agrupadas
 * ✅ Ministerios y Escalas
 * ✅ Acciones (Ver, Editar, Eliminar)
 */

export const PersonasTable: React.FC = () => {
  const navigate = useNavigate()
  const { personas, loading, setPersonas, setLoading, setError, removePersona } =
    usePersonasStore()

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // ESTADO eliminación (modal + loading + mensaje)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Persona | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null)

  // FILTROS
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estadoCivil: '',
    bautizado: '',
    sede: '',
  })

  // SEDES
  const [sedes, setSedes] = useState<Sede[]>([])

  // MINISTERIOS Y ESCALAS por persona (cache)
  const [ministeriosPorPersona, setMinisteriosPorPersona] = useState<
    Record<string, Ministerio[]>
  >({})
  const [escalasPorPersona, setEscalasPorPersona] = useState<
    Record<string, EscalaCrecimiento[]>
  >({})

  // Cargar personas al montar
  useEffect(() => {
    cargarPersonas()
    cargarSedes()
  }, [])

  const cargarSedes = async () => {
    try {
      const data = await SedesService.obtenerTodas()
      setSedes(data)
    } catch (error) {
      console.error('Error cargando sedes:', error)
    }
  }

  const cargarPersonas = async () => {
    setLoading(true)
    setError(null)
    try {
      const datos = await PersonasService.obtenerMias()
      setPersonas(datos)

      // Cargar ministerios y escalas de cada persona
      await cargarMinisteriosYEscalas(datos)
    } catch (error: any) {
      console.error('Error:', error.message)
      setError(error.message || 'Error cargando personas')
    } finally {
      setLoading(false)
    }
  }

  // Cargar ministerios y escalas de todas las personas
  const cargarMinisteriosYEscalas = async (personas: Persona[]) => {
    const ministeriosCache: Record<string, Ministerio[]> = {}
    const escalasCache: Record<string, EscalaCrecimiento[]> = {}

    await Promise.all(
      personas.map(async (persona) => {
        try {
          const [ministerios, escalas] = await Promise.all([
            MinisteriosService.obtenerPorPersona(persona.id),
            EscalasService.obtenerPorPersona(persona.id),
          ])

          ministeriosCache[persona.id] = ministerios
          escalasCache[persona.id] = escalas
        } catch (error) {
          console.error(`Error cargando datos de ${persona.id}:`, error)
        }
      })
    )

    setMinisteriosPorPersona(ministeriosCache)
    setEscalasPorPersona(escalasCache)
  }

  // FILTRAR personas
  const personasFiltradas = personas.filter((persona) => {
    // Búsqueda por nombre, apellido o cédula
    const busqueda = filtros.busqueda.toLowerCase()
    const coincideBusqueda =
      persona.nombres.toLowerCase().includes(busqueda) ||
      persona.primer_apellido.toLowerCase().includes(busqueda) ||
      persona.numero_id.includes(busqueda)

    // Filtro por estado civil
    const coincideEstadoCivil =
      !filtros.estadoCivil || persona.estado_civil === filtros.estadoCivil

    // Filtro por bautizado
    const coincideBautizado =
      !filtros.bautizado ||
      (filtros.bautizado === 'si' && persona.bautizado) ||
      (filtros.bautizado === 'no' && !persona.bautizado)

    // Filtro por sede
    const nombreSede = Array.isArray(persona.sede)
      ? (persona.sede[0] as any)?.nombre_sede
      : persona.sede?.nombre_sede
    const coincideSede = !filtros.sede || nombreSede === filtros.sede

    return (
      coincideBusqueda &&
      coincideEstadoCivil &&
      coincideBautizado &&
      coincideSede
    )
  })

  // PAGINACIÓN
  const totalPaginas = Math.ceil(personasFiltradas.length / itemsPerPage)
  const inicio = (currentPage - 1) * itemsPerPage
  const fin = inicio + itemsPerPage
  const personasPaginadas = personasFiltradas.slice(inicio, fin)

  const openDeleteModal = (persona: Persona) => {
    setDeleteTarget(persona)
    setShowDeleteModal(true)
    setDeleteSuccessMsg(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeletingId(deleteTarget.id)
      await PersonasService.eliminar(deleteTarget.id)
      removePersona(deleteTarget.id)
      setShowDeleteModal(false)
      setDeleteSuccessMsg('El registro a sido eliminado')
      setDeletingId(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar persona')
      setDeletingId(null)
      setShowDeleteModal(false)
    }
  }

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estadoCivil: '',
      bautizado: '',
      sede: '',
    })
    setCurrentPage(1)
  }

  // Mientras carga
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-100 rounded-lg animate-pulse border border-green-100"
          ></div>
        ))}
      </div>
    )
  }

  // Si no hay personas
  if (personas.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md border border-green-100">
        <p className="text-gray-500 mb-4">No hay personas registradas</p>
        <button
          onClick={() => navigate('/personas/nueva')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Agregar Primera Persona
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mensaje de éxito eliminación */}
      {deleteSuccessMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg flex items-center justify-between text-sm">
          <span>{deleteSuccessMsg}</span>
          <button
            type="button"
            className="text-xs underline"
            onClick={() => setDeleteSuccessMsg(null)}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* FILTROS */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-green-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o cédula..."
                value={filtros.busqueda}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, busqueda: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Sede */}
          <select
            value={filtros.sede}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, sede: e.target.value }))
            }
            className="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todas las sedes</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.nombre_sede}>
                {sede.nombre_sede}
              </option>
            ))}
          </select>

          {/* Bautizado */}
          <select
            value={filtros.bautizado}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, bautizado: e.target.value }))
            }
            className="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todos</option>
            <option value="si">Bautizados</option>
            <option value="no">No bautizados</option>
          </select>
        </div>

        {/* Botón limpiar filtros */}
        {(filtros.busqueda ||
          filtros.estadoCivil ||
          filtros.bautizado ||
          filtros.sede) && (
            <button
              onClick={limpiarFiltros}
              className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50 border-b-2 border-green-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                  Foto
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                  Información Personal
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                  Identificación
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                  Educación
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                  Ministerios y Escalas
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-green-800 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {personasPaginadas.map((persona) => (
                <tr key={persona.id} className="hover:bg-green-50 transition">
                  {/* FOTO */}
                  <td className="px-4 py-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 relative">
                      <img
                        src={persona.url_foto || '/default-avatar.png'}
                        alt={persona.nombres}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          const initials = `${persona.nombres?.charAt(0)}${persona.primer_apellido?.charAt(0)}`.toUpperCase()
                          const canvas = document.createElement('canvas')
                          canvas.width = 64
                          canvas.height = 64
                          const ctx = canvas.getContext('2d')!
                          ctx.fillStyle = '#22c55e'
                          ctx.fillRect(0, 0, 64, 64)
                          ctx.fillStyle = 'white'
                          ctx.font = 'bold 24px Arial'
                          ctx.textAlign = 'center'
                          ctx.textBaseline = 'middle'
                          ctx.fillText(initials, 32, 32)
                          img.src = canvas.toDataURL()
                        }}
                      />
                      {persona.bautizado && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                          ⭐
                        </div>
                      )}
                    </div>
                  </td>

                  {/* INFORMACIÓN PERSONAL */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900">
                        {persona.nombres} {persona.primer_apellido}
                      </p>
                      <p className="text-sm text-gray-600">{persona.email || '-'}</p>
                      <p className="text-sm text-gray-600">{persona.telefono}</p>
                    </div>
                  </td>

                  {/* IDENTIFICACIÓN */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">Cédula:</span> {persona.numero_id}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Género:</span> {persona.genero}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Estado:</span>{' '}
                        {persona.estado_civil}
                      </p>
                    </div>
                  </td>

                  {/* UBICACIÓN */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">Barrio:</span>{' '}
                        {persona.barrio || '-'}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Ciudad:</span>{' '}
                        {persona.municipio}
                      </p>
                      <p className="text-sm text-gray-600">{persona.departamento}</p>
                    </div>
                  </td>

                  {/* EDUCACIÓN */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">Nivel:</span>{' '}
                        {persona.nivel_educativo}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Ocupación:</span>{' '}
                        {persona.ocupacion || '-'}
                      </p>
                    </div>
                  </td>

                  {/* MINISTERIOS Y ESCALAS */}
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      {/* Ministerios */}
                      {ministeriosPorPersona[persona.id]?.length > 0 ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            Ministerios:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {ministeriosPorPersona[persona.id].map((m) => (
                              <span
                                key={m.id}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                              >
                                {m.nombre}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Sin ministerios</p>
                      )}

                      {/* Escalas */}
                      {escalasPorPersona[persona.id]?.length > 0 ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            Escalas:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {escalasPorPersona[persona.id].map((e) => (
                              <span
                                key={e.id}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                              >
                                {e.nombre}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Sin escalas</p>
                      )}
                    </div>
                  </td>

                  {/* ACCIONES */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/personas/${persona.id}`)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/personas/${persona.id}/editar`)}
                        className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(persona)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div className="bg-green-50 px-4 py-3 border-t border-green-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {inicio + 1} a {Math.min(fin, personasFiltradas.length)} de{' '}
              {personasFiltradas.length} personas
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-green-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm font-medium">
                Página {currentPage} de {totalPaginas}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))
                }
                disabled={currentPage === totalPaginas}
                className="p-2 hover:bg-green-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Eliminar persona</h3>
                <p className="text-sm text-gray-600">
                  Esta acción no se puede deshacer. ¿Seguro que deseas eliminar a{' '}
                  <span className="font-semibold">
                    {deleteTarget.nombres} {deleteTarget.primer_apellido}
                  </span>
                  ?
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 w-full text-sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={!!deletingId}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleConfirmDelete}
                disabled={!!deletingId}
              >
                {deletingId ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
