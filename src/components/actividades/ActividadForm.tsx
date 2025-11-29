// src/components/actividades/ActividadForm.tsx
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ActividadCreate } from '@/types'
import { Button } from '@/components/ui/Button'
import { SavingOverlay } from '@/components/ui/SavingOverlay'
import { Calendar, Target, FileText } from 'lucide-react'

interface ActividadFormProps {
    initialData?: Partial<ActividadCreate> & { id?: string }
    onSubmit: (data: ActividadCreate) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export const ActividadForm = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading: externalLoading = false,
}: ActividadFormProps) => {
    const [isSuccess, setIsSuccess] = useState(false)
    const [internalLoading, setInternalLoading] = useState(false)
    const isLoading = externalLoading || internalLoading

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ActividadCreate>({
        defaultValues: initialData || {
            nombre: '',
            descripcion: '',
            meta: 0,
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin: '',
            estado: 'planeada',
        },
    })

    const handleFormSubmit = async (data: ActividadCreate) => {
        try {
            setInternalLoading(true)
            await onSubmit(data)
            setIsSuccess(true)
            setTimeout(() => setInternalLoading(false), 1500)
        } catch (e) {
            setInternalLoading(false)
        }
    }

    return (
        <>
            <SavingOverlay
                isLoading={isLoading && !isSuccess}
                isSuccess={isSuccess}
                loadingText={initialData ? 'Actualizando actividad...' : 'Creando actividad...'}
                successText={initialData ? 'Actividad actualizada' : 'Actividad creada'}
            />

            <form id="activity-form" onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden">

                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-green-700 to-green-500 text-white px-6 py-4 flex items-center gap-3 shadow-md">
                        <Target className="w-6 h-6 opacity-90" />
                        <h2 className="text-lg font-semibold tracking-wide">
                            {initialData ? 'Editar Actividad' : 'Nueva Actividad'}
                        </h2>
                    </div>

                    {/* CONTENIDO */}
                    <div className="p-6 space-y-8 bg-white">

                        {/* INFORMACIÓN GENERAL */}
                        <div>
                            <h3 className="section-title flex items-center gap-2"><FileText className="w-4 h-4" /> Información general</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                                <div className="form-group">
                                    <label className="label">Nombre <span className="text-red-500">*</span></label>
                                    <input
                                        {...register('nombre', {
                                            required: 'El nombre es requerido',
                                            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                                        })}
                                        type="text"
                                        className="input"
                                        placeholder="Ej: Compra de Piano"
                                        disabled={isLoading}
                                    />
                                    {errors.nombre && <p className="error-text">{errors.nombre.message}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="label">Meta (pesos) <span className="text-red-500">*</span></label>
                                    <input
                                        {...register('meta', {
                                            required: 'Requerido',
                                            min: { value: 1, message: 'Debe ser mayor a 0' },
                                            valueAsNumber: true,
                                        })}
                                        type="number"
                                        step="1000"
                                        className="input"
                                        placeholder="700000"
                                        disabled={isLoading}
                                    />
                                    {errors.meta && <p className="error-text">{errors.meta.message}</p>}
                                </div>
                            </div>

                            <div className="form-group mt-4">
                                <label className="label">Descripción</label>
                                <textarea
                                    {...register('descripcion')}
                                    rows={2}
                                    className="input resize-none"
                                    placeholder="Describe la actividad..."
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* FECHAS */}
                        <div>
                            <h3 className="section-title flex items-center gap-2"><Calendar className="w-4 h-4" /> Fechas</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-3">
                                <div className="form-group">
                                    <label className="label">Inicio <span className="text-red-500">*</span></label>
                                    <input
                                        {...register('fecha_inicio', { required: 'Requerido' })}
                                        type="date"
                                        className="input"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Fin (opcional)</label>
                                    <input
                                        {...register('fecha_fin')}
                                        type="date"
                                        className="input"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Estado <span className="text-red-500">*</span></label>
                                    <select
                                        {...register('estado', { required: 'Requerido' })}
                                        className="input"
                                        disabled={isLoading}
                                    >
                                        <option value="planeada">Planeada</option>
                                        <option value="en_curso">En Curso</option>
                                        <option value="completada">Completada</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 shadow-inner">
                        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : initialData?.id ? 'Actualizar' : 'Crear'}
                        </Button>
                    </div>
                </div>
            </form>

            <style>{`
        .section-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
        }
        .form-group { display: flex; flex-direction: column; }
        .label {
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 3px;
          color: #374151;
        }
        .input {
          padding: 0.55rem 0.65rem;
          border: 1px solid #d1d5db;
          border-radius: 0.6rem;
          font-size: 0.87rem;
          background: #f9fafb;
          transition: 0.15s ease;
        }
        .input:focus {
          background: white;
          outline: none;
          border-color: #52d120ff;
          box-shadow: 0 0 0 1px #2563eb33;
        }
        .error-text {
          color: #dc2626;
          font-size: 0.75rem;
          margin-top: 2px;
        }
      `}</style>
        </>
    )
}
