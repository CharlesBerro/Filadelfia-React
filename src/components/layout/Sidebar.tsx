import React, { useState } from 'react'
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
  Tag,
  ChevronDown,
  ChevronRight,
  Plus,
  Receipt,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  icon: any
  label: string
  path: string
}

interface MenuModule {
  label: string
  icon: any
  items: MenuItem[]
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  // Estado para módulos expandidos
  const [expandedModules, setExpandedModules] = useState<string[]>(['contabilidad'])

  const toggleModule = (moduleLabel: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleLabel)
        ? prev.filter(m => m !== moduleLabel)
        : [...prev, moduleLabel]
    )
  }

  // Módulos organizados
  const modules: MenuModule[] = [
    {
      label: 'personas',
      icon: Users,
      items: [
        { icon: Users, label: 'Listado', path: '/personas' },
      ]
    },
    {
      label: 'contabilidad',
      icon: TrendingUp,
      items: [
        { icon: Receipt, label: 'Transacciones', path: '/transacciones' },
        { icon: Plus, label: 'Nueva Transacción', path: '/transacciones/nueva' },
        { icon: Activity, label: 'Actividades', path: '/actividades' },
        { icon: Tag, label: 'Categorías', path: '/categorias' },
        { icon: BarChart3, label: 'Reportes', path: '/reportes' },
      ]
    },
  ]

  const singleItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
  ]

  const adminItems = [
    { icon: Settings, label: 'Administración', path: '/admin' },
  ]

  // Función mejorada para evitar que ambos botones se marquen
  const isActive = (path: string) => {
    if (location.pathname === path) return true

    // Para /transacciones, solo activo si estamos EXACTAMENTE en esa ruta
    if (path === '/transacciones') {
      return location.pathname === '/transacciones'
    }

    // Para otras rutas normales
    return location.pathname.startsWith(path + '/')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-gradient-to-b from-green-50 to-white shadow-lg lg:shadow-none lg:border-r lg:border-green-200 transform transition-transform duration-300 z-40 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Close button mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-green-100 rounded-lg transition"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Contenido */}
        <div className="p-6 space-y-6 pt-16 lg:pt-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 text-transparent bg-clip-text">
              FiladelFia
            </h2>
            <p className="text-xs text-gray-500 mt-1">{user?.full_name}</p>
          </div>

          {/* Menú */}
          <nav className="space-y-1">
            {/* Items individuales */}
            {singleItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-green-50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}

            {/* Módulos colapsables */}
            {modules.map((module) => {
              const ModuleIcon = module.icon
              const isExpanded = expandedModules.includes(module.label)
              const hasActiveItem = module.items.some(item => isActive(item.path))

              return (
                <div key={module.label} className="space-y-1">
                  {/* Header del módulo */}
                  <button
                    onClick={() => toggleModule(module.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${hasActiveItem && !isExpanded
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-green-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <ModuleIcon className="w-5 h-5" />
                      <span className="font-medium capitalize">{module.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                    )}
                  </button>

                  {/* Items del módulo con transición suave */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="pl-4 space-y-1 pt-1">
                      {module.items.map((item) => {
                        const ItemIcon = item.icon
                        const active = isActive(item.path)

                        return (
                          <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${active
                                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-green-50 hover:text-gray-900'
                              }`}
                          >
                            <ItemIcon className="w-4 h-4" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Items de admin */}
            {user?.rol === 'admin' && (
              <>
                <div className="border-t border-green-200 my-4" />
                {adminItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                          ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-green-50'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  )
}