// components/transacciones/TransaccionForm.tsx
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Search, Loader2 } from 'lucide-react'
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

/**
 * Formulario para crear/editar transacciones
 * 
 * Características:
 * - Selector de tipo (Ingreso/Egreso) que filtra categorías automáticamente
 * - Búsqueda de personas con debounce de 1 segundo
 * - Selector de actividad opcional
 * - Input de monto con formato visual en COP
 * - Validaciones completas
 */
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

    // Estados
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

    // Cargar categorías cuando cambia el tipo
    useEffect(() => {
        cargarCategorias()
    }, [tipoSeleccionado])

    // Cargar actividades al montar
    useEffect(() => {
        cargarActividades()
    }, [])

    // Búsqueda de persona con debounce
    useEffect(() => {
        if (personaSearch.length < 3) {
            setPersonas([])
            return
        }

        const timer = setTimeout(() => {
            buscarPersona()
        }, 1000) // 1 segundo de debounce

        return () => clearTimeout(timer)
    }, [personaSearch])

    const cargarCategorias = async () => {
        setLoadingCategorias(true)
        try {
            const { data, error } = await supabase
                .from('categorias')
                .select('*')
                .eq('tipo', tipoSeleccionado)
                .order('nombre')

            if (error) throw error
            setCategorias(data || [])
        } catch (error) {
            console.error('Error cargando categorías:', error)
        } finally {
            setLoadingCategorias(false)
        }
    }

    const cargarActividades = async () => {
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
            console.error('Error cargando actividades:', error)
        } finally {
            setLoadingActividades(false)
        }
    }

    const buscarPersona = async () => {
        setSearchingPersona(true)
        try {
            const { data, error } = await supabase
                .from('personas')
                .select('*')
                .or(`nombres.ilike.%${personaSearch}%,primer_apellido.ilike.%${personaSearch}%,segundo_apellido.ilike.%${personaSearch}%,numero_id.ilike.%${personaSearch}%`)
                .limit(10)

            if (error) throw error
            setPersonas(data || [])
        } catch (error) {
            console.error('Error buscando persona:', error)
        } finally {
            setSearchingPersona(false)
        }
    }

    const seleccionarPersona = (persona: Persona) => {
        setPersonaSeleccionada(persona)
        setValue('persona_id', persona.id)
        setPersonaSearch(`${persona.nombres} ${persona.primer_apellido} ${persona.segundo_apellido || ''}`.trim())
        setPersonas([])
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value)
    }

    const handleFormSubmit = async (data: TransaccionCreate) => {
        try {
            await onSubmit(data)
        } catch (error) {
            console.error('Error en formulario:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Fecha y Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha */}
                <div>
                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('fecha', {
                            required: 'La fecha es requerida',
                        })}
                        type="date"
                        id="fecha"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    {errors.fecha && (
                        <p className="mt-1 text-sm text-red-600">{errors.fecha.message}</p>
                    )}
                </div>

                {/* Tipo */}
                <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('tipo', {
                            required: 'El tipo es requerido',
                        })}
                        id="tipo"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    >
                        <option value="ingreso">Ingreso</option>
                        <option value="egreso">Egreso</option>
                    </select>
                    {errors.tipo && (
                        <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
                    )}
                </div>
            </div>

            {/* Categoría */}
            <div>
                <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría <span className="text-red-500">*</span>
                </label>
                {loadingCategorias ? (
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">Cargando categorías...</span>
                    </div>
                ) : (
                    <select
                        {...register('categoria_id', {
                            required: 'La categoría es requerida',
                        })}
                        id="categoria_id"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                )}
                {errors.categoria_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoria_id.message}</p>
                )}
            </div>

            {/* Búsqueda de Persona */}
            <div>
                <label htmlFor="persona_search" className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Persona
                </label>
                <div className="relative">
                    <div className="relative">
                        <input
                            type="text"
                            id="persona_search"
                            value={personaSearch}
                            onChange={(e) => setPersonaSearch(e.target.value)}
                            placeholder="Nombre o documento..."
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        {searchingPersona && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-blue-500" />
                        )}
                    </div>

                    {/* Resultados de búsqueda */}
                    {personas.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {personas.map((persona) => (
                                <button
                                    key={persona.id}
                                    type="button"
                                    onClick={() => seleccionarPersona(persona)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                >
                                    <p className="font-medium text-gray-900">
                                        {persona.nombres} {persona.primer_apellido} {persona.segundo_apellido}
                                    </p>
                                    <p className="text-sm text-gray-500">{persona.numero_id}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    Escribe al menos 3 caracteres para buscar. La búsqueda se activa después de 1 segundo.
                </p>
            </div>

            {/* Actividad (opcional) */}
            <div>
                <label htmlFor="actividad_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Actividad (opcional)
                </label>
                {loadingActividades ? (
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">Cargando actividades...</span>
                    </div>
                ) : (
                    <select
                        {...register('actividad_id')}
                        id="actividad_id"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Monto */}
            <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
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
                    step="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25000"
                    disabled={isLoading}
                />
                {errors.monto && (
                    <p className="mt-1 text-sm text-red-600">{errors.monto.message}</p>
                )}
                {montoValue > 0 && (
                    <p className="mt-2 text-lg font-semibold text-green-600">
                        Monto: {formatCurrency(montoValue)}
                    </p>
                )}
            </div>

            {/* Descripción */}
            <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                </label>
                <textarea
                    {...register('descripcion')}
                    id="descripcion"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detalles de la transacción..."
                    disabled={isLoading}
                />
            </div>

            {/* URL de Evidencia */}
            <div>
                <label htmlFor="evidencia" className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Evidencia (opcional)
                </label>
                <input
                    {...register('evidencia')}
                    type="url"
                    id="evidencia"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/recibo.pdf"
                    disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                    URL del recibo, factura o comprobante
                </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        initialData?.id ? 'Actualizar Transacción' : 'Registrar Transacción'
                    )}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    )
}
