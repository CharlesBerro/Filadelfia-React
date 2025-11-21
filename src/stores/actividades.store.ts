// src/stores/actividades.store.ts
import { create } from 'zustand'
import type { Actividad } from '@/types'

/**
 * Store de Actividades con Zustand
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
 * const { actividades, loading } = useActividadesStore()
 */

interface ActividadesState {
    // ============ ESTADO ============
    actividades: Actividad[]
    loading: boolean
    error: string | null

    // ============ ACCIONES ============

    /**
     * Establecer lista completa de actividades
     * Se usa después de cargar desde la BD
     */
    setActividades: (actividades: Actividad[]) => void

    /**
     * Agregar una nueva actividad
     * Se usa después de crear una actividad exitosamente
     */
    addActividad: (actividad: Actividad) => void

    /**
     * Actualizar una actividad existente
     * Se usa después de editar una actividad
     */
    updateActividad: (id: string, actividad: Partial<Actividad>) => void

    /**
     * Eliminar una actividad
     * Se usa después de eliminar exitosamente
     */
    removeActividad: (id: string) => void

    /**
     * Establecer estado de carga
     */
    setLoading: (loading: boolean) => void

    /**
     * Establecer mensaje de error
     */
    setError: (error: string | null) => void

    /**
     * Limpiar todas las actividades
     * Se usa al cerrar sesión
     */
    clearActividades: () => void
}

/**
 * Hook del store de actividades
 * 
 * Uso en componentes:
 * 
 * ```tsx
 * const { 
 *   actividades, 
 *   loading, 
 *   setActividades,
 *   addActividad 
 * } = useActividadesStore()
 * ```
 */
export const useActividadesStore = create<ActividadesState>((set) => ({
    // ============ ESTADO INICIAL ============
    actividades: [],
    loading: false,
    error: null,

    // ============ ACCIONES ============

    setActividades: (actividades) => {
        console.log('🏪 Store: setActividades llamado con', actividades.length, 'actividades')
        set({ actividades, error: null })
    },

    addActividad: (actividad) => {
        console.log('🏪 Store: addActividad llamado', actividad)
        set((state) => ({
            actividades: [actividad, ...state.actividades],
            error: null,
        }))
    },

    updateActividad: (id, actividadData) => {
        console.log('🏪 Store: updateActividad llamado', id, actividadData)
        set((state) => ({
            actividades: state.actividades.map((a) =>
                a.id === id ? { ...a, ...actividadData } : a
            ),
            error: null,
        }))
    },

    removeActividad: (id) => {
        console.log('🏪 Store: removeActividad llamado', id)
        set((state) => ({
            actividades: state.actividades.filter((a) => a.id !== id),
            error: null,
        }))
    },

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),

    clearActividades: () => {
        console.log('🏪 Store: clearActividades llamado')
        set({ actividades: [], loading: false, error: null })
    },
}))

/**
 * CONCEPTOS IMPORTANTES:
 * 
 * 1. INMUTABILIDAD
 *    - Nunca modificamos el estado directamente
 *    - Siempre creamos nuevos arrays/objetos
 *    - Ejemplo: [nueva, ...state.actividades] en vez de push()
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
