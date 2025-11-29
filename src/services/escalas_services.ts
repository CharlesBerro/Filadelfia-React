// src/services/escalas.service.ts
import { supabase } from '@/lib/supabase'
import type { EscalaCrecimiento } from '@/types'

export class EscalasService {
  /**
   * Obtener todas las escalas
   * Ordenadas por 'orden' (1, 2, 3...)
   */
  static async obtenerTodas(): Promise<EscalaCrecimiento[]> {
    try {
      const { data, error } = await supabase
        .from('escala_de_crecimiento')
        .select('id, nombre_escala, created_at')
        .order('nombre_escala', { ascending: true })

      if (error) throw error

      // Mapear columnas reales de BD -> interfaz EscalaCrecimiento
      return (data || []).map((row: any) => ({
        id: row.id,
        nombre: row.nombre_escala,
        
        created_at: row.created_at ?? '',
      })) as EscalaCrecimiento[]
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtener escalas de una persona
   */
  static async obtenerPorPersona(personaId: string): Promise<EscalaCrecimiento[]> {
    try {
      const { data, error } = await supabase
        .from('persona_escala')
        .select(`
          escala_id,
          escala_de_crecimiento (
            id,
            nombre_escala,

            created_at
          )
        `)
        .eq('persona_id', personaId)
       

      if (error) throw error

      return (data || [])
        .map((item: any) => item.escala_de_crecimiento)
        .filter(Boolean)
        .map((row: any) => ({
          id: row.id,
          nombre: row.nombre_escala,
         
          created_at: row.created_at ?? '',
        })) as EscalaCrecimiento[]
    } catch (error) {
      throw error
    }
  }

  /**
   * Asignar escalas a una persona
   */
  static async asignarAPersona(
    personaId: string,
    escalasIds: string[]
  ): Promise<void> {
    try {
      // 1. Limpiar relaciones actuales de esta persona
      await supabase
        .from('persona_escala')
        .delete()
        .eq('persona_id', personaId)

      // 2. Insertar nuevas relaciones persona-escala
      if (escalasIds.length > 0) {
        const registros = escalasIds.map((escalaId) => ({
          persona_id: personaId,
          escala_id: escalaId, // FK hacia escala_de_crecimiento.id
        }))

        const { error } = await supabase
          .from('persona_escala')
          .insert(registros)

        if (error) throw error
      }
    } catch (error) {
      throw error
    }
  }
}