// src/components/personas/PersonasTable.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PersonasService } from '@/services/personas.service'
import { MinisteriosService } from '@/services/ministerios.service'
import { EscalasService } from '@/services/escalas_services'
import { usePersonasStore } from '@/stores/personas.store'
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Search, X, AlertTriangle } from 'lucide-react'
import type { Persona, Ministerio, EscalaCrecimiento, Sede } from '@/types'

interface PersonasTableProps {
  personas?: Persona[]
  filtros?: {
    busqueda: string
    estadoCivil: string
    bautizado: string
    sede: string
  }
  onFilterChange?: (filtros: any) => void
  sedes?: Sede[]
}

export const PersonasTable: React.FC<PersonasTableProps> = ({
  personas: personasProp,
  filtros,
  onFilterChange,
  sedes = []
}) => {
  const navigate = useNavigate()
  // Usamos el store solo para acciones (eliminar, loading, error), pero NO para la lista principal si viene por props
  const { personas: personasStore, loading, setLoading, setError, removePersona } = usePersonasStore()

  // Si nos pasan personas por props (versión filtrada desde el padre), usamos esas. Si no, usamos el store (fallback)
  const personasData = personasProp || personasStore

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // ESTADO eliminación (modal + loading + mensaje)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Persona | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null)

  // MINISTERIOS Y ESCALAS por persona (cache)
  const [ministeriosPorPersona, setMinisteriosPorPersona] = useState<
    Record<string, Ministerio[]>
  >({})
  const [escalasPorPersona, setEscalasPorPersona] = useState<
    Record<string, EscalaCrecimiento[]>
  >({})

  // Cargar personas al montar (solo si no vienen por props, aunque PersonasPage ya las carga)
  useEffect(() => {
    if (!personasProp) {
      cargarPersonas()
    } else {
      // Si vienen por props, aseguramos cargar sus detalles extra
      cargarMinisteriosYEscalas(personasProp)
    }
  }, [personasProp])

  const cargarPersonas = async () => {
    setLoading(true)
    setError(null)
    try {
      const datos = await PersonasService.obtenerMias()
      // setPersonas(datos) // No actualizamos el store aquí si somos controlados, pero PersonasPage lo hace
      await cargarMinisteriosYEscalas(datos)
    } catch (error: any) {
      setError(error.message || 'Error cargando personas')
    } finally {
      setLoading(false)
    }
  }

  // Cargar ministerios y escalas de todas las personas
  const cargarMinisteriosYEscalas = async (personas: Persona[]) => {
    const ministeriosCache: Record<string, Ministerio[]> = {}
    const escalasCache: Record<string, EscalaCrecimiento[]> = {}

    // Optimizamos para no recargar si ya tenemos datos
    const personasSinDatos = personas.filter(p => !ministeriosPorPersona[p.id])
    if (personasSinDatos.length === 0) return

    await Promise.all(
      personasSinDatos.map(async (persona) => {
        try {
          const [ministerios, escalas] = await Promise.all([
            MinisteriosService.obtenerPorPersona(persona.id),
            EscalasService.obtenerPorPersona(persona.id),
          ])

          ministeriosCache[persona.id] = ministerios
          escalasCache[persona.id] = escalas
        } catch (error) {
        }
      })
    )

    setMinisteriosPorPersona(prev => ({ ...prev, ...ministeriosCache }))
    setEscalasPorPersona(prev => ({ ...prev, ...escalasCache }))
  }

  // Paginación lógica
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPersonas = personasData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(personasData.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

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
      alert('Error al eliminar persona')
      setDeletingId(null)
      setShowDeleteModal(false)
    }
  }

  const updateFiltro = (key: string, value: string) => {
    if (onFilterChange && filtros) {
      onFilterChange({ ...filtros, [key]: value })
      setCurrentPage(1) // Reset página al filtrar
    }
  }

  const limpiarFiltros = () => {
    if (onFilterChange) {
      onFilterChange({
        busqueda: '',
        estadoCivil: '',
        bautizado: '',
        sede: '',
      })
      setCurrentPage(1)
    }
  }

  // Mientras carga
  if (loading && personasData.length === 0) {
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

  // Si no hay personas (y no hay filtros activos)
  if (personasData.length === 0 && (!filtros || (!filtros.busqueda && !filtros.sede && !filtros.estadoCivil && !filtros.bautizado))) {
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
      {filtros && (
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
                  onChange={(e) => updateFiltro('busqueda', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Sede */}
            <select
              value={filtros.sede}
              onChange={(e) => updateFiltro('sede', e.target.value)}
              className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Todas las Sedes</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre_sede}
                </option>
              ))}
            </select>

            {/* Estado Civil */}
            <select
              value={filtros.estadoCivil}
              onChange={(e) => updateFiltro('estadoCivil', e.target.value)}
              className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Estado Civil (Todos)</option>
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Viudo">Viudo</option>
              <option value="Union Libre">Unión Libre</option>
            </select>

            {/* Bautizado */}
            <select
              value={filtros.bautizado}
              onChange={(e) => updateFiltro('bautizado', e.target.value)}
              className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Bautizado (Todos)</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Botón limpiar filtros */}
          {(filtros.busqueda || filtros.sede || filtros.estadoCivil || filtros.bautizado) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={limpiarFiltros}
                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50 border-b border-green-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                  Persona
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                  Ministerios
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">
                  Escala Crecimiento
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-green-800 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentPersonas.map((persona) => (
                <tr key={persona.id} className="hover:bg-green-50/30 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="flex items-center cursor-pointer hover:bg-green-50/50 p-1 rounded-lg transition-colors"
                      onClick={() => navigate(`/personas/${persona.id}`)}
                    >
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm overflow-hidden relative group shrink-0">
                        {persona.url_foto ? (
                          <img
                            src={persona.url_foto}
                            alt={`${persona.nombres} ${persona.primer_apellido}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <>
                            {persona.nombres.charAt(0)}
                            {persona.primer_apellido.charAt(0)}
                          </>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {persona.nombres} {persona.primer_apellido}
                          {persona.bautizado && (
                            <span title="Bautizado">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-500">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          CC: {persona.numero_id}
                        </div>
                        <div className="text-xs text-gray-400">
                          {persona.estado_civil} • {(() => {
                            if (!persona.fecha_nacimiento) return '?'
                            const hoy = new Date()
                            const nacimiento = new Date(persona.fecha_nacimiento)
                            let edad = hoy.getFullYear() - nacimiento.getFullYear()
                            const m = hoy.getMonth() - nacimiento.getMonth()
                            if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
                              edad--
                            }
                            return edad
                          })()} años
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{persona.telefono}</div>
                    <div className="text-sm text-gray-500">{persona.email}</div>
                    <div className="text-xs text-gray-400">{persona.direccion}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {ministeriosPorPersona[persona.id]?.length > 0 ? (
                        ministeriosPorPersona[persona.id].map((min) => (
                          <span
                            key={min.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {min.nombre}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Ninguno</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {escalasPorPersona[persona.id]?.length > 0 ? (
                        escalasPorPersona[persona.id].map((esc) => (
                          <span
                            key={esc.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {esc.nombre}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Ninguna</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/personas/${persona.id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/personas/${persona.id}/editar`)}
                        className="text-amber-600 hover:text-amber-900 p-1 hover:bg-amber-50 rounded"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(persona)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="hidden sm:flex bg-white px-4 py-3 border-t border-gray-200 items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, personasData.length)}
                  </span>{' '}
                  de <span className="font-medium">{personasData.length}</span> resultados
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                        ? 'z-10 bg-green-50 border-green-500 text-green-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL ELIMINAR */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Eliminar persona?
              </h3>
              <p className="text-gray-500 mb-6">
                ¿Estás seguro que deseas eliminar a{' '}
                <span className="font-bold text-gray-800">
                  {deleteTarget?.nombres} {deleteTarget?.primer_apellido}
                </span>
                ? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  disabled={!!deletingId}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={!!deletingId}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                >
                  {deletingId ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
