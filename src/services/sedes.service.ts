import { supabase } from '@/lib/supabase'
import type { Sede } from '@/types'

export class SedesService {
    /**
     * Obtener todas las sedes
     */
    static async obtenerTodas() {
        try {
            const { data, error } = await supabase
                .from('sedes')
                .select('*')
                .order('nombre_sede')

            if (error) throw error
            return (data || []) as Sede[]
        } catch (error: any) {
            throw error
        }
    }
    /**
     * Crear nueva sede
     */
    static async crear(sede: Omit<Sede, 'id' | 'created_at'>) {
        try {
            const { data, error } = await supabase
                .from('sedes')
                .insert([sede])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error: any) {
            throw error
        }
    }

    /**
     * Actualizar sede
     */
    static async actualizar(id: string, sede: Partial<Sede>) {
        try {
            const { data, error } = await supabase
                .from('sedes')
                .update(sede)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error: any) {
            throw error
        }
    }

    /**
     * Eliminar sede
     */
    static async eliminar(id: string) {
        try {
            const { error } = await supabase
                .from('sedes')
                .delete()
                .eq('id', id)

            if (error) throw error
            return true
        } catch (error: any) {
            throw error
        }
    }
}
