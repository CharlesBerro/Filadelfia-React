import React, { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { validators } from '@/utils/validators'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'


export const LoginPage: React.FC = () => {
  // Estados
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const navigate = useNavigate()

  // Obtener funciones del store
  const { setUser, setToken } = useAuthStore()

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}

    const emailError = validators.email(email)
    if (emailError) newErrors.email = emailError

    const passwordError = validators.password(password)
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')

    // Validar
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // AQUÍ CONECTAREMOS SUPABASE DESPUÉS
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Simulación de usuario logueado
      const mockUser = {
        id: '123',
        email: email,
        nombre: 'Usuario',
        apellido: 'Test',
        rol: 'usuario' as const,
        sede: 'Sede Principal',
        created_at: new Date().toISOString(),
      }

      // Guardar en store
      setUser(mockUser)
      setToken('mock-token-' + Date.now())

      // Mostrar éxito
      console.log('✅ Login exitoso (mock)')

      // Después usaremos React Router para esto
      navigate('/dashboard')

    } catch (error: any) {
      setGeneralError(error.message || 'Error al iniciar sesión')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen  from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FiladelFia</h1>
          <p className="text-gray-600">Gestión de Personas y Contabilidad</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error General */}
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {generalError}
            </div>
          )}

          {/* Email Input */}
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
            required
          />

          {/* Password Input */}
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            error={errors.password}
            required
          />

          {/* Botón Submit */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Iniciar Sesión
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo: Email y contraseña pueden ser cualquiera</p>
        </div>
      </Card>
    </div>
  )
}