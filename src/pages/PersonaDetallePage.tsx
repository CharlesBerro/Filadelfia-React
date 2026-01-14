import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'

import { Modal } from '@/components/ui/Modal'
import { PersonasService } from '@/services/personas.service'
import { MinisteriosService } from '@/services/ministerios.service'
import { EscalasService } from '@/services/escalas_services'
import { SedesService } from '@/services/sedes.service'
import { usePersonasStore } from '@/stores/personas.store'
import type { Persona, Ministerio, EscalaCrecimiento, Sede } from '@/types'
import { UserCircle2, AlertTriangle, ChevronLeft, ChevronRight, Eye, Edit, Trash2, CheckCircle2 } from 'lucide-react'

export const PersonaDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { personas } = usePersonasStore()

  const [persona, setPersona] = useState<Persona | null>(null)
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [escalas, setEscalas] = useState<EscalaCrecimiento[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Navigation state
  const currentIndex = personas.findIndex(p => p.id === id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < personas.length - 1

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const [p, mins, escs, sedesData] = await Promise.all([
          PersonasService.obtenerPorId(id),
          MinisteriosService.obtenerPorPersona(id),
          EscalasService.obtenerPorPersona(id),
          SedesService.obtenerTodas(),
        ])
        setPersona(p)
        setMinisterios(mins)
        setEscalas(escs)
        setSedes(sedesData)
      } catch (err: any) {
        setError(err.message || 'Error cargando persona')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  const handleDelete = async () => {
    if (!persona) return
    try {
      setDeleting(true)
      await PersonasService.eliminar(persona.id)
      setDeleting(false)
      setDeleteSuccess(true)
      setTimeout(() => {
        navigate('/personas')
      }, 1500)
    } catch (err: any) {
      alert(err.message || 'Error al eliminar persona')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
    const newPerson = personas[newIndex]
    if (newPerson) {
      navigate(`/personas/${newPerson.id}`)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-800">Cargando persona...</p>
        </div>
      </Layout>
    )
  }

  if (error || !persona) {
    return (
      <Layout>
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center">
            <p className="text-red-600 mb-4">{error || 'Persona no encontrada'}</p>
            <Button variant="secondary" onClick={() => navigate('/personas')}>
              Volver a Personas
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-full bg-gradient-to-br from-green-50/30 to-emerald-50/30 pb-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {/* Navigation buttons - Mobile friendly */}
          <div className="flex justify-between items-center gap-2">
            <button
              onClick={() => handleNavigate('prev')}
              disabled={!hasPrevious}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${hasPrevious
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <ChevronLeft className="w-4 h-4 inline mr-1" />
              Anterior
            </button>
            <button
              onClick={() => handleNavigate('next')}
              disabled={!hasNext}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${hasNext
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header with Avatar and Name */}
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                    {persona.url_foto ? (
                      <img
                        src={persona.url_foto}
                        alt={persona.nombres}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <UserCircle2 className="w-12 h-12" />
                    )}
                  </div>
                </div>

                {/* Name and ID */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 truncate">
                    {persona.nombres} {persona.primer_apellido} {persona.segundo_apellido || ''}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    CC: {persona.numero_id}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">Sede:</p>
                  <p className="text-gray-700 ml-2">
                    {sedes.find(s => s.id === persona.sede_id)?.nombre_sede || 'No especificado'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Ubicación:</p>
                  <p className="text-gray-700 ml-2">
                    {persona.departamento} - {persona.municipio}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Ministerios:</p>
                  {ministerios.length > 0 ? (
                    <div className="ml-2 flex flex-wrap gap-1.5 mt-1">
                      {ministerios.map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {m.nombre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 ml-2">Sin Ministerio</p>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Escalas:</p>
                  {escalas.length > 0 ? (
                    <div className="ml-2 flex flex-wrap gap-1.5 mt-1">
                      {escalas.map((e) => (
                        <span
                          key={e.id}
                          className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full"
                        >
                          {e.nombre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 ml-2">Sin Escala</p>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Teléfono:</p>
                  <p className="text-gray-700 ml-2">{persona.telefono}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Email:</p>
                  <p className="text-gray-700 ml-2">{persona.email || 'No especificado'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => navigate(`/personas/${persona.id}`)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <Eye className="w-4 h-4" />
                Ver
              </button>
              <button
                onClick={() => navigate(`/personas/${persona.id}/editar`)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>

          {/* Additional Info - Collapsed for mobile */}
          <details className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <summary className="px-6 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors">
              Ver información completa
            </summary>
            <div className="space-y-3 border-t border-gray-100">
              <div className="px-6 py-4 bg-gradient-to-br from-green-50 to-emerald-50">
                <h3 className="font-bold text-gray-900 mb-2">Datos personales</h3>
                <div className="space-y-1.5 text-sm text-gray-700 ml-2">
                  <p><span className="font-medium">Nombre completo:</span> {persona.nombres} {persona.primer_apellido} {persona.segundo_apellido || ''}</p>
                  <p><span className="font-medium">Fecha nacimiento:</span> {persona.fecha_nacimiento || 'No especificado'}</p>
                  <p><span className="font-medium">Género:</span> {persona.genero}</p>
                  <p><span className="font-medium">Estado civil:</span> {persona.estado_civil}</p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gradient-to-br from-purple-50 to-pink-50">
                <h3 className="font-bold text-gray-900 mb-2">Información espiritual</h3>
                <div className="space-y-1.5 text-sm text-gray-700 ml-2">
                  <p><span className="font-medium">Bautizado:</span> {persona.bautizado ? 'Sí' : 'No'}</p>
                  {persona.bautizado && persona.fecha_bautismo && (
                    <p><span className="font-medium">Fecha bautismo:</span> {persona.fecha_bautismo}</p>
                  )}
                  <p className="mt-1"><span className="font-medium">Asistió a Taller:</span> {persona.taller_maestro ? 'Sí' : 'No'}</p>
                  {persona.taller_maestro && persona.fecha_taller_maestro && (
                    <p><span className="font-medium">Fecha taller:</span> {persona.fecha_taller_maestro}</p>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gradient-to-br from-amber-50 to-orange-50">
                <h3 className="font-bold text-gray-900 mb-2">Educación y ocupación</h3>
                <div className="space-y-1.5 text-sm text-gray-700 ml-2">
                  <p><span className="font-medium">Nivel educativo:</span> {persona.nivel_educativo}</p>
                  <p><span className="font-medium">Ocupación:</span> {persona.ocupacion || 'No especificado'}</p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="font-bold text-gray-900 mb-2">Ubicación detallada</h3>
                <div className="space-y-1.5 text-sm text-gray-700 ml-2">
                  <p><span className="font-medium">Dirección:</span> {persona.direccion || 'No especificado'}</p>
                  <p><span className="font-medium">Barrio:</span> {persona.barrio || 'No especificado'}</p>
                </div>
              </div>
            </div>
          </details>

          {/* Back to list button */}
          <div className="pt-2">
            <button
              onClick={() => navigate('/personas')}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Volver al listado
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => !deleting && setShowDeleteModal(false)}
          title="Confirmar Eliminación"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-12 h-12 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  ¿Estás seguro de eliminar a {persona.nombres} {persona.primer_apellido}?
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
                fullWidth
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </Modal>

        {(deleting || deleteSuccess) && (
          <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
            {deleting && (
              <>
                <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-lg font-semibold text-gray-800">Eliminando persona...</p>
              </>
            )}
            {deleteSuccess && !deleting && (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-600" />
                <p className="text-lg font-semibold text-gray-800">Eliminado correctamente</p>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
