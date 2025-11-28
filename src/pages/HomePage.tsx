import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Building2, LogIn, Info } from 'lucide-react'

export const HomePage: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F0FDF4] relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none">Iglesia Filadelfia</h1>
            <p className="text-xs text-gray-500">Gestión Congregacional</p>
          </div>
        </div>

        {!user && (
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <LogIn className="w-4 h-4" />
            Iniciar Sesión
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          Bienvenido a la <br />
          <span className="text-green-600">Plataforma Filadelfia</span>
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Una herramienta moderna y completa para la gestión congregacional,
          diseñada para fortalecer nuestra comunidad cristiana y optimizar nuestros
          procesos administrativos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-green-200 flex items-center justify-center gap-2"
            >
              Acceder al Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-green-200 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Acceder al Sistema
              </button>

              <button
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-3.5 rounded-lg font-semibold text-lg transition-all hover:border-green-200 hover:text-green-700 flex items-center justify-center gap-2 shadow-sm"
              >
                <Info className="w-5 h-5" />
                Conocer Más
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}