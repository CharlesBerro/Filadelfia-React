// pages/NuevaTransaccionPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { TransaccionForm } from '@/components/transacciones/TransaccionForm'
import { TransaccionesService } from '@/services/transacciones.service'
import { useTransaccionesStore } from '@/stores/transacciones.store'
import { ArrowLeft, Receipt } from 'lucide-react'
import type { TransaccionCreate } from '@/types/transacciones'
import { SavingOverlay } from '@/components/ui/SavingOverlay'
/**
 * Página para registrar nueva transacción
 */
export const NuevaTransaccionPage: React.FC = () => {
    const navigate = useNavigate()
    const { addTransaccion } = useTransaccionesStore()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (data: TransaccionCreate) => {
        setIsLoading(true)
        setIsSuccess(false)
        setError(null)

        try {
            const nuevaTransaccion = await TransaccionesService.crear(data)
            addTransaccion(nuevaTransaccion)
            setIsSuccess(true)
            setTimeout(() => {
                navigate('/transacciones')
            }, 1500)
        } catch (error: any) {
            setError(error.message || 'Error al crear transacción')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        navigate('/transacciones')
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
                                <h1 className="text-3xl font-bold text-gray-900">Registrar Nuevo Movimiento</h1>
                                <p className="text-sm text-gray-600">
                                    Complete todos los campos requeridos para registrar la transacción
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
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
            {/* ← NUEVO: Overlay de guardado */}
            <SavingOverlay
                isLoading={isLoading}
                isSuccess={isSuccess}
                loadingText="Guardando transacción..."
                successText="¡Transacción creada exitosamente!"
            />
        </Layout>
    )
}
