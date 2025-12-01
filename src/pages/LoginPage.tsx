import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { validators } from '@/utils/validators'
import { useAuthStore } from '@/stores/auth.store'
import { AuthService } from '@/services/auth.service'
import { Building2, CheckCircle2 } from 'lucide-react'

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


      // Redirigir a dashboard
      navigate('/dashboard')

    } catch (error: any) {

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
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-green-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1746&q=80"
            alt="Congregation"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-blue-900/90" />
        </div>

        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Building2 className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Bienvenido a la <br />
              Plataforma Filadelfia
            </h1>
            <p className="text-lg text-green-100 max-w-md">
              Organizando y fortaleciendo nuestra comunidad cristiana con herramientas modernas de gestión.
            </p>

            <div className="space-y-4 pt-4">
              {[
                'Gestión de miembros y visitantes',
                'Control de escalas de crecimiento',
                'Reportes y estadísticas'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-green-50">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-green-200/60">
            © {new Date().getFullYear()} Iglesia Filadelfia. Todos los derechos reservados.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl lg:shadow-none lg:bg-transparent">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="mt-2 text-gray-600">
              Accede a tu cuenta para gestionar los datos de las personas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error General */}
            {generalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span className="block sm:inline">{generalError}</span>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />

              <div>
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
                <div className="flex justify-end mt-1">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Recordarme
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              className="h-12 text-base"
            >
              {isLoading ? 'Iniciando Sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            <p>¿Problemas para acceder? Contacta al administrador del sistema</p>
          </div>
        </div>
      </div>
    </div>
  )
}