import React, { useState, useEffect, useCallback } from 'react'
import { useForm, UseFormRegister, UseFormWatch } from 'react-hook-form'
import { Search, Loader2, ArrowUpCircle, ArrowDownCircle, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import type { TransaccionCreate, TransaccionUpdate } from '@/types/transacciones'
import type { Categoria, Persona } from '@/types'
import type { ActividadConMeta } from '@/types/transacciones'

interface TransaccionFormProps {
    initialData?: TransaccionUpdate & { id?: string }
    onSubmit: (data: TransaccionCreate | TransaccionUpdate) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

// Estilos CSS personalizados para el gradiente y la sombra de los inputs
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
.btn-ingreso-active {
    background: linear-gradient(45deg, #10b981 0%, #059669 100%); /* Gradiente verde corporativo */
    color: white;
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
}
.btn-egreso-active {
    background: linear-gradient(45deg, #ef4444 0%, #dc2626 100%); /* Gradiente rojo para egreso */
    color: white;
    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
}
.fade-in {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
`

// Componente para el selector de tipo (Ingreso/Egreso)
const TipoSelector: React.FC<{
    tipoSeleccionado: 'ingreso' | 'egreso'
    setValue: (name: 'tipo', value: 'ingreso' | 'egreso') => void
    disabled: boolean
}> = ({ tipoSeleccionado, setValue, disabled }) => {
    const isIngreso = tipoSeleccionado === 'ingreso'
    const isEgreso = tipoSeleccionado === 'egreso'

    const baseClasses = "flex items-center justify-center w-full py-3 rounded-xl font-bold transition-all duration-300 cursor-pointer text-gray-600 hover:bg-gray-100"
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : ""

    return (
        <div className="flex p-1 bg-gray-100 rounded-xl input-shadow">
            <button
                type="button"
                onClick={() => setValue('tipo', 'ingreso')}
                disabled={disabled}
                className={`${baseClasses} ${disabledClasses} ${isIngreso ? 'btn-ingreso-active' : ''}`}
            >
                <ArrowUpCircle className="w-5 h-5 mr-2" />
                Ingreso
                {isIngreso && <CheckCircle className="w-4 h-4 ml-2 text-white" />}
            </button>
            <button
                type="button"
                onClick={() => setValue('tipo', 'egreso')}
                disabled={disabled}
                className={`${baseClasses} ${disabledClasses} ${isEgreso ? 'btn-egreso-active' : ''}`}
            >
                <ArrowDownCircle className="w-5 h-5 mr-2" />
                Egreso
                {isEgreso && <CheckCircle className="w-4 h-4 ml-2 text-white" />}
            </button>
        </div>
    )
}

// Componente para el input de búsqueda de persona
const PersonaSearchInput: React.FC<{
    personaSearch: string
    setPersonaSearch: (value: string) => void
    searchingPersona: boolean
    personas: Persona[]
    seleccionarPersona: (persona: Persona) => void
    personaSeleccionada: Persona | null
    disabled: boolean
}> = ({ personaSearch, setPersonaSearch, searchingPersona, personas, seleccionarPersona, personaSeleccionada, disabled }) => {
    return (
        <div className="relative">
            <div className="relative">
                <input
                    type="text"
                    id="persona_search"
                    value={personaSearch}
                    onChange={(e) => setPersonaSearch(e.target.value)}
                    placeholder={personaSeleccionada ? `${personaSeleccionada.nombres} ${personaSeleccionada.primer_apellido}` : "Nombre o documento..."}
                    className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800"
                    disabled={disabled}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                {searchingPersona && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-emerald-500" />
                )}
                {personaSeleccionada && !searchingPersona && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
            </div>

            {/* Resultados de búsqueda */}
            {personas.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto fade-in">
                    {personas.map((persona) => (
                        <button
                            key={persona.id}
                            type="button"
                            onClick={() => seleccionarPersona(persona)}
                            className="w-full px-4 py-3 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-0 transition-colors duration-200"
                        >
                            <p className="font-semibold text-gray-900">
                                {persona.nombres} {persona.primer_apellido} {persona.segundo_apellido}
                            </p>
                            <p className="text-sm text-gray-500">ID: {persona.numero_id}</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {!searchingPersona && personaSearch.trim().length >= 3 && personas.length === 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 fade-in">
                    <p className="text-sm text-gray-600 text-center flex items-center justify-center">
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                        No se encuentra la persona "{personaSearch.trim()}"
                    </p>
                </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
                Escribe al menos 3 caracteres o termina con espacio para buscar.
            </p>
        </div>
    )
}

// Componente principal del formulario
export const TransaccionForm: React.FC<TransaccionFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}) => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TransaccionCreate>({
        defaultValues: initialData || {
            fecha: new Date().toISOString().split('T')[0],
            tipo: 'ingreso',
            monto: 0,
            categoria_id: '',
            descripcion: '',
            actividad_id: '',
            persona_id: '',
            evidencia: '',
        },
    })

    // Estados (Mismos que el original)
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [actividades, setActividades] = useState<ActividadConMeta[]>([])
    const [personas, setPersonas] = useState<Persona[]>([])
    const [loadingCategorias, setLoadingCategorias] = useState(false)
    const [loadingActividades, setLoadingActividades] = useState(false)
    const [searchingPersona, setSearchingPersona] = useState(false)
    const [personaSearch, setPersonaSearch] = useState('')
    const [personaSeleccionada, setPersonaSeleccionada] = useState<Persona | null>(null)

    // Watch tipo para filtrar categorías
    const tipoSeleccionado = watch('tipo')
    const montoValue = watch('monto')

    // Lógica de carga y búsqueda (Misma que el original)
    const cargarCategorias = useCallback(async () => {
        setLoadingCategorias(true)
        try {
            const { data, error } = await supabase
                .from('categorias')
                .select('*')
                .eq('tipo', tipoSeleccionado)
                .order('nombre')

            if (error) throw error
            setCategorias(data || [])
            // Si la categoría inicial no coincide con el nuevo tipo, la reseteamos
            if (initialData && initialData.categoria_id) {
                const initialCatExists = (data || []).some((cat: Categoria) => cat.id === initialData.categoria_id)
                if (!initialCatExists) {
                    setValue('categoria_id', '')
                }
            } else {
                setValue('categoria_id', '') // Resetear al cambiar de tipo
            }
        } catch (error) {
        } finally {
            setLoadingCategorias(false)
        }
    }, [tipoSeleccionado, initialData, setValue])

    const cargarActividades = useCallback(async () => {
        setLoadingActividades(true)
        try {
            const { data, error } = await supabase
                .from('actividades')
                .select('*')
                .in('estado', ['planeada', 'en_curso'])
                .order('nombre')

            if (error) throw error
            setActividades(data || [])
        } catch (error) {
        } finally {
            setLoadingActividades(false)
        }
    }, [])

    const buscarPersona = useCallback(async () => {
        setSearchingPersona(true)
        try {
            const searchTerm = personaSearch.trim()
            const { data, error } = await supabase
                .from('persona')
                .select('*')
                .or(`nombres.ilike.%${searchTerm}%,primer_apellido.ilike.%${searchTerm}%,segundo_apellido.ilike.%${searchTerm}%,numero_id.ilike.%${searchTerm}%`)
                .limit(10)

            if (error) throw error
            setPersonas(data || [])
        } catch (error) {
            setPersonas([])
        } finally {
            setSearchingPersona(false)
        }
    }, [personaSearch])

    const seleccionarPersona = (persona: Persona) => {
        setValue('persona_id', persona.id)
        setPersonaSeleccionada(persona)
        setPersonaSearch(`${persona.nombres} ${persona.primer_apellido} ${persona.segundo_apellido || ''}`.trim())
        setPersonas([])
    }

    // Effects (Mismos que el original)
    useEffect(() => {
        cargarCategorias()
    }, [tipoSeleccionado, cargarCategorias])

    useEffect(() => {
        cargarActividades()
    }, [cargarActividades])

    useEffect(() => {
        const shouldSearch = personaSearch.length >= 3 || (personaSearch.length > 0 && personaSearch.endsWith(' '))

        if (!shouldSearch) {
            setPersonas([])
            return
        }

        const timer = setTimeout(() => {
            buscarPersona()
        }, 1000) // 1 segundo de debounce

        return () => clearTimeout(timer)
    }, [personaSearch, buscarPersona])

    // Función de formato de moneda (Misma que el original)
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const handleFormSubmit = async (data: TransaccionCreate) => {
        try {
            await onSubmit(data)
        } catch (error) {
        }
    }

    // Renderizado del formulario rediseñado
    return (
        <>
            {/* Inyectar estilos personalizados */}
            <style>{customStyles}</style>

            <div className="max-w-4xl mx-auto p-6 md:p-10 card-gradient-bg rounded-3xl shadow-2xl fade-in">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                    {initialData?.id ? 'Actualizar Transacción' : 'Registrar Nueva Transacción'}
                </h2>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
                    {/* Sección 1: Tipo y Fecha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tipo (Selector de Botones) */}
                        <div className="fade-in">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Tipo de Transacción <span className="text-red-500">*</span>
                            </label>
                            <TipoSelector
                                tipoSeleccionado={tipoSeleccionado}
                                setValue={setValue}
                                disabled={isLoading}
                            />
                            {errors.tipo && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <XCircle className="w-4 h-4 mr-1" /> {errors.tipo.message}
                                </p>
                            )}
                        </div>

                        {/* Fecha */}
                        <div className="fade-in" style={{ animationDelay: '0.1s' }}>
                            <label htmlFor="fecha" className="block text-sm font-semibold text-gray-700 mb-3">
                                Fecha <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('fecha', {
                                    required: 'La fecha es requerida',
                                })}
                                type="date"
                                id="fecha"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800"
                                disabled={isLoading}
                            />
                            {errors.fecha && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <XCircle className="w-4 h-4 mr-1" /> {errors.fecha.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sección 2: Monto y Categoría */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Monto */}
                        <div className="fade-in" style={{ animationDelay: '0.2s' }}>
                            <label htmlFor="monto" className="block text-sm font-semibold text-gray-700 mb-3">
                                Monto <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('monto', {
                                    required: 'El monto es requerido',
                                    min: {
                                        value: 1,
                                        message: 'El monto debe ser mayor a 0',
                                    },
                                    valueAsNumber: true,
                                })}
                                type="number"
                                id="monto"
                                step="0.01"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800"
                                placeholder="Ej: 25000"
                                disabled={isLoading}
                            />
                            {errors.monto && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <XCircle className="w-4 h-4 mr-1" /> {errors.monto.message}
                                </p>
                            )}
                            {montoValue > 0 && (
                                <p className={`mt-3 text-xl font-extrabold ${tipoSeleccionado === 'ingreso' ? 'text-emerald-600' : 'text-red-600'} transition-colors duration-300`}>
                                    {formatCurrency(montoValue)}
                                </p>
                            )}
                        </div>

                        {/* Categoría */}
                        <div className="fade-in" style={{ animationDelay: '0.3s' }}>
                            <label htmlFor="categoria_id" className="block text-sm font-semibold text-gray-700 mb-3">
                                Categoría <span className="text-red-500">*</span>
                            </label>
                            {loadingCategorias ? (
                                <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 input-shadow">
                                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                    <span className="text-sm text-gray-600">Cargando categorías...</span>
                                </div>
                            ) : (
                                <select
                                    {...register('categoria_id', {
                                        required: 'La categoría es requerida',
                                    })}
                                    id="categoria_id"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800 bg-white"
                                    disabled={isLoading}
                                >
                                    <option value="">Seleccione una categoría ({tipoSeleccionado})</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.categoria_id && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <XCircle className="w-4 h-4 mr-1" /> {errors.categoria_id.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sección 3: Persona y Actividad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Búsqueda de Persona */}
                        <div className="fade-in" style={{ animationDelay: '0.4s' }}>
                            <label htmlFor="persona_search" className="block text-sm font-semibold text-gray-700 mb-3">
                                Persona Involucrada (Opcional)
                            </label>
                            <PersonaSearchInput
                                personaSearch={personaSearch}
                                setPersonaSearch={setPersonaSearch}
                                searchingPersona={searchingPersona}
                                personas={personas}
                                seleccionarPersona={seleccionarPersona}
                                personaSeleccionada={personaSeleccionada}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Actividad (opcional) */}
                        <div className="fade-in" style={{ animationDelay: '0.5s' }}>
                            <label htmlFor="actividad_id" className="block text-sm font-semibold text-gray-700 mb-3">
                                Actividad/Proyecto (Opcional)
                            </label>
                            {loadingActividades ? (
                                <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 input-shadow">
                                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                    <span className="text-sm text-gray-600">Cargando actividades...</span>
                                </div>
                            ) : (
                                <select
                                    {...register('actividad_id')}
                                    id="actividad_id"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800 bg-white"
                                    disabled={isLoading}
                                >
                                    <option value="">Ninguna</option>
                                    {actividades.map((act) => (
                                        <option key={act.id} value={act.id}>
                                            {act.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Sección 4: Descripción y Evidencia */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Descripción */}
                        <div className="fade-in" style={{ animationDelay: '0.6s' }}>
                            <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-700 mb-3">
                                Descripción
                            </label>
                            <textarea
                                {...register('descripcion')}
                                id="descripcion"
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800"
                                placeholder="Detalles de la transacción, motivo, etc."
                                disabled={isLoading}
                            />
                        </div>

                        {/* URL de Evidencia */}
                        <div className="fade-in" style={{ animationDelay: '0.7s' }}>
                            <label htmlFor="evidencia" className="block text-sm font-semibold text-gray-700 mb-3">
                                URL de Evidencia (Opcional)
                            </label>
                            <input
                                {...register('evidencia')}
                                type="url"
                                id="evidencia"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none input-shadow text-gray-800"
                                placeholder="https://ejemplo.com/recibo.pdf"
                                disabled={isLoading}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Enlace al recibo, factura o comprobante digital.
                            </p>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex gap-4 pt-6 justify-end fade-in" style={{ animationDelay: '0.8s' }}>
                        <Button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 shadow-md"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300"
                            style={{ background: 'linear-gradient(45deg, #10b981 0%, #059669 100%)' }}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Guardando...
                                </span>
                            ) : (
                                initialData?.id ? 'Actualizar Transacción' : 'Registrar Transacción'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    )
}
