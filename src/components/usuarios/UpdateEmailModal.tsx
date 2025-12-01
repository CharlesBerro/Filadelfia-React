import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, AlertTriangle } from 'lucide-react'

interface UpdateEmailModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (newEmail: string) => Promise<void>
    currentEmail: string
    isLoading: boolean
}

export const UpdateEmailModal: React.FC<UpdateEmailModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    currentEmail,
    isLoading
}) => {
    const [newEmail, setNewEmail] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newEmail && newEmail !== currentEmail) {
            await onConfirm(newEmail)
            setNewEmail('')
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Actualizar Correo Electrónico"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium">Advertencia</p>
                        <p className="mt-1">
                            Cambiar el correo electrónico actualizará las credenciales de acceso del usuario.
                            Asegúrese de que el nuevo correo sea válido.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Actual
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            name="currentEmail"
                            value={currentEmail}
                            disabled
                            className="pl-10 bg-gray-50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nuevo Correo
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            name="newEmail"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="nuevo@ejemplo.com"
                            className="pl-10"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || !newEmail || newEmail === currentEmail}
                    >
                        {isLoading ? 'Actualizando...' : 'Actualizar Correo'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
