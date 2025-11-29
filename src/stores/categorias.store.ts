// src/stores/categorias.store.ts
import { create } from 'zustand'
import type { Categoria } from '@/types'

/**
 * Store de Categorías con Zustand
 * 
 * ¿Qué es Zustand?
 * - Librería de estado global para React
 * - Más simple que Redux
 * - Perfecta para apps pequeñas/medianas
 * 
 * ¿Por qué usar un store?
 * - Evitar pasar props en cadena
 * - Compartir estado entre componentes
 * - Mantener sincronizados los datos
 * 
 * Ejemplo de uso:
 * const { categorias, loading } = useCategoriasStore()
 */

interface CategoriasState {
  // ============ ESTADO ============
  categorias: Categoria[]
  loading: boolean
  error: string | null

  // ============ ACCIONES ============
  
  /**
   * Establecer lista completa de categorías
   * Se usa después de cargar desde la BD
   */
  setCategorias: (categorias: Categoria[]) => void

  /**
   * Agregar una nueva categoría
   * Se usa después de crear una categoría exitosamente
   */
  addCategoria: (categoria: Categoria) => void

  /**
   * Actualizar una categoría existente
   * Se usa después de editar una categoría
   */
  updateCategoria: (id: string, categoria: Partial<Categoria>) => void

  /**
   * Eliminar una categoría
   * Se usa después de eliminar exitosamente
   */
  removeCategoria: (id: string) => void

  /**
   * Establecer estado de carga
   */
  setLoading: (loading: boolean) => void

  /**
   * Establecer mensaje de error
   */
  setError: (error: string | null) => void

  /**
   * Limpiar todas las categorías
   * Se usa al cerrar sesión
   */
  clearCategorias: () => void
}

/**
 * Hook del store de categorías
 * 
 * Uso en componentes:
 * 
 * ```tsx
 * const { 
 *   categorias, 
 *   loading, 
 *   setCategorias,
 *   addCategoria 
 * } = useCategoriasStore()
 * ```
 */
export const useCategoriasStore = create<CategoriasState>((set) => ({
  // ============ ESTADO INICIAL ============
  categorias: [],
  loading: false,
  error: null,

  // ============ ACCIONES ============

  setCategorias: (categorias) => {
    set({ categorias, error: null })
  },

  addCategoria: (categoria) => {
    set((state) => ({
      categorias: [categoria, ...state.categorias].sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      ),
      error: null,
    }))
  },

  updateCategoria: (id, categoriaData) => {
    set((state) => ({
      categorias: state.categorias
        .map((c) => (c.id === id ? { ...c, ...categoriaData } : c))
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
      error: null,
    }))
  },

  removeCategoria: (id) => {
    set((state) => ({
      categorias: state.categorias.filter((c) => c.id !== id),
      error: null,
    }))
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearCategorias: () => {
    set({ categorias: [], loading: false, error: null })
  },
}))

/**
 * CONCEPTOS IMPORTANTES:
 * 
 * 1. INMUTABILIDAD
 *    - Nunca modificamos el estado directamente
 *    - Siempre creamos nuevos arrays/objetos
 *    - Ejemplo: [...state.categorias, nueva] en vez de push()
 * 
 * 2. SINCRONIZACIÓN
 *    - El store es la única fuente de verdad
 *    - Los componentes leen del store
 *    - Las acciones modifican el store
 * 
 * 3. SEPARACIÓN DE RESPONSABILIDADES
 *    - Store: Guarda estado
 *    - Service: Lógica de negocio + BD
 *    - Component: UI + interacciones
 */