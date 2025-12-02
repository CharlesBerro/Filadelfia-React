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
   * Obtener todas las categorías
   * 
   * - Admin: Ve todas las categorías
   * - Usuario: Ve solo sus categorías
   */
  static async obtenerTodas(): Promise<Categoria[]> {
    try {
      // 1. Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // 2. Verificar rol
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .limit(1)
        .maybeSingle()

      const isAdmin = profile?.role === 'admin'

      // 3. Consultar categorías
      let query = supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true })

      // Si NO es admin, filtrar por usuario
      if (!isAdmin) {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []) as Categoria[]
    } catch (error) {
      throw error
    }
  }

  /**
   * Obtener categorías por tipo (ingreso o egreso)
   */
  static async obtenerPorTipo(tipo: 'ingreso' | 'egreso'): Promise<Categoria[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Verificar rol
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .limit(1)
        .maybeSingle()

      const isAdmin = profile?.role === 'admin'

      let query = supabase
        .from('categorias')
        .select('*')
        .eq('tipo', tipo)
        .order('nombre', { ascending: true })

      // Si NO es admin, filtrar por usuario
      if (!isAdmin) {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []) as Categoria[]
    } catch (error) {
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

      // 1. Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

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


      // 4. Insertar en BD
      const { data, error } = await supabase
        .from('categorias')
        .insert(datosCompletos)
        .select()
        .single()

      if (error) {
        throw error
      }


      return data as Categoria
    } catch (error: any) {
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

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

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


      return data[0] as Categoria
    } catch (error) {
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

    } catch (error) {
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
      return { totalIngresos: 0, totalEgresos: 0, total: 0 }
    }
  }
}