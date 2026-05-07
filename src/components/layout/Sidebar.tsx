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
  Building2,
  FileText,
  GraduationCap,
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
  const canViewAccounting = user?.role === 'admin' || user?.role === 'lider'

  const [expandedModules, setExpandedModules] = useState<string[]>(['personas', 'contabilidad'])

  const toggleModule = (moduleLabel: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleLabel)
        ? prev.filter((m) => m !== moduleLabel)
        : [...prev, moduleLabel]
    )
  }

  const modules: MenuModule[] = [
    {
      label: 'personas',
      icon: Users,
      items: [
        { icon: Users, label: 'Listado', path: '/personas' },
        { icon: FileText, label: 'Informes', path: '/personas/reportes' },
        { icon: GraduationCap, label: 'Seguimiento', path: '/seguimiento' },
        { icon: BarChart3, label: 'Reporte Seguimiento', path: '/seguimiento/reportes' },
      ],
    },
    ...(canViewAccounting
      ? [{
        label: 'contabilidad',
        icon: TrendingUp,
        items: [
          { icon: Receipt, label: 'Transacciones', path: '/transacciones' },
          { icon: Plus, label: 'Nueva Transaccion', path: '/transacciones/nueva' },
          { icon: Activity, label: 'Actividades', path: '/actividades' },
          { icon: Tag, label: 'Categorias', path: '/categorias' },
          { icon: BarChart3, label: 'Reportes', path: '/reportes' },
        ],
      }]
      : []),
  ]

  const singleItems = [{ icon: Home, label: 'Dashboard', path: '/dashboard' }]

  const adminItems = [
    { icon: Users, label: 'Usuarios', path: '/usuarios' },
    { icon: Building2, label: 'Sedes', path: '/sedes' },
    { icon: Settings, label: 'Administracion', path: '/admin' },
  ]

  const isActive = (path: string) => {
    if (location.pathname === path) return true
    if (path === '/transacciones') return location.pathname === '/transacciones'
    return location.pathname.startsWith(path + '/')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-gradient-to-br from-green-600 via-green-600 to-green-600 shadow-lg lg:shadow-none lg:border-r lg:border-green-300 transform transition-transform duration-300 z-40 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="p-6 space-y-6 pt-16 lg:pt-6">
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">FiladelFia</h2>
            <p className="text-xs text-white/80 mt-1">{user?.full_name}</p>
          </div>

          <nav className="space-y-1">
            {singleItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active ? 'bg-white text-green-700 shadow-lg font-semibold' : 'text-white hover:bg-white/20 shine-effect'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}

            {modules.map((module) => {
              const ModuleIcon = module.icon
              const isExpanded = expandedModules.includes(module.label)
              const hasActiveItem = module.items.some((item) => isActive(item.path))
              return (
                <div key={module.label} className="space-y-1">
                  <button
                    onClick={() => toggleModule(module.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${hasActiveItem && !isExpanded ? 'bg-white/30 text-white' : 'text-white hover:bg-white/20 shine-effect'}`}
                  >
                    <div className="flex items-center gap-3">
                      <ModuleIcon className="w-5 h-5" />
                      <span className="font-medium capitalize">{module.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-4 space-y-1 pt-1">
                      {module.items.map((item) => {
                        const ItemIcon = item.icon
                        const active = isActive(item.path)
                        return (
                          <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${active ? 'bg-white text-green-700 shadow-md font-semibold' : 'text-white hover:bg-white/20 shine-effect'}`}
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

            {user?.role === 'admin' && (
              <>
                <div className="border-t border-white/30 my-4" />
                {adminItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active ? 'bg-white text-green-700 shadow-lg font-semibold' : 'text-white hover:bg-white/20 shine-effect'}`}
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
