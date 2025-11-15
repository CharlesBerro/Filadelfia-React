// src/services/ministerios.service.ts
import { supabase } from '@/lib/supabase'
import type { Ministerio } from '@/types'

/**
 * Servicio para manejar Ministerios
 * 
 * ¿Qué es un servicio?
 * - Es una capa que se encarga de la lógica de negocio
 * - Hace las peticiones a la base de datos
 * - Maneja errores
 * - No sabe nada de la UI (componentes)
 */

export class MinisteriosService {
  /**
   * Obtener todos los ministerios
   * No necesita user_id porque los ministerios son globales
   */
  static async obtenerTodos(): Promise<Ministerio[]> {
    try {
      const { data, error } = await supabase
        .from('ministerios')
        .select('*')
        .order('id_ministerio', { ascending: true })

      if (error) throw error

      return (data || []) as Ministerio[]
    } catch (error) {
      console.error('Error obteniendo ministerios:', error)
      throw error
    }
  }

  /**
   * Obtener ministerios de una persona
   * Columnas reales: id_persona, id_ministerio
   */
  static async obtenerPorPersona(personaId: string): Promise<Ministerio[]> {
    try {
      const { data, error } = await supabase
        .from('persona_ministerios')
        .select(`
          id_ministerio,
          ministerios:id_ministerio (
       
          )
        `)
        .eq('id_persona', personaId)

      if (error) throw error

      // Transformar los datos
      return (data || []).map((item: any) => item.ministerios).filter(Boolean)
    } catch (error) {
      console.error('Error obteniendo ministerios de persona:', error)
      return [] // Retornar array vacío en caso de error
    }
  }

  /**
   * Asignar ministerios a una persona
   */
  static async asignarAPersona(
    personaId: string,
    ministeriosIds: string[]
  ): Promise<void> {
    try {
      // 1. Eliminar ministerios actuales
      await supabase
        .from('persona_ministerios')
        .delete()
        .eq('id_persona', personaId)

      // 2. Insertar nuevos ministerios
      if (ministeriosIds.length > 0) {
        const registros = ministeriosIds.map((ministerioId) => ({
          id_persona: personaId,
          id_ministerio: ministerioId,
        }))

        const { error } = await supabase
          .from('persona_ministerios')
          .insert(registros)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error asignando ministerios:', error)
      throw error
    }
  }
}

