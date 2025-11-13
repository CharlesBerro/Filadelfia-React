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
        .select('*')
        .order('orden', { ascending: true })

      if (error) throw error

      return (data || []) as EscalaCrecimiento[]
    } catch (error) {
      console.error('Error obteniendo escalas:', error)
      throw error
    }
  }

  /**
   * Obtener escalas de una persona
   */
  static async obtenerPorPersona(personaId: string): Promise<EscalaCrecimiento[]> {
    try {
      const { data, error } = await supabase
        .from('persona_escalas')
        .select(`
          escala_id,
          escala_de_crecimiento (
            id,
            nombre,
            orden,
            descripcion
          )
        `)
        .eq('persona_id', personaId)
        .eq('completado', true)

      if (error) throw error

      return (data || []).map((item: any) => item.escala_de_crecimiento)
    } catch (error) {
      console.error('Error obteniendo escalas de persona:', error)
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
      // 1. Desactivar todas las escalas actuales
      await supabase
        .from('persona_escalas')
        .update({ completado: false })
        .eq('persona_id', personaId)

      // 2. Insertar nuevas escalas
      if (escalasIds.length > 0) {
        const registros = escalasIds.map((escalaId) => ({
          persona_id: personaId,
          escala_id: escalaId,
          fecha_inicio: new Date().toISOString(),
          completado: true,
        }))

        const { error } = await supabase
          .from('persona_escalas')
          .insert(registros)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error asignando escalas:', error)
      throw error
    }
  }
}