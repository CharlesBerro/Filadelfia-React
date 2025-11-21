// stores/transacciones.store.ts
import { create } from 'zustand'
import type {
    TransaccionCompleta,
    TransaccionesFilters,
    TransaccionesStats,
} from '@/types/transacciones'

interface TransaccionesState {
    // Data
    transacciones: TransaccionCompleta[]
    filters: TransaccionesFilters
    stats: TransaccionesStats | null

    // Loading states
    loading: boolean
    loadingStats: boolean
    loadingExport: boolean

    // Error
    error: string | null

    // Actions
    setTransacciones: (transacciones: TransaccionCompleta[]) => void
    addTransaccion: (transaccion: TransaccionCompleta) => void
    updateTransaccion: (id: string, transaccion: TransaccionCompleta) => void
    removeTransaccion: (id: string) => void
    clearTransacciones: () => void

    setFilters: (filters: TransaccionesFilters) => void
    clearFilters: () => void

    setStats: (stats: TransaccionesStats) => void

    setLoading: (loading: boolean) => void
    setLoadingStats: (loading: boolean) => void
    setLoadingExport: (loading: boolean) => void
    setError: (error: string | null) => void
}

export const useTransaccionesStore = create<TransaccionesState>((set) => ({
    // Initial state
    transacciones: [],
    filters: {},
    stats: null,
    loading: false,
    loadingStats: false,
    loadingExport: false,
    error: null,

    // Actions
    setTransacciones: (transacciones) => set({ transacciones }),

    addTransaccion: (transaccion) =>
        set((state) => ({
            transacciones: [transaccion, ...state.transacciones],
        })),

    updateTransaccion: (id, transaccion) =>
        set((state) => ({
            transacciones: state.transacciones.map((t) =>
                t.id === id ? transaccion : t
            ),
        })),

    removeTransaccion: (id) =>
        set((state) => ({
            transacciones: state.transacciones.filter((t) => t.id !== id),
        })),

    clearTransacciones: () => set({ transacciones: [] }),

    setFilters: (filters) => set({ filters }),

    clearFilters: () => set({ filters: {} }),

    setStats: (stats) => set({ stats }),

    setLoading: (loading) => set({ loading }),

    setLoadingStats: (loading) => set({ loadingStats: loading }),

    setLoadingExport: (loading) => set({ loadingExport: loading }),

    setError: (error) => set({ error }),
}))
