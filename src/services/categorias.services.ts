// src/services/categorias.service.ts
import { supabase } from '@/lib/supabase'
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '@/types'

/**
 * Servicio para gestionar Categorías
 * 
 * ¿Qué hace este servicio?
 * - Maneja toda la comunicación con Supabase para la tabla 'categorias'
 * - Valida que el usuario solo vea sus propias categorías
 * - Maneja errores de forma consistente
 * 
 * Patrón de arquitectura:
 * Componente → Store → Service → Supabase → PostgreSQL
 */

export class CategoriasService {
  /**
   * Verificar si el usuario es administrador
   */
  private static async verificarAdmin(userId: string) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      console.error('Error verificando rol:', error)
      throw new Error('Error verificando permisos')
    }

    if (profile.role !== 'admin') {
      throw new Error('No tienes permisos para realizar esta acción. Solo administradores.')
    }
  }

  /**
   * Obtener todas las categorías del usuario actual
   * 
   * ¿Por qué filtrar por user_id?
   * - Cada usuario tiene sus propias categorías
   * - Admin también tiene sus categorías (no ve las de otros)
   * - RLS (Row Level Security) de Supabase refuerza esto
   */
  static async obtenerTodas(): Promise<Categoria[]> {
    try {
      console.log('📡 Service: obtenerTodas categorías')

      // 1. Verificar autenticación
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

      console.log('👤 Usuario:', user.id)

      // 2. Consultar categorías del usuario
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id)
        .order('nombre', { ascending: true })

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }

      console.log('✅ Categorías obtenidas:', data?.length || 0)

      return (data || []) as Categoria[]
    } catch (error) {
      console.error('❌ Error en obtenerTodas:', error)
      throw error
    }
  }

  /**
   * Obtener categorías por tipo (ingreso o egreso)
   * 
   * Caso de uso:
   * - Al crear una transacción de tipo "ingreso", mostrar solo categorías de ingreso
   * - Evita confusiones (no puedes usar "Servicios públicos" en un ingreso)
   */
  static async obtenerPorTipo(tipo: 'ingreso' | 'egreso'): Promise<Categoria[]> {
    try {
      console.log('📡 Service: obtenerPorTipo:', tipo)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id)
        .eq('tipo', tipo)
        .order('nombre', { ascending: true })

      if (error) throw error

      console.log(`✅ Categorías de ${tipo}:`, data?.length || 0)

      return (data || []) as Categoria[]
    } catch (error) {
      console.error('❌ Error en obtenerPorTipo:', error)
      throw error
    }
  }

  /**
   * Crear una nueva categoría
   * 
   * Validaciones:
   * - Nombre no puede estar vacío
   * - No puede haber dos categorías con el mismo nombre (mismo user)
   * - Tipo debe ser 'ingreso' o 'egreso'
   */
  static async crear(categoriaData: CategoriaCreate): Promise<Categoria> {
    try {
      console.log('📡 Service: crear categoría')

      // 1. Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

      // Verificar si es admin
      await this.verificarAdmin(user.id)

      // 2. Validar que no exista una categoría con el mismo nombre
      const { data: existente } = await supabase
        .from('categorias')
        .select('id')
        .eq('user_id', user.id)
        .eq('nombre', categoriaData.nombre.trim())
        .maybeSingle()

      if (existente) {
        throw new Error('Ya existe una categoría con este nombre')
      }

      // 3. Preparar datos
      const datosCompletos = {
        ...categoriaData,
        nombre: categoriaData.nombre.trim(), // Eliminar espacios
        user_id: user.id,
      }

      console.log('📤 Datos a insertar:', datosCompletos)

      // 4. Insertar en BD
      const { data, error } = await supabase
        .from('categorias')
        .insert(datosCompletos)
        .select()
        .single()

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }

      console.log('✅ Categoría creada:', data)

      return data as Categoria
    } catch (error: any) {
      console.error('❌ Error en crear:', error)
      throw error
    }
  }

  /**
   * Actualizar una categoría existente
   * 
   * Solo se puede actualizar:
   * - nombre
   * - descripcion
   * 
   * NO se puede cambiar el tipo (ingreso/egreso) porque:
   * - Podría haber transacciones asociadas
   * - Cambiaría el contexto de esas transacciones
   */
  static async actualizar(
    id: string,
    updates: CategoriaUpdate
  ): Promise<Categoria> {
    try {
      console.log('📡 Service: actualizar categoría', id)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

      // Verificar si es admin
      await this.verificarAdmin(user.id)

      // Si se está actualizando el nombre, verificar que no exista
      if (updates.nombre) {
        const { data: existente } = await supabase
          .from('categorias')
          .select('id')
          .eq('user_id', user.id)
          .eq('nombre', updates.nombre.trim())
          .neq('id', id) // Excluir la categoría actual
          .maybeSingle()

        if (existente) {
          throw new Error('Ya existe otra categoría con este nombre')
        }
      }

      // Actualizar
      const { data, error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('No se pudo actualizar la categoría')
      }

      console.log('✅ Categoría actualizada:', data[0])

      return data[0] as Categoria
    } catch (error) {
      console.error('❌ Error en actualizar:', error)
      throw error
    }
  }

  /**
   * Eliminar una categoría
   * 
   * ⚠️ IMPORTANTE:
   * - Si hay transacciones asociadas, NO se puede eliminar
   * - Supabase lanzará un error por Foreign Key constraint
   * - En ese caso, mostrar mensaje amigable al usuario
   */
  static async eliminar(id: string): Promise<void> {
    try {
      console.log('📡 Service: eliminar categoría', id)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

      // Verificar si hay transacciones asociadas
      const { count, error: countError } = await supabase
        .from('transacciones')
        .select('id', { count: 'exact', head: true })
        .eq('categoria_id', id)

      if (countError) throw countError

      if (count && count > 0) {
        throw new Error(
          `No se puede eliminar esta categoría porque tiene ${count} transacción(es) asociada(s)`
        )
      }

      // Eliminar
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      console.log('✅ Categoría eliminada')
    } catch (error) {
      console.error('❌ Error en eliminar:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de categorías
   * 
   * Útil para mostrar:
   * - Cuántas categorías de ingreso tiene el usuario
   * - Cuántas categorías de egreso tiene el usuario
   */
  static async obtenerEstadisticas(): Promise<{
    totalIngresos: number
    totalEgresos: number
    total: number
  }> {
    try {
      const categorias = await this.obtenerTodas()

      const totalIngresos = categorias.filter((c) => c.tipo === 'ingreso').length
      const totalEgresos = categorias.filter((c) => c.tipo === 'egreso').length

      return {
        totalIngresos,
        totalEgresos,
        total: categorias.length,
      }
    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error)
      return { totalIngresos: 0, totalEgresos: 0, total: 0 }
    }
  }
}