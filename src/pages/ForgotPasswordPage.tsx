import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthService } from '@/services/auth.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            await AuthService.resetPasswordForEmail(email)
            setIsSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Error al enviar el correo de recuperación')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Correo Enviado!</h2>
                    <p className="text-gray-600 mb-6">
                        Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
                        Por favor revisa tu bandeja de entrada (y spam) para restablecer tu contraseña.
                    </p>
                    <Link to="/login">
                        <Button className="w-full">
                            Volver al Inicio de Sesión
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                    <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h2>
                    <p className="text-gray-500 mt-1">
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@filadelfia.com"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
