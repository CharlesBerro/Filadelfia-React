import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { PersonasService } from '@/services/personas.service'
import { MinisteriosService } from '@/services/ministerios.service'
import { EscalasService } from '@/services/escalas_services'
import { SelectDepartamento } from '@/components/ui/SelectDepartamento'
import { SelectMunicipio } from '@/components/ui/SelectMunicipio'
import { FotoUploader } from '@/components/ui/FotoUploader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import type { Persona, Ministerio, EscalaCrecimiento } from '@/types'
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react'

export const EditarPersonaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [persona, setPersona] = useState<Persona | null>(null)
  const [formData, setFormData] = useState<Partial<Persona>>({})
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [escalas, setEscalas] = useState<EscalaCrecimiento[]>([])
  const [ministeriosSeleccionados, setMinisteriosSeleccionados] = useState<string[]>([])
  const [escalasSeleccionadas, setEscalasSeleccionadas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        // p: datos de la persona
        // allMins / allEscs: catálogo completo
        // minsPersona / escsPersona: asignaciones actuales
        const [p, allMins, allEscs, minsPersona, escsPersona] = await Promise.all([
          PersonasService.obtenerPorId(id),
          MinisteriosService.obtenerTodos(),
          EscalasService.obtenerTodas(),
          MinisteriosService.obtenerPorPersona(id),
          EscalasService.obtenerPorPersona(id),
        ])
        setPersona(p)
        setFormData(p)

        // Mostrar siempre el catálogo completo para poder agregar/quitar
        setMinisterios(allMins)
        setEscalas(allEscs)

        // Preseleccionar lo que ya tiene la persona
        setMinisteriosSeleccionados(minsPersona.map((m) => m.id))
        setEscalasSeleccionadas(escsPersona.map((e) => e.id))
      } catch (err: any) {
        setError(err.message || 'Error cargando persona')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleMinisterioToggle = (ministerioId: string) => {
    setMinisteriosSeleccionados((prev) =>
      prev.includes(ministerioId)
        ? prev.filter((id) => id !== ministerioId)
        : [...prev, ministerioId]
    )
  }

  const handleEscalaToggle = (escalaId: string) => {
    setEscalasSeleccionadas((prev) =>
      prev.includes(escalaId)
        ? prev.filter((id) => id !== escalaId)
        : [...prev, escalaId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSaving(true)
    setSaveSuccess(false)
    setError(null)

    try {
      // Preparar campos editables (evitar enviar id, user_id, sede_id, created_at...)
      const {
        id: _id,
        user_id: _userId,
        sede_id: _sedeId,
        created_at: _c,
        updated_at: _u,
        ...updates
      } = formData as Persona

      // Actualizar datos básicos de la persona
      await PersonasService.actualizar(id, updates)

      // Siempre actualizar relaciones many-to-many (aunque los arreglos estén vacíos)
      // para permitir quitar todos los ministerios/escalas.
      // Usamos el ID original (parámetro) en lugar de personaActualizada.id
      // para evitar errores si el update no retorna datos
      await MinisteriosService.asignarAPersona(
        id,
        ministeriosSeleccionados
      )

      await EscalasService.asignarAPersona(
        id,
        escalasSeleccionadas
      )

      setSaveSuccess(true)
      setTimeout(() => {
        navigate(`/personas/${id}`)
      }, 1500)
    } catch (err: any) {
      console.error('Error updating persona:', err)
      setError(err.message || 'Error al actualizar persona')
    } finally {
      setSaving(false)
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
      <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/personas/${persona.id}`)}
                className="flex items-center gap-2 text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Volver al detalle</span>
              </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Editar Persona</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-sm p-4">
            {(saving || saveSuccess) && (
              <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                {saving && (
                  <>
                    <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    <p className="text-lg font-semibold text-gray-800">Guardando cambios...</p>
                  </>
                )}
                {saveSuccess && !saving && (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-green-600" />
                    <p className="text-lg font-semibold text-gray-800">Actualizado con éxito</p>
                  </>
                )}
              </div>
            )}

            {/* Foto */}
            <div className="bg-white rounded-xl border border-green-100 p-4">
              <FotoUploader
                value={formData.url_foto || null}
                onChange={(url) => setFormData((prev) => ({ ...prev, url_foto: url }))}
              />
            </div>

            {/* Datos personales */}
            <div className="bg-white rounded-xl border border-green-100 p-4 space-y-3">
              <h2 className="font-bold text-gray-900 mb-2">Datos personales</h2>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nombres"
                  name="nombres"
                  value={formData.nombres || ''}
                  onChange={handleChange}
                />
                <Input
                  label="Primer apellido"
                  name="primer_apellido"
                  value={formData.primer_apellido || ''}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Segundo apellido"
                name="segundo_apellido"
                value={formData.segundo_apellido || ''}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Fecha de nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento || ''}
                  onChange={handleChange}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                  <select
                    name="genero"
                    value={formData.genero || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado civil</label>
                <select
                  name="estado_civil"
                  value={formData.estado_civil || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
                >
                  <option value="Soltero">Soltero</option>
                  <option value="Casado">Casado</option>
                  <option value="Unión Libre">Unión Libre</option>
                  <option value="Divorciado">Divorciado</option>
                  <option value="Viudo">Viudo</option>
                </select>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-white rounded-xl border border-green-100 p-4 space-y-3">
              <h2 className="font-bold text-gray-900 mb-2">Contacto</h2>
              <Input
                label="Teléfono"
                name="telefono"
                value={formData.telefono || ''}
                onChange={handleChange}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
              />
            </div>

            {/* Ubicación */}
            <div className="bg-white rounded-xl border border-green-100 p-4 space-y-3">
              <h2 className="font-bold text-gray-900 mb-2">Ubicación</h2>
              <Input
                label="Barrio"
                name="barrio"
                value={formData.barrio || ''}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <SelectDepartamento
                    value={formData.departamento || ''}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, departamento: value, municipio: '' }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                  <SelectMunicipio
                    departamento={formData.departamento || ''}
                    value={formData.municipio || ''}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, municipio: value }))
                    }
                  />
                </div>
              </div>

              <Input
                label="Dirección"
                name="direccion"
                value={formData.direccion || ''}
                onChange={handleChange}
              />
            </div>

            {/* Educación y ocupación */}
            <div className="bg-white rounded-xl border border-green-100 p-4 space-y-3">
              <h2 className="font-bold text-gray-900 mb-2">Educación y ocupación</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nivel educativo</label>
                  <select
                    name="nivel_educativo"
                    value={formData.nivel_educativo || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
                  >
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Tecnólogo">Tecnólogo</option>
                    <option value="Universitario">Universitario</option>
                    <option value="Posgrado">Posgrado</option>
                  </select>
                </div>
                <Input
                  label="Ocupación"
                  name="ocupacion"
                  value={formData.ocupacion || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Espiritual, ministerios y escalas */}
            <div className="bg-white rounded-xl border border-green-100 p-4 space-y-3">
              <h2 className="font-bold text-gray-900 mb-2">Información espiritual</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna 1: Bautismo */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="bautizado"
                      checked={!!formData.bautizado}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-600 border-green-300 rounded"
                    />
                    <span className="text-sm text-gray-700">¿Está bautizado?</span>
                  </label>

                  {formData.bautizado && (
                    <Input
                      label="Fecha de bautismo"
                      name="fecha_bautismo"
                      type="date"
                      value={formData.fecha_bautismo || ''}
                      onChange={handleChange}
                    />
                  )}
                </div>

                {/* Columna 2: Taller del Maestro */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="taller_maestro"
                      checked={!!formData.taller_maestro}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-600 border-green-300 rounded"
                    />
                    <span className="text-sm text-gray-700">¿Taller del Maestro?</span>
                  </label>

                  {formData.taller_maestro && (
                    <Input
                      label="Fecha del Taller"
                      name="fecha_taller_maestro"
                      type="date"
                      value={formData.fecha_taller_maestro || ''}
                      onChange={handleChange}
                    />
                  )}
                </div>
              </div>

              {/* Ministerios */}
              {ministerios.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ministerios
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ministerios.map((m) => (
                        <label
                          key={m.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-green-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={ministeriosSeleccionados.includes(m.id)}
                            onChange={() => handleMinisterioToggle(m.id)}
                            className="w-4 h-4 text-green-600 border-green-300 rounded"
                          />
                          <span className="text-xs text-gray-700">{m.nombre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Escalas */}
              {escalas.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escalas de crecimiento
                  </label>
                  <div className="space-y-2">
                    {escalas.map((e) => (
                      <label
                        key={e.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-green-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={escalasSeleccionadas.includes(e.id)}
                          onChange={() => handleEscalaToggle(e.id)}
                          className="w-4 h-4 text-green-600 border-green-300 rounded"
                        />
                        <span className="text-xs text-gray-700">{e.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pb-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/personas/${persona.id}`)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" fullWidth disabled={saving}>
                <Save className="w-4 h-4" /> Guardar cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
