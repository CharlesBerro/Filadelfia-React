import React from 'react'
import { BarChart3, Users, FileText } from 'lucide-react'

interface ReportsLandingProps {
  onSelect: (view: 'accounting' | 'people' | 'export') => void
}

export const ReportsLanding: React.FC<ReportsLandingProps> = ({ onSelect }) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <span className="text-4xl">📊</span> Reportes y Estadísticas
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          ¡Hola! Aquí puedes consultar tus reportes y estadísticas de tu aplicación.
          Selecciona el módulo que deseas analizar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onSelect('accounting')}
          className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group text-center"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Contabilidad</h3>
          <p className="text-gray-500">Ingresos, egresos, flujo de caja y balances financieros.</p>
        </button>

        <button
          onClick={() => onSelect('people')}
          className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group text-center"
        >
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Personas</h3>
          <p className="text-gray-500">Estadísticas de miembros, crecimiento y demografía.</p>
        </button>

        <button
          onClick={() => onSelect('export')}
          className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group text-center"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Exportar Datos</h3>
          <p className="text-gray-500">Descarga reportes detallados en PDF y Excel.</p>
        </button>
      </div>
    </div>
  )
}
