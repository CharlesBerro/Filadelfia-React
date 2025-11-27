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
            console.error('Error obteniendo sedes:', error)
            throw error
        }
    }
}
