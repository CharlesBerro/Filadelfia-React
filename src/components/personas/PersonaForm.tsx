import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PersonasService } from '@/services/personas.service'
import { MinisteriosService } from '@/services/ministerios.service'
import { EscalasService } from '@/services/escalas_services'
import { usePersonasStore } from '@/stores/personas.store'
import { useCedulaValidator } from '@/hooks/useCedulaValidator'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SelectDepartamento } from '@/components/ui/SelectDepartamento'
import { SelectMunicipio } from '@/components/ui/SelectMunicipio'
import { FotoUploader } from '@/components/ui/FotoUploader'
import { ArrowLeft, Save, Loader, AlertCircle } from 'lucide-react'
import type { PersonaCreate, Ministerio, EscalaCrecimiento } from '@/types'

export const PersonaForm: React.FC = () => {
  const navigate = useNavigate()
  const { addPersona } = usePersonasStore()

  // Estados
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [escalas, setEscalas] = useState<EscalaCrecimiento[]>([])

  // Ministerios y escalas seleccionados
  const [ministeriosSeleccionados, setMinisteriosSeleccionados] = useState<string[]>([])
  const [escalasSeleccionadas, setEscalasSeleccionadas] = useState<string[]>([])

  // Formulario
  const [formData, setFormData] = useState<PersonaCreate>({
    tipo_id: 'CC',
    numero_id: '',
    nombres: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha_nacimiento: '',
    genero: 'Masculino',
    estado_civil: 'Soltero',
    telefono: '',
    email: '',
    direccion: '',
    departamento: '',
    municipio: '',
    barrio: '',
    ocupacion: '',
    nivel_educativo: 'Primaria',
    bautizado: false,
    fecha_bautismo: null,
    ministerio: null,
    escala_crecimiento: 1,
    observaciones: '',
    url_foto: null,
  })

  // ✅ VALIDACIÓN DE CÉDULA EN TIEMPO REAL
  const cedulaValidation = useCedulaValidator(formData.numero_id)

  // Cargar ministerios y escalas al montar
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [ministeriosData, escalasData] = await Promise.all([
        MinisteriosService.obtenerTodos(),
        EscalasService.obtenerTodas(),
      ])

      setMinisterios(ministeriosData)
      setEscalas(escalasData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Manejar selección de ministerios (checkboxes)
  const handleMinisterioToggle = (ministerioId: string) => {
    setMinisteriosSeleccionados((prev) =>
      prev.includes(ministerioId)
        ? prev.filter((id) => id !== ministerioId)
        : [...prev, ministerioId]
    )
  }

  // Manejar selección de escalas (checkboxes)
  const handleEscalaToggle = (escalaId: string) => {
    setEscalasSeleccionadas((prev) =>
      prev.includes(escalaId)
        ? prev.filter((id) => id !== escalaId)
        : [...prev, escalaId]
    )
  }

  const validar = (): boolean => {
    const newErrors: Record<string, string> = {}

    // ⚠️ VALIDAR CÉDULA
    if (!formData.numero_id.trim()) {
      newErrors.numero_id = 'La cédula es obligatoria'
    } else if (cedulaValidation.existe) {
      newErrors.numero_id = 'Esta cédula ya está registrada'
    }

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios'
    }

    if (!formData.primer_apellido.trim()) {
      newErrors.primer_apellido = 'El primer apellido es obligatorio'
    }

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    }

    if (!formData.departamento) {
      newErrors.departamento = 'Selecciona un departamento'
    }

    if (!formData.municipio) {
      newErrors.municipio = 'Selecciona un municipio'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validar()) {
      return
    }

    setLoading(true)

    try {
      // 1. Crear persona
      const nuevaPersona = await PersonasService.crear(formData)

      // 2. Asignar ministerios
      if (ministeriosSeleccionados.length > 0) {
        await MinisteriosService.asignarAPersona(
          nuevaPersona.id,
          ministeriosSeleccionados
        )
      }

      // 3. Asignar escalas
      if (escalasSeleccionadas.length > 0) {
        await EscalasService.asignarAPersona(
          nuevaPersona.id,
          escalasSeleccionadas
        )
      }

      addPersona(nuevaPersona)
      navigate('/personas')
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al crear persona')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/personas')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <Button type="submit" variant="primary" disabled={loading || cedulaValidation.existe}>
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Persona
            </>
          )}
        </Button>
      </div>

      {/* ⚠️ ALERTA SI CÉDULA EXISTE */}
      {cedulaValidation.existe && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 font-medium">{cedulaValidation.mensaje}</p>
        </div>
      )}

      {/* FOTO */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
        <FotoUploader
          value={formData.url_foto}
          onChange={(url) => setFormData((prev) => ({ ...prev, url_foto: url }))}
        />
      </div>

      {/* IDENTIFICACIÓN */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Identificación</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de ID *
            </label>
            <select
              name="tipo_id"
              value={formData.tipo_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="RC">Registro Civil</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Input
              label="Número de Identificación *"
              name="numero_id"
              value={formData.numero_id}
              onChange={handleChange}
              placeholder="Ej: 1234567890"
              error={errors.numero_id}
            />
            {/* Mensaje de validación */}
            {cedulaValidation.isValidating && (
              <p className="text-blue-600 text-sm mt-1">🔍 {cedulaValidation.mensaje}</p>
            )}
            {!cedulaValidation.isValidating && cedulaValidation.mensaje && !cedulaValidation.existe && (
              <p className="text-green-600 text-sm mt-1">{cedulaValidation.mensaje}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Género *
            </label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado Civil *
            </label>
            <select
              name="estado_civil"
              value={formData.estado_civil}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
              <option value="Unión Libre">Unión Libre</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Viudo">Viudo</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATOS PERSONALES */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">👤 Datos Personales</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombres *"
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            placeholder="Ej: Juan Carlos"
            error={errors.nombres}
          />

          <Input
            label="Primer Apellido *"
            name="primer_apellido"
            value={formData.primer_apellido}
            onChange={handleChange}
            placeholder="Ej: Pérez"
            error={errors.primer_apellido}
          />

          <Input
            label="Segundo Apellido"
            name="segundo_apellido"
            value={formData.segundo_apellido || ''}
            onChange={handleChange}
            placeholder="Ej: González"
          />

          <Input
            label="Fecha de Nacimiento *"
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            error={errors.fecha_nacimiento}
          />

          <Input
            label="Teléfono *"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ej: 3001234567"
            error={errors.telefono}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="Ej: juan@ejemplo.com"
            error={errors.email}
          />
        </div>
      </div>

      {/* UBICACIÓN */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Ubicación</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Barrio"
            name="barrio"
            value={formData.barrio || ''}
            onChange={handleChange}
            placeholder="Ej: Centro"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento *
            </label>
            <SelectDepartamento
              value={formData.departamento}
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  departamento: value,
                  municipio: '',
                }))
              }}
            />
            {errors.departamento && (
              <p className="text-red-500 text-sm mt-1">{errors.departamento}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Municipio *
            </label>
            <SelectMunicipio
              departamento={formData.departamento}
              value={formData.municipio}
              onChange={(value) => setFormData((prev) => ({ ...prev, municipio: value }))}
            />
            {errors.municipio && (
              <p className="text-red-500 text-sm mt-1">{errors.municipio}</p>
            )}
          </div>

          <Input
            label="Dirección"
            name="direccion"
            value={formData.direccion || ''}
            onChange={handleChange}
            placeholder="Ej: Calle 10 # 20-30"
          />
        </div>
      </div>

      {/* EDUCACIÓN Y OCUPACIÓN */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🎓 Educación y Ocupación</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel Educativo
            </label>
            <select
              name="nivel_educativo"
              value={formData.nivel_educativo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
              <option value="Técnico">Técnico</option>
              <option value="Tecnólogo">Tecnólogo</option>
              <option value="Universitario">Universitario</option>
              <option value="Ninguno">Ninguno</option>
            </select>
          </div>

          <Input
            label="Ocupación"
            name="ocupacion"
            value={formData.ocupacion || ''}
            onChange={handleChange}
            placeholder="Ej: Ingeniero"
          />
        </div>
      </div>

      {/* MINISTERIOS Y ESCALAS */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">⛪ Ministerios y Escalas</h2>

        <div className="space-y-6">
          {/* Bautizado */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="bautizado"
              checked={formData.bautizado}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
            />
            <label className="text-sm font-medium text-gray-700">¿Está bautizado?</label>
          </div>

          {formData.bautizado && (
            <Input
              label="Fecha de Bautismo"
              name="fecha_bautismo"
              type="date"
              value={formData.fecha_bautismo || ''}
              onChange={handleChange}
            />
          )}

          {/* MINISTERIOS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ministerios
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ministerios.map((ministerio) => (
                <label
                  key={ministerio.id}
                  className="flex items-center gap-2 p-2 hover:bg-green-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={ministeriosSeleccionados.includes(ministerio.id)}
                    onChange={() => handleMinisterioToggle(ministerio.id)}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{ministerio.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ESCALAS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Escalas de Crecimiento
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {escalas.map((escala) => (
                <label
                  key={escala.id}
                  className="flex items-center gap-2 p-2 hover:bg-green-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={escalasSeleccionadas.includes(escala.id)}
                    onChange={() => handleEscalaToggle(escala.id)}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    {escala.orden}. {escala.nombre}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/personas')}
          fullWidth
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || cedulaValidation.existe}
          fullWidth
        >
          {loading ? 'Guardando...' : 'Guardar Persona'}
        </Button>
      </div>
    </form>
  )
}