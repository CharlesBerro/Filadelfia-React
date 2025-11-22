import React from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface SavingOverlayProps {
    isLoading: boolean
    isSuccess: boolean
    loadingText?: string
    successText?: string
}

/**
 * Componente de overlay moderado para mostrar estado de guardado
 * con spinner giratorio y mensaje de éxito con chulo verde
 */
export const SavingOverlay: React.FC<SavingOverlayProps> = ({
    isLoading,
    isSuccess,
    loadingText = 'Guardando...',
    successText = 'Guardado exitosamente',
}) => {
    if (!isLoading && !isSuccess) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm animate-in fade-in zoom-in duration-200">
                {isLoading && (
                    <>
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <Loader2 className="w-20 h-20 text-green-600 animate-spin absolute -top-2 -left-2" />
                        </div>
                        <p className="text-lg font-semibold text-gray-800">{loadingText}</p>
                    </>
                )}

                {isSuccess && !isLoading && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <p className="text-lg font-semibold text-green-700">{successText}</p>
                    </>
                )}
            </div>
        </div>
    )
}
