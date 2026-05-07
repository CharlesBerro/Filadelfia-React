import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MailCheck } from 'lucide-react'

interface VerifyUserEmailModalProps {
  isOpen: boolean
  email: string
  isLoading: boolean
  isResending: boolean
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  onCancel: () => void
}

export const VerifyUserEmailModal: React.FC<VerifyUserEmailModalProps> = ({
  isOpen,
  email,
  isLoading,
  isResending,
  onVerify,
  onResend,
  onCancel,
}) => {
  const [code, setCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim().length < 6) return
    await onVerify(code.trim())
    setCode('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Verificar correo"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex gap-3">
          <MailCheck className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <p className="font-medium">Verificacion enviada</p>
            <p className="mt-1">
              Si el correo incluye codigo, ingresalo aqui. Si recibes un enlace, abre el enlace para confirmar la cuenta de <span className="font-semibold">{email}</span>.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Codigo de verificacion
          </label>
          <Input
            name="verificationCode"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="text-center tracking-[0.35em] font-semibold"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onResend} disabled={isLoading || isResending}>
            {isResending ? 'Reenviando...' : 'Reenviar correo'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || code.length < 6}>
            {isLoading ? 'Verificando...' : 'Verificar y crear'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
