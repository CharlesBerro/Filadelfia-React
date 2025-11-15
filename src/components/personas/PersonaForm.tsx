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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ArrowLeft, Save, CheckCircle2, XCircle } from 'lucide-react'
import type { PersonaCreate, Ministerio, EscalaCrecimiento } from '@/types'

export const PersonaForm: React.FC = () => {
  const navigate = useNavigate()
  const { addPersona } = usePersonasStore()

  // Estados
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [escalas, setEscalas] = useState<EscalaCrecimiento[]>([])
  
  // 🔑 PASO 1: Verificación de cédula
  const [cedulaVerificada, setCedulaVerificada] = useState(false)
  const [ministeriosSeleccionados, setMinisteriosSeleccionados] = useState<string[]>([])
  const [escalasSeleccionadas, setEscalasSeleccionadas] = useState<string[]>([])

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

  const cedulaValidation = useCedulaValidator(formData.numero_id)

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

  const handleVerificarCedula = () => {
    if (!formData.numero_id.trim()) {
      setErrors({ numero_id: 'Ingresa un número de identificación' })
      return
    }

    if (formData.numero_id.length < 6) {
      setErrors({ numero_id: 'Debe tener al menos 6 dígitos' })
      return
    }

    if (cedulaValidation.existe) {
      setErrors({ numero_id: 'Esta cédula ya está registrada' })
      return
    }

    // ✅ Cédula verificada, continuar
    setCedulaVerificada(true)
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

  const validar = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombres.trim()) newErrors.nombres = 'Requerido'
    if (!formData.primer_apellido.trim()) newErrors.primer_apellido = 'Requerido'
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'Requerido'
    if (!formData.telefono.trim()) newErrors.telefono = 'Requerido'
    if (!formData.departamento) newErrors.departamento = 'Requerido'
    if (!formData.municipio) newErrors.municipio = 'Requerido'

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validar()) return

    setLoading(true)

    try {
      const nuevaPersona = await PersonasService.crear(formData)

      if (ministeriosSeleccionados.length > 0) {
        await MinisteriosService.asignarAPersona(nuevaPersona.id, ministeriosSeleccionados)
      }

      if (escalasSeleccionadas.length > 0) {
        await EscalasService.asignarAPersona(nuevaPersona.id, escalasSeleccionadas)
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

  // 🔒 PASO 1: Verificación de cédula
  if (!cedulaVerificada) {
    return (
      <form className="max-w-md mx-auto space-y-6 p-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verificación de Identidad
          </h2>
          <p className="text-gray-600 text-sm">
            Ingresa el número de identificación
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento
            </label>
            <select
              name="tipo_id"
              value={formData.tipo_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PA">Pasaporte</option>
            </select>
          </div>

          <Input
            label="Número de Identificación"
            name="numero_id"
            value={formData.numero_id}
            onChange={handleChange}
            placeholder="Ej: 1234567890"
            error={errors.numero_id}
            className="mb-4"
          />

          {/* Estado de validación */}
          {cedulaValidation.isValidating && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
              <LoadingSpinner size="sm" text="" />
              <span className="text-sm font-medium">Verificando...</span>
            </div>
          )}

          {!cedulaValidation.isValidating && cedulaValidation.mensaje && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                cedulaValidation.existe
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {cedulaValidation.existe ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{cedulaValidation.mensaje}</span>
            </div>
          )}

          <Button
            type="button"
            onClick={handleVerificarCedula}
            variant="primary"
            fullWidth
            disabled={cedulaValidation.isValidating || !formData.numero_id}
          >
            Verificar y Continuar
          </Button>

          <button
            type="button"
            onClick={() => navigate('/personas')}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  // ✅ PASO 2: Formulario completo (cédula verificada)
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {loading && <LoadingSpinner fullScreen text="Guardando persona..." />}

      {/* Header compacto */}
      <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-4">
        <button
          type="button"
          onClick={() => navigate('/personas')}
          className="flex items-center gap-2 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Volver</span>
        </button>

        <Button type="submit" variant="primary" disabled={loading}>
          <Save className="w-4 h-4" />
          Guardar
        </Button>
      </div>

      {/* Foto */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <FotoUploader
          value={formData.url_foto}
          onChange={(url) => setFormData((prev) => ({ ...prev, url_foto: url }))}
        />
      </div>

      {/* Identificación (resumida) */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Identificación Verificada
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Tipo:</span>{' '}
            <span className="font-medium">{formData.tipo_id}</span>
          </div>
          <div>
            <span className="text-gray-600">Número:</span>{' '}
            <span className="font-medium">{formData.numero_id}</span>
          </div>
        </div>
      </div>

      {/* Datos Personales - COMPACTO */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <h3 className="font-bold text-gray-900">👤 Datos Personales</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombres *"
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            error={errors.nombres}
          />
          <Input
            label="Primer Apellido *"
            name="primer_apellido"
            value={formData.primer_apellido}
            onChange={handleChange}
            error={errors.primer_apellido}
          />
        </div>

        <Input
          label="Segundo Apellido"
          name="segundo_apellido"
          value={formData.segundo_apellido || ''}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha Nac. *"
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            error={errors.fecha_nacimiento}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género *
            </label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado Civil *
          </label>
          <select
            name="estado_civil"
            value={formData.estado_civil}
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

      {/* Contacto - COMPACTO */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <h3 className="font-bold text-gray-900">📞 Contacto</h3>
        
        <Input
          label="Teléfono *"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="3001234567"
          error={errors.telefono}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          error={errors.email}
        />
      </div>

      {/* Ubicación - COMPACTO */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <h3 className="font-bold text-gray-900">📍 Ubicación</h3>
        
        <Input
          label="Barrio"
          name="barrio"
          value={formData.barrio || ''}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento *
            </label>
            <SelectDepartamento
              value={formData.departamento}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, departamento: value, municipio: '' }))
              }
            />
            {errors.departamento && (
              <p className="text-red-500 text-xs mt-1">{errors.departamento}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Municipio *
            </label>
            <SelectMunicipio
              departamento={formData.departamento}
              value={formData.municipio}
              onChange={(value) => setFormData((prev) => ({ ...prev, municipio: value }))}
            />
            {errors.municipio && (
              <p className="text-red-500 text-xs mt-1">{errors.municipio}</p>
            )}
          </div>
        </div>

        <Input
          label="Dirección"
          name="direccion"
          value={formData.direccion || ''}
          onChange={handleChange}
        />
      </div>

      {/* Educación - COMPACTO */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <h3 className="font-bold text-gray-900">🎓 Educación</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel Educativo
            </label>
            <select
              name="nivel_educativo"
              value={formData.nivel_educativo}
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

      {/* Espiritual - COMPACTO */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <h3 className="font-bold text-gray-900">⛪ Información Espiritual</h3>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="bautizado"
            checked={formData.bautizado}
            onChange={handleChange}
            className="w-4 h-4 text-green-600 border-green-300 rounded"
          />
          <span className="text-sm text-gray-700">¿Está bautizado?</span>
        </label>

        {formData.bautizado && (
          <Input
            label="Fecha de Bautismo"
            name="fecha_bautismo"
            type="date"
            value={formData.fecha_bautismo || ''}
            onChange={handleChange}
          />
        )}

        {/* Ministerios */}
        {ministerios.length > 0 && (
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
        )}

        {/* Escalas */}
        {escalas.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escalas de Crecimiento
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
                  <span className="text-xs text-gray-700">
                    {e.orden}. {e.nombre}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botones finales */}
      <div className="flex gap-3 pb-8">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/personas')}
          fullWidth
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading} fullWidth>
          Guardar
        </Button>
      </div>
    </form>
  )
}