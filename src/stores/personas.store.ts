import { create } from 'zustand'
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
}

export const usePersonasStore = create<PersonasStore>((set) => ({
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
}))