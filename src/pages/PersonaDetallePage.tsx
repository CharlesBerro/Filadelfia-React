import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { PersonasService } from '@/services/personas.service'
import { MinisteriosService } from '@/services/ministerios.service'
import { EscalasService } from '@/services/escalas_services'
import type { Persona, Ministerio, EscalaCrecimiento } from '@/types'
import { ArrowLeft, Edit2, Trash2, UserCircle2, AlertTriangle } from 'lucide-react'

export const PersonaDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [persona, setPersona] = useState<Persona | null>(null)
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [escalas, setEscalas] = useState<EscalaCrecimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const [p, mins, escs] = await Promise.all([
          PersonasService.obtenerPorId(id),
          MinisteriosService.obtenerPorPersona(id),
          EscalasService.obtenerPorPersona(id),
        ])
        setPersona(p)
        setMinisterios(mins)
        setEscalas(escs)
      } catch (err: any) {
        console.error('Error cargando persona:', err)
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
      navigate('/personas')
    } catch (err: any) {
      console.error('Error eliminando persona:', err)
      alert(err.message || 'Error al eliminar persona')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen text="Cargando persona..." />
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
      <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header / acciones */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center shadow-lg">
                <UserCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {persona.nombres} {persona.primer_apellido}
                </h1>
                <p className="text-xs sm:text-sm text-green-700 font-medium uppercase tracking-wide">
                  Detalle de persona
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={() => navigate('/personas')}
                fullWidth
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/personas/${persona.id}/editar`)}
                fullWidth
              >
                <Edit2 className="w-4 h-4" /> Editar
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                fullWidth
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </Button>
            </div>
          </div>

          {/* Tarjeta principal con foto */}
          <div className="bg-gradient-to-br from-green-600/90 via-emerald-500/90 to-green-600/90 rounded-3xl shadow-2xl overflow-hidden border border-green-500/40">
            <div className="flex flex-col md:flex-row">
              {/* Foto / avatar */}
              <div className="md:w-2/5 p-6 sm:p-8 flex items-center justify-center bg-gradient-to-br from-white/15 via-white/5 to-white/10">
                <div className="relative">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-white/90 shadow-2xl overflow-hidden bg-green-800/40 flex items-center justify-center">
                    {persona.url_foto ? (
                      <img
                        src={persona.url_foto}
                        alt={`Foto de ${persona.nombres}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle2 className="w-20 h-20 text-white/95" />
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen de información */}
              <div className="flex-1 p-6 sm:p-8 space-y-4 bg-gradient-to-br from-white/95 via-white/90 to-emerald-50">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    {persona.nombres} {persona.primer_apellido} {persona.segundo_apellido || ''}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    {persona.tipo_id} {persona.numero_id}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                    {persona.genero}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    {persona.estado_civil}
                  </span>
                  {persona.bautizado && (
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      Bautizado
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Contacto</p>
                    <p>
                      <span className="font-medium">Teléfono:</span> {persona.telefono}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {persona.email || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Ubicación</p>
                    <p>
                      <span className="font-medium">Municipio:</span> {persona.municipio}
                    </p>
                    <p>
                      <span className="font-medium">Departamento:</span> {persona.departamento}
                    </p>
                    <p>
                      <span className="font-medium">Barrio / Dirección:</span> {persona.barrio || persona.direccion || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secciones en tarjetas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Datos personales */}
            <div className="rounded-2xl p-4 sm:p-5 border border-green-100 bg-gradient-to-br from-white via-green-50 to-emerald-50 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-lg tracking-tight">Datos personales</h2>
              <div className="space-y-1.5 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Nombre completo:</span> {persona.nombres}{' '}
                  {persona.primer_apellido} {persona.segundo_apellido || ''}
                </p>
                <p>
                  <span className="font-medium">Identificación:</span> {persona.tipo_id}{' '}
                  {persona.numero_id}
                </p>
                <p>
                  <span className="font-medium">Fecha nacimiento:</span> {persona.fecha_nacimiento}
                </p>
                <p>
                  <span className="font-medium">Género:</span> {persona.genero}
                </p>
                <p>
                  <span className="font-medium">Estado civil:</span> {persona.estado_civil}
                </p>
              </div>
            </div>

            {/* Contacto y ubicación detallado */}
            <div className="rounded-2xl p-4 sm:p-5 border border-green-100 bg-gradient-to-br from-white via-sky-50 to-indigo-50 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-lg tracking-tight">Contacto y ubicación</h2>
              <div className="space-y-1.5 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Teléfono:</span> {persona.telefono}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {persona.email || '-'}
                </p>
                <p>
                  <span className="font-medium">Dirección:</span> {persona.direccion || '-'}
                </p>
                <p>
                  <span className="font-medium">Barrio:</span> {persona.barrio || '-'}
                </p>
                <p>
                  <span className="font-medium">Municipio:</span> {persona.municipio}
                </p>
                <p>
                  <span className="font-medium">Departamento:</span> {persona.departamento}
                </p>
              </div>
            </div>
          </div>

          {/* Educación y área espiritual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
            <div className="rounded-2xl p-4 sm:p-5 border border-green-100 bg-gradient-to-br from-white via-amber-50 to-orange-50 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-lg tracking-tight">Educación y ocupación</h2>
              <div className="space-y-1.5 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Nivel educativo:</span> {persona.nivel_educativo}
                </p>
                <p>
                  <span className="font-medium">Ocupación:</span> {persona.ocupacion || '-'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border border-green-100 bg-gradient-to-br from-white via-purple-50 to-fuchsia-50 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-lg tracking-tight">Información espiritual</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Bautizado:</span>{' '}
                  {persona.bautizado ? 'Sí' : 'No'}
                </p>
                {persona.bautizado && (
                  <p>
                    <span className="font-medium">Fecha de bautismo:</span> {persona.fecha_bautismo || '-'}
                  </p>
                )}

                <div className="mt-3">
                  <p className="font-medium text-gray-900 text-sm mb-1">Ministerios</p>
                  {ministerios.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {ministerios.map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {m.nombre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Sin ministerios</p>
                  )}
                </div>

                <div className="mt-3">
                  <p className="font-medium text-gray-900 text-sm mb-1">Escalas de crecimiento</p>
                  {escalas.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {escalas.map((e) => (
                        <span
                          key={e.id}
                          className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                        >
                          {e.nombre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Sin escalas</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
                      {persona.nombres} {persona.primer_apellido}
                    </span>
                    ?
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                  fullWidth
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  fullWidth
                  disabled={deleting}
                >
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {deleting && (
          <LoadingSpinner fullScreen text="Eliminando persona..." />
        )}
      </div>
    </Layout>
  )
}
