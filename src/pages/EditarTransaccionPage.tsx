// pages/EditarTransaccionPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { TransaccionForm } from '@/components/transacciones/TransaccionForm'
import { TransaccionesService } from '@/services/transacciones.service'
import { useTransaccionesStore } from '@/stores/transacciones.store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ArrowLeft, Receipt } from 'lucide-react'
import type { TransaccionUpdate } from '@/types/transacciones'
import { SavingOverlay } from '@/components/ui/SavingOverlay'

/**
 * Página para editar transacción existente
 */
export const EditarTransaccionPage: React.FC = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { updateTransaccion } = useTransaccionesStore()
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [transaccion, setTransaccion] = useState<any>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (id) {
            cargarTransaccion()
        }
    }, [id])

    const cargarTransaccion = async () => {
        try {
            const data = await TransaccionesService.obtenerPorId(id!)

            // Verificar que no esté anulada
            if (data.estado === 'anulada') {
                setError('No se puede editar una transacción anulada')
                return
            }

            // Transformar datos para el formulario: extraer solo IDs de las relaciones
            const transaccionParaEditar = {
                fecha: data.fecha,
                tipo: data.tipo,
                monto: data.monto,
                categoria_id: data.categoria_id,
                actividad_id: data.actividad_id || '',
                persona_id: data.persona_id || '',
                descripcion: data.descripcion || '',
                evidencia: data.evidencia || '',
            }

            setTransaccion(transaccionParaEditar)
        } catch (error: any) {
            setError(error.message || 'Error al cargar transacción')
        } finally {
            setIsLoadingData(false)
        }
    }

    const handleSubmit = async (data: TransaccionUpdate) => {
        if (!id) return

        setIsLoading(true)
        setError(null)

        try {
            const transaccionActualizada = await TransaccionesService.actualizar(id, data)
            updateTransaccion(id, transaccionActualizada)
            setIsSuccess(true)
            setTimeout(() => {
                navigate('/transacciones')
            }, 1500)
        } catch (error: any) {
            setError(error.message || 'Error al actualizar transacción')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        navigate('/transacciones')
    }

    if (isLoadingData) {
        return (
            <Layout>
                <LoadingSpinner fullScreen text="Cargando transacción..." />
            </Layout>
        )
    }

    if (error && !transaccion) {
        return (
            <Layout>
                <div className="min-h-full p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/transacciones')}
                            className="text-blue-600 hover:underline"
                        >
                            Volver al listado
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/transacciones')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver al listado
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Editar Transacción</h1>
                                <p className="text-sm text-gray-600">
                                    {transaccion?.numero_transaccion}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm font-medium">Error</p>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Formulario */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <TransaccionForm
                            initialData={transaccion}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
            <SavingOverlay
                isLoading={isLoading}
                isSuccess={isSuccess}
                loadingText="Actualizando transacción..."
                successText="¡Transacción actualizada exitosamente!"
            />
        </Layout>
    )
}
