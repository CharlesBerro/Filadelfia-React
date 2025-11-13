import { supabase } from '@/config/supabase'
import type { Persona, PersonaCreate } from '@/types'

export class PersonasService {
  /**
   * Obtener personas del usuario autenticado
   */
  static async obtenerMias() {
   
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No autenticado')
      }

      const { data, error } = await supabase
        .from('persona')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha_nacimiento', { ascending: true })

      if (error) throw error

      return (data || []) as Persona[]
    } catch (error: any) {
      console.error('Error obteniendo personas:', error)
      throw error
    }
  }

  /**
   * Obtener personas con cumpleaños próximos (30 días)
   */
  static async obtenerProximosCumpleanos() {
    try {
      const personas = await this.obtenerMias()
      const hoy = new Date()
      const dentro30 = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)

      return personas
        .filter((p) => {
          if (!p.fecha_nacimiento) return false

          const fecha = new Date(p.fecha_nacimiento)
          const cumpleanosEsteAno = new Date(
            hoy.getFullYear(),
            fecha.getMonth(),
            fecha.getDate()
          )

          // Si ya pasó este año, buscar el próximo
          if (cumpleanosEsteAno < hoy) {
            cumpleanosEsteAno.setFullYear(hoy.getFullYear() + 1)
          }

          return cumpleanosEsteAno <= dentro30
        })
        .sort((a, b) => {
          const fechaA = new Date(a.fecha_nacimiento!)
          const fechaB = new Date(b.fecha_nacimiento!)

          const cumA = new Date(
            new Date().getFullYear(),
            fechaA.getMonth(),
            fechaA.getDate()
          )
          const cumB = new Date(
            new Date().getFullYear(),
            fechaB.getMonth(),
            fechaB.getDate()
          )

          if (cumA < new Date()) cumA.setFullYear(cumA.getFullYear() + 1)
          if (cumB < new Date()) cumB.setFullYear(cumB.getFullYear() + 1)

          return cumA.getTime() - cumB.getTime()
        })
    } catch (error: any) {
      console.error('Error obteniendo cumpleaños:', error)
      return []
    }
  }

  /**
   * Obtener persona por ID
   */
  static async obtenerPorId(id: string) {
    try {
      const { data, error } = await supabase
        .from('persona')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Persona
    } catch (error: any) {
      console.error('Error obteniendo persona:', error)
      throw error
    }
  }

  /**
   * Crear persona
   */
  static async crear(personaData: PersonaCreate): Promise<Persona> {
    console.log('📡 Service: crear iniciado')

    try {
      // 1. Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

      console.log('👤 Usuario actual:', user.id)

      // 2. Validar cédula única
      const { data: existente } = await supabase
        .from('personas')
        .select('id')
        .eq('numero_id', personaData.numero_id)
        .eq('user_id', user.id)
        .single()

      if (existente) {
        throw new Error('Ya existe una persona con esta cédula')
      }

      // 3. Preparar datos
      const datosCompletos = {
        ...personaData,
        user_id: user.id,
      }

      console.log('📤 Datos a insertar:', datosCompletos)

      // 4. Insertar en BD
      const { data, error } = await supabase
        .from('personas')
        .insert(datosCompletos)
        .select()
        .single()

      if (error) {
        console.error('❌ Service: Error de Supabase:', error)
        throw new Error(error.message)
      }

      console.log('✅ Service: Persona creada:', data)

      return data as Persona
    } catch (error: any) {
      console.error('❌ Service: Error en crear:', error)
      throw error
    }
  }


  /**
   * Actualizar persona
   */
  static async actualizar(id: string, updates: Partial<Persona>) {
    try {
      const { data, error } = await supabase
        .from('persona')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Persona
    } catch (error: any) {
      console.error('Error actualizando persona:', error)
      throw error
    }
  }

  /**
   * Eliminar persona
   */
  static async eliminar(id: string) {
    try {
      const { error } = await supabase
        .from('persona')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Error eliminando persona:', error)
      throw error
    }
  }
}