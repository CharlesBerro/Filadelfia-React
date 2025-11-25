import React, { useState } from 'react'
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
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
    <>
      {/* Modal de Confirmación de Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">¿Cerrar sesión?</h3>
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro que deseas salir del sistema? Tendrás que iniciar sesión nuevamente para acceder.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Sí, cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-30">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-1.5 rounded-lg">
                <span className="text-white font-bold text-xl leading-none">F</span>
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">
                Filadelfia
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">
                {user?.email}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {user?.role || 'Usuario'}
              </span>
            </div>

            <button
              onClick={handleLogoutClick}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}