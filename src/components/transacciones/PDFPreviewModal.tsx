import React from 'react'
import { X } from 'lucide-react'
import { PDFViewer } from '@react-pdf/renderer'
import { Button } from '@/components/ui/Button'
import { ComprobantePDF } from './ComprobantePDF'
import { TransaccionCompleta } from '@/types/transacciones'

interface PDFPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    transaccion?: TransaccionCompleta | null
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ isOpen, onClose, transaccion }) => {
    if (!transaccion) return null

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ${!isOpen ? 'hidden' : ''}`}>
            <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Vista Previa del Comprobante</h3>
                        <p className="text-sm text-gray-500">
                            Transacción {transaccion.numero_transaccion}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 bg-gray-100 p-4 overflow-hidden">
                    <PDFViewer width="100%" height="100%" className="rounded-lg shadow-inner border border-gray-200">
                        <ComprobantePDF transaccion={transaccion} />
                    </PDFViewer>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <Button variant="secondary" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    )
}
