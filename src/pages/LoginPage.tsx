import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { validators } from '@/utils/validators'
import { useAuthStore } from '@/stores/auth.store'
import { AuthService } from '@/services/auth.service'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  
  // Estados
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

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
      // CONECTAR A SUPABASE REAL
      const result = await AuthService.login(email, password)

      // Guardar en store
      setUser(result.user)
      setToken(result.token)

      console.log('✅ Login exitoso')

      // Redirigir a dashboard
      navigate('/dashboard')

    } catch (error: any) {
      console.error('Error:', error)
      
      // Mostrar error específico
      if (error.message.includes('Invalid login credentials')) {
        setGeneralError('Email o contraseña incorrectos')
      } else if (error.message.includes('User not found')) {
        setGeneralError('Usuario no registrado')
      } else {
        setGeneralError(error.message || 'Error al iniciar sesión')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
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
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          {/* Password Input */}
          <Input
            label="Contraseña"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <p>¿No tienes cuenta? <button onClick={() => navigate('/signup')} className="text-blue-600 hover:underline">Regístrate aquí</button></p>
        </div>
      </Card>
    </div>
  )
}