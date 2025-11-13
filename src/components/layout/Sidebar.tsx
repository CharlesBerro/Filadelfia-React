import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import {
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
  Home,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Personas', path: '/personas' },
    { icon: TrendingUp, label: 'Transacciones', path: '/transacciones' },
    { icon: Activity, label: 'Actividades', path: '/actividades' },
    { icon: BarChart3, label: 'Reportes', path: '/reportes' },
  ]

  const adminItems = [
    { icon: Settings, label: 'Administración', path: '/admin' },
  ]

  const isActive = (path: string) => location.pathname === path

  const items =
    user?.rol === 'admin' ? [...menuItems, ...adminItems] : menuItems

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose() // Cerrar sidebar en mobile
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30 slide-in-left"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
      className={`fixed lg:static top-0 left-0 h-screen w-64 bg-white shadow-lg lg:shadow-none lg:border-r lg:border-green-200 transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      >
        {/* Close button mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-primary-100 rounded-lg"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Contenido */}
        <div className="p-6 space-y-8 pt-16 lg:pt-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 text-transparent bg-clip-text">
              FiladelFia
            </h2>
            <p className="text-xs text-gray-500 mt-1">{user?.full_name}</p>
          </div>

          {/* Menú */}
          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    active
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-green-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}