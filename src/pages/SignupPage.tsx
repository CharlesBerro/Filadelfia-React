import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { validators } from '@/utils/validators'
import { AuthService } from '@/services/auth.service'

export const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  
  // Estados
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; nombre?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: any = {}

    const emailError = validators.email(email)
    if (emailError) newErrors.email = emailError

    const passwordError = validators.password(password)
    if (passwordError) newErrors.password = passwordError

    const nombresError = validators.nombres(nombre)
    if (nombresError) newErrors.nombre = nombresError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setSuccessMessage('')

    // Validar
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Conectar a Supabase
      await AuthService.signup(email, password, nombre)

      setSuccessMessage('Cuenta creada. Verifica tu email para confirmar.')
      
      // Limpiar formulario
      setEmail('')
      setPassword('')
      setNombre('')

      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (error: any) {
      console.error('Error:', error)
      
      if (error.message.includes('already registered')) {
        setGeneralError('Este email ya está registrado')
      } else {
        setGeneralError(error.message || 'Error al registrar')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
          <p className="text-gray-600">FiladelFia</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error General */}
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {generalError}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {/* Nombre Input */}
          <Input
            label="Nombre"
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={setNombre}
            error={errors.nombre}
            required
          />

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
            Registrarse
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>¿Ya tienes cuenta? <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">Inicia sesión</button></p>
        </div>
      </Card>
    </div>
  )
}