import { supabase } from '@/lib/supabase'
import type { Persona, PersonaCreate } from '@/types'
import { useAuthStore } from '@/stores/auth.store'

export class PersonasService {
  /**
   * Obtener personas visibles para el usuario autenticado.
   * - Admin: ve TODAS las personas
   * - Otros roles: solo sus propias personas (user_id = auth.uid())
   */
  static async obtenerMias() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

      // Obtener rol desde el store de autenticación
      const { user: authUser } = useAuthStore.getState()
      const rol = authUser?.role
      const esAdmin = rol === 'admin'

      let query = supabase
        .from('persona')
        .select('*')

      if (!esAdmin) {
        // Usuario normal: solo sus propios registros
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query.order('fecha_nacimiento', { ascending: true })

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
      hoy.setHours(0, 0, 0, 0)
      const dentro30 = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)

      return personas
        .filter((p) => {
          if (!p.fecha_nacimiento) return false

          // Parsear manualmente para evitar problemas de zona horaria (UTC vs Local)
          const fechaStr = p.fecha_nacimiento.includes('T')
            ? p.fecha_nacimiento.split('T')[0]
            : p.fecha_nacimiento

          const [, mes, dia] = fechaStr.split('-').map(Number)

          const cumpleanosEsteAno = new Date(
            hoy.getFullYear(),
            mes - 1,
            dia
          )
          cumpleanosEsteAno.setHours(0, 0, 0, 0)

          // Si ya pasó este año, buscar el próximo
          if (cumpleanosEsteAno < hoy) {
            cumpleanosEsteAno.setFullYear(hoy.getFullYear() + 1)
          }

          return cumpleanosEsteAno <= dentro30
        })
        .sort((a, b) => {
          const fechaStrA = a.fecha_nacimiento!.includes('T')
            ? a.fecha_nacimiento!.split('T')[0]
            : a.fecha_nacimiento!
          const [, mesA, diaA] = fechaStrA.split('-').map(Number)

          const fechaStrB = b.fecha_nacimiento!.includes('T')
            ? b.fecha_nacimiento!.split('T')[0]
            : b.fecha_nacimiento!
          const [, mesB, diaB] = fechaStrB.split('-').map(Number)

          const cumA = new Date(
            new Date().getFullYear(),
            mesA - 1,
            diaA
          )
          cumA.setHours(0, 0, 0, 0)

          const cumB = new Date(
            new Date().getFullYear(),
            mesB - 1,
            diaB
          )
          cumB.setHours(0, 0, 0, 0)

          const hoySort = new Date()
          hoySort.setHours(0, 0, 0, 0)

          if (cumA < hoySort) cumA.setFullYear(cumA.getFullYear() + 1)
          if (cumB < hoySort) cumB.setFullYear(cumB.getFullYear() + 1)

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

      // 2. Validar cédula única a nivel global (sin filtrar por user_id)
      const { data: existente } = await supabase
        .from('persona')
        .select('id, user_id')
        .eq('numero_id', personaData.numero_id)
        .maybeSingle()

      if (existente) {
        throw new Error('Ya existe una persona con esta cédula en la base de datos')
      }

      // 3. Preparar datos
      const { ministerio, escala_crecimiento, ...restoPersona } = personaData as any

      // Obtener sede_id desde el usuario autenticado almacenado en el store
      const { user: authUser } = useAuthStore.getState()
      if (!authUser || !authUser.sede_id) {
        throw new Error('No se pudo determinar la sede del usuario autenticado')
      }

      const datosCompletos = {
        ...restoPersona,
        user_id: user.id,
        sede_id: authUser.sede_id,
      }

      console.log('📤 Datos a insertar:', datosCompletos)

      // 4. Insertar en BD
      const { data, error } = await supabase
        .from('persona')
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

      if (error) throw error

      // Retornar el primer elemento del array
      return (data && data.length > 0 ? data[0] : data) as Persona
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