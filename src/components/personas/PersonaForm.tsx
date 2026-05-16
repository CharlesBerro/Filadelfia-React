import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PersonasService } from '@/services/personas.service'
import { MinisteriosService } from '@/services/ministerios.service'
import { usePersonasStore } from '@/stores/personas.store'
import { useCedulaValidator } from '@/hooks/useCedulaValidator'
import { Input } from '@/components/ui/Input'
import { SelectDepartamento } from '@/components/ui/SelectDepartamento'
import { SelectMunicipio } from '@/components/ui/SelectMunicipio'
import { FotoUploader } from '@/components/ui/FotoUploader'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ArrowLeft, Save, CheckCircle2, XCircle, User, MapPin, Briefcase, Heart } from 'lucide-react'
import type { PersonaCreate, Ministerio } from '@/types'

// Estilos CSS personalizados para el gradiente y la sombra de los inputs (Mismos que el formulario anterior)
const customStyles = `
.card-gradient-bg {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); /* Fondo suave */
}
.input-shadow {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.input-shadow:focus, .input-shadow:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    border-color: #10b981; /* esmeralda-500 */
}
.fade-in {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.section-card {
    background-color: white;
    border-radius: 1.5rem; /* rounded-3xl */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    padding: 1.5rem; /* p-6 */
    transition: all 0.3s ease;
}
.section-card:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
`

// Componente principal del formulario
export const PersonaForm: React.FC = () => {
  const navigate = useNavigate()
  const { addPersona } = usePersonasStore()

  // Estados (Lógica 100% intacta)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle')

  // 🔑 PASO 1: Verificación de cédula
  const [cedulaVerificada, setCedulaVerificada] = useState(false)
  const [ministeriosSeleccionados, setMinisteriosSeleccionados] = useState<string[]>([])

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
    taller_maestro: false,
    fecha_taller_maestro: null,
    es_formador: false,
    ministerio: null,
    escala_crecimiento: 1,
    url_foto: null,
  })

  const { validation: cedulaValidation, validarCedula } = useCedulaValidator()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [ministeriosData] = await Promise.all([
        MinisteriosService.obtenerTodos(),
      ])
      setMinisterios(ministeriosData)
    } catch (error) {
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

  const handleVerificarCedula = async () => {
    if (!formData.numero_id.trim()) {
      setErrors({ numero_id: 'Ingresa un número de identificación' })
      return
    }

    // Ejecutar validación manual contra Supabase
    const disponible = await validarCedula(formData.numero_id.trim())

    if (!disponible) {
      // Si no está disponible, marcamos error en el campo si ya existe
      if (cedulaValidation.existe) {
        setErrors({ numero_id: 'Esta cédula ya está registrada' })
      }
      return
    }

    // ✅ Cédula verificada y disponible, continuar al formulario completo
    setCedulaVerificada(true)
  }

  const handleMinisterioToggle = (ministerioId: string) => {
    setMinisteriosSeleccionados((prev) =>
      prev.includes(ministerioId)
        ? prev.filter((id) => id !== ministerioId)
        : [...prev, ministerioId]
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
    setSaveStatus('saving')

    try {
      const nuevaPersona = await PersonasService.crear(formData)

      if (ministeriosSeleccionados.length > 0) {
        await MinisteriosService.asignarAPersona(nuevaPersona.id, ministeriosSeleccionados)
      }

      addPersona(nuevaPersona)

      // Mostrar spinner de éxito antes de redirigir
      setSaveStatus('success')
      setTimeout(() => {
        navigate('/personas')
      }, 1500)
    } catch (error: any) {
      alert(error.message || 'Error al crear persona')
      setSaveStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  // Renderizado del formulario rediseñado
  return (
    <>
      {/* Inyectar estilos personalizados */}
      <style>{customStyles}</style>

      <div className="max-w-5xl mx-auto p-4 md:p-8 card-gradient-bg rounded-3xl shadow-2xl fade-in">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
          Registro de Nueva Persona
        </h2>

        {/* 🔒 PASO 1: Verificación de cédula (Rediseñado) */}
        {!cedulaVerificada && (
          <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto space-y-6 fade-in">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Verificación de Identidad
              </h3>
              <p className="text-gray-600 text-sm">
                Ingresa el número de identificación para continuar el registro.
              </p>
            </div>

            <div className="section-card space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  name="tipo_id"
                  value={formData.tipo_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800 bg-white"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                </select>
              </div>

              {/* Se asume que el componente Input ya maneja el estilo de los inputs */}
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
                <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl input-shadow">
                  <LoadingSpinner size="sm" text="" />
                  <span className="text-sm font-semibold">Verificando disponibilidad...</span>
                </div>
              )}

              {!cedulaValidation.isValidating && cedulaValidation.mensaje && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl input-shadow ${cedulaValidation.existe
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'
                    }`}
                >
                  {cedulaValidation.existe ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  <span className="text-sm font-semibold">{cedulaValidation.mensaje}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerificarCedula}
                disabled={cedulaValidation.isValidating || !formData.numero_id}
                className="w-full px-4 py-3 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(45deg, #10b981 0%, #059669 100%)' }}
              >
                Verificar y Continuar
              </button>

              <button
                type="button"
                onClick={() => navigate('/personas')}
                className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* ✅ PASO 2: Formulario completo (cédula verificada) - Rediseñado */}
        {cedulaVerificada && (
          <form onSubmit={handleSubmit} className="space-y-8 fade-in">
            {saveStatus === 'saving' && (
              <LoadingSpinner fullScreen text="Guardando persona..." />
            )}
            {saveStatus === 'success' && (
              <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-5">
                <CheckCircle2 className="w-20 h-20 text-emerald-600 animate-pulse" />
                <p className="text-xl font-extrabold text-gray-800">¡Guardado con éxito!</p>
              </div>
            )}

            {/* Header compacto (Fijo en la parte superior) */}
            <div className="flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10 p-4 rounded-xl shadow-md">
              <button
                type="button"
                onClick={() => navigate('/personas')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Volver al Listado</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-3 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(45deg, #10b981 0%, #059669 100%)' }}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Persona
              </button>
            </div>

            {/* Contenido del Formulario en Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna 1: Foto e Identificación */}
              <div className="lg:col-span-1 space-y-8">
                {/* Foto */}
                <div className="section-card fade-in" style={{ animationDelay: '0.1s' }}>
                  <h3 className="font-extrabold text-xl text-gray-900 mb-4 flex items-center gap-2">
                    📸 Foto de Perfil
                  </h3>
                  <FotoUploader
                    value={formData.url_foto || null}
                    onChange={(url) => setFormData((prev) => ({ ...prev, url_foto: url }))}
                  />
                </div>

                {/* Identificación (resumida) */}
                <div className="section-card fade-in" style={{ animationDelay: '0.2s' }}>
                  <h3 className="font-extrabold text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    Identificación Verificada
                  </h3>
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <span className="text-gray-600 font-medium">Tipo:</span>{' '}
                      <span className="font-bold text-gray-800">{formData.tipo_id}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600 font-medium">Número:</span>{' '}
                      <span className="font-bold text-gray-800">{formData.numero_id}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna 2: Datos Personales y Contacto */}
              <div className="lg:col-span-2 space-y-8">
                {/* Datos Personales */}
                <div className="section-card fade-in" style={{ animationDelay: '0.3s' }}>
                  <h3 className="font-extrabold text-xl text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-6 h-6 text-emerald-600" />
                    Datos Personales
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="mt-6">
                    <Input
                      label="Segundo Apellido"
                      name="segundo_apellido"
                      value={formData.segundo_apellido || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Input
                      label="Fecha Nacimiento *"
                      name="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      error={errors.fecha_nacimiento}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Género *
                      </label>
                      <select
                        name="genero"
                        value={formData.genero}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800 bg-white"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estado Civil *
                    </label>
                    <select
                      name="estado_civil"
                      value={formData.estado_civil}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800 bg-white"
                    >
                      <option value="Soltero(a)">Soltero(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Uni�n Libre">Uni�n Libre</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viudo">Viudo</option>
                    </select>
                  </div>
                </div>

                {/* Contacto */}
                <div className="section-card fade-in" style={{ animationDelay: '0.4s' }}>
                  <h3 className="font-extrabold text-xl text-gray-900 mb-6 flex items-center gap-2">
                    📞 Contacto
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                {/* Ubicación */}
                <div className="section-card fade-in" style={{ animationDelay: '0.5s' }}>
                  <h3 className="font-extrabold text-xl text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    Ubicación
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Departamento *
                      </label>
                      {/* Se asume que SelectDepartamento ya tiene los estilos de input-shadow */}
                      <SelectDepartamento
                        value={formData.departamento}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, departamento: value, municipio: '' }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800 bg-white"
                      />
                      {errors.departamento && (
                        <p className="text-red-500 text-xs mt-1">{errors.departamento}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Municipio *
                      </label>
                      {/* Se asume que SelectMunicipio ya tiene los estilos de input-shadow */}
                      <SelectMunicipio
                        departamento={formData.departamento}
                        value={formData.municipio}
                        onChange={(value) => setFormData((prev) => ({ ...prev, municipio: value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800 bg-white"
                      />
                      {errors.municipio && (
                        <p className="text-red-500 text-xs mt-1">{errors.municipio}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Input
                      label="Dirección"
                      name="direccion"
                      value={formData.direccion || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mt-6">
                    <Input
                      label="Barrio"
                      name="barrio"
                      value={formData.barrio || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fila 2: Educación y Espiritual */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Educación */}
              <div className="section-card fade-in" style={{ animationDelay: '0.6s' }}>
                <h3 className="font-extrabold text-xl text-gray-900 mb-6 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-emerald-600" />
                  Educación y Ocupación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nivel Educativo
                    </label>
                    <select
                      name="nivel_educativo"
                      value={formData.nivel_educativo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800 bg-white"
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

              {/* Espiritual */}
              <div className="section-card fade-in" style={{ animationDelay: '0.7s' }}>
                <h3 className="font-extrabold text-xl text-gray-900 mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-emerald-600" />
                  Información Espiritual
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bautismo */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl input-shadow cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                      <input
                        type="checkbox"
                        name="bautizado"
                        checked={formData.bautizado}
                        onChange={handleChange}
                        className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-base font-medium text-gray-700">¿Está bautizado?</span>
                    </label>

                    {formData.bautizado && (
                      <div className="fade-in">
                        <Input
                          label="Fecha de Bautismo"
                          name="fecha_bautismo"
                          type="date"
                          value={formData.fecha_bautismo || ''}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                  </div>

                  {/* Taller del Maestro */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl input-shadow cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                      <input
                        type="checkbox"
                        name="taller_maestro"
                        checked={formData.taller_maestro}
                        onChange={handleChange}
                        className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-base font-medium text-gray-700">¿Taller del Maestro?</span>
                    </label>

                    {formData.taller_maestro && (
                      <div className="fade-in">
                        <Input
                          label="Fecha del Taller"
                          name="fecha_taller_maestro"
                          type="date"
                          value={formData.fecha_taller_maestro || ''}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Ministerios */}
                {ministerios.length > 0 && (
                  <div className="mt-6 fade-in">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Ministerios
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {ministerios.map((m) => (
                        <label
                          key={m.id}
                          className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200 ${ministeriosSeleccionados.includes(m.id)
                            ? 'bg-emerald-100 border-2 border-emerald-500 font-semibold'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={ministeriosSeleccionados.includes(m.id)}
                            onChange={() => handleMinisterioToggle(m.id)}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{m.nombre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 fade-in">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl input-shadow cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                    <input
                      type="checkbox"
                      name="es_formador"
                      checked={!!formData.es_formador}
                      onChange={handleChange}
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-base font-medium text-gray-700">¿Apta(o) para formador?</span>
                  </label>
                </div>

                <div className="mt-6 fade-in">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Escalas de Crecimiento
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    El avance de escalas se gestiona ahora desde el módulo de Seguimiento.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones finales (Rediseñados) */}
            <div className="flex gap-4 pt-6 justify-end fade-in" style={{ animationDelay: '0.8s' }}>
              <button
                type="button"
                onClick={() => navigate('/personas')}
                disabled={loading}
                className="px-8 py-3 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(45deg, #10b981 0%, #059669 100%)' }}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Persona'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}


