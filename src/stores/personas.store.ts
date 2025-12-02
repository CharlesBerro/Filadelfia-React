import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Persona } from '@/types'

interface PersonasStore {
  personas: Persona[]
  loading: boolean
  error: string | null
  lastUpdated: number | null

  setPersonas: (personas: Persona[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addPersona: (persona: Persona) => void
  removePersona: (id: string) => void
  updatePersona: (id: string, updated: Partial<Persona>) => void
  reset: () => void
  fetchPersonas: () => Promise<void>
}

export const usePersonasStore = create<PersonasStore>()(
  persist(
    (set) => ({
      personas: [],
      loading: false,
      error: null,
      lastUpdated: null,

      setPersonas: (personas) =>
        set({
          personas,
          loading: false,
          lastUpdated: Date.now(),
        }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      addPersona: (persona) =>
        set((state) => ({
          personas: [...state.personas, persona],
        })),

      removePersona: (id) =>
        set((state) => ({
          personas: state.personas.filter((p) => p.id !== id),
        })),

      updatePersona: (id, updated) =>
        set((state) => ({
          personas: state.personas.map((p) =>
            p.id === id ? { ...p, ...updated } : p
          ),
        })),

      reset: () =>
        set({
          personas: [],
          loading: false,
          error: null,
          lastUpdated: null,
        }),

      fetchPersonas: async () => {
        set({ loading: true, error: null })
        try {
          const { PersonasService } = await import('@/services/personas.service')
          const data = await PersonasService.obtenerMias()
          set({ personas: data, loading: false, lastUpdated: Date.now() })
        } catch (error: any) {
          set({ error: error.message || 'Error al cargar personas', loading: false })
        }
      },
    }),
    {
      name: 'personas-storage',
      version: 2, // Incrementar versión para forzar migración
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Limpiar fotos Base64 del store (ya no las necesitamos)
          if (persistedState.personas) {
            persistedState.personas = persistedState.personas.map((p: any) => ({
              ...p,
              // Eliminar fotos Base64, mantener URLs de Storage
              url_foto: p.url_foto?.startsWith('data:') ? null : p.url_foto
            }))
          }
        }
        return persistedState
      }
    }
  )
)