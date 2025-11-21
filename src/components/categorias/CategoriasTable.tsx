// src/components/categorias/CategoriasTable.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CategoriasService } from '@/services/categorias.services'
import { useCategoriasStore } from '@/stores/categorias.store'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Edit2, Trash2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import type { Categoria } from '@/types'

/**
 * Tabla de Categorías
 * 
 * ¿Qué muestra?
 * - Lista de todas las categorías del usuario
 * - Filtro por tipo (todas/ingresos/egresos)
 * - Acciones: Editar y Eliminar
 * 
 * Características:
 * - Responsive (mobile-friendly)
 * - Modal de confirmación antes de eliminar
 * - Manejo de errores (FK constraint)
 */

export const CategoriasTable: React.FC = () => {
  const navigate = useNavigate()
  const { categorias, removeCategoria } = useCategoriasStore()

  // Estados locales
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'ingreso' | 'egreso'>('todas')
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)

  // Filtrar categorías según el tipo seleccionado
  const categoriasFiltradas =
    filtroTipo === 'todas'
      ? categorias
      : categorias.filter((c) => c.tipo === filtroTipo)

  // Abrir modal de confirmación
  const handleEliminarClick = (categoria: Categoria) => {
    setCategoriaAEliminar(categoria)
    setErrorEliminar(null)
    setShowDeleteModal(true)
  }

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    if (!categoriaAEliminar) return

    setDeleting(true)
    setErrorEliminar(null)

    try {
      await CategoriasService.eliminar(categoriaAEliminar.id)
      removeCategoria(categoriaAEliminar.id)
      setShowDeleteModal(false)
      setCategoriaAEliminar(null)
    } catch (error: any) {
      console.error('Error eliminando categoría:', error)
      // Mostrar error en el modal en lugar de cerrarlo
      setErrorEliminar(
        error.message || 'No se pudo eliminar la categoría'
      )
    } finally {
      setDeleting(false)
    }
  }

  // Cancelar eliminación
  const cancelarEliminar = () => {
    setShowDeleteModal(false)
    setCategoriaAEliminar(null)
    setErrorEliminar(null)
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filtrar:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroTipo('todas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtroTipo === 'todas'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas ({categorias.length})
            </button>
            <button
              onClick={() => setFiltroTipo('ingreso')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtroTipo === 'ingreso'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Ingresos ({categorias.filter((c) => c.tipo === 'ingreso').length})
            </button>
            <button
              onClick={() => setFiltroTipo('egreso')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtroTipo === 'egreso'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TrendingDown className="w-4 h-4 inline mr-1" />
              Egresos ({categorias.filter((c) => c.tipo === 'egreso').length})
            </button>
          </div>
        </div>
      </div>

      {/* Tabla Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden border border-green-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categoriasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay categorías
                  {filtroTipo !== 'todas' && ` de tipo ${filtroTipo}`}
                </td>
              </tr>
            ) : (
              categoriasFiltradas.map((categoria) => (
                <tr key={categoria.id} className="hover:bg-green-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {categoria.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        categoria.tipo === 'ingreso'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {categoria.tipo === 'ingreso' ? (
                        <>
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Ingreso
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 mr-1" />
                          Egreso
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {categoria.descripcion || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/categorias/${categoria.id}/editar`)}
                        className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEliminarClick(categoria)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="md:hidden space-y-3">
        {categoriasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            No hay categorías
            {filtroTipo !== 'todas' && ` de tipo ${filtroTipo}`}
          </div>
        ) : (
          categoriasFiltradas.map((categoria) => (
            <div
              key={categoria.id}
              className="bg-white rounded-xl shadow-sm p-4 border border-green-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{categoria.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {categoria.descripcion || 'Sin descripción'}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    categoria.tipo === 'ingreso'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {categoria.tipo === 'ingreso' ? (
                    <TrendingUp className="w-3 h-3 inline" />
                  ) : (
                    <TrendingDown className="w-3 h-3 inline" />
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/categorias/${categoria.id}/editar`)}
                  className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                >
                  <Edit2 className="w-4 h-4 inline mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarClick(categoria)}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmación */}
      {showDeleteModal && categoriaAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Eliminar categoría
                </h3>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              ¿Estás seguro de que deseas eliminar la categoría{' '}
              <span className="font-semibold">{categoriaAEliminar.nombre}</span>?
            </p>

            {errorEliminar && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{errorEliminar}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={cancelarEliminar}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && <LoadingSpinner fullScreen text="Eliminando categoría..." />}
    </div>
  )
}