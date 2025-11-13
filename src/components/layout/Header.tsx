import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { AuthService } from '@/services/auth.service'
import { LogOut, Menu } from 'lucide-react'

interface HeaderProps {
  onMenuToggle: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logout:', error)
      logout()
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-green-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo + Menú Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-green-100 rounded-lg transition"
          >
            <Menu className="w-6 h-6 text-green-600" />
          </button>

          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 text-transparent bg-clip-text hidden sm:block">
            FiladelFia
          </h1>
        </div>

        {/* Perfil + Logout */}
        <div className="flex items-center gap-4">
          {/* Info Usuario */}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900">
              {user?.full_name}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center text-white font-bold text-lg">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}