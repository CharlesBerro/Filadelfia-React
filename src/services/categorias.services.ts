// src/services/categorias.service.ts
import { supabase } from '@/lib/supabase'
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '@/types'

/**
 * Servicio para gestionar Categorías
 * 
 * ⚠️ IMPORTANTE: Solo los administradores pueden crear, actualizar y eliminar categorías
 * 
 * Patrón de arquitectura:
 * Componente → Store → Service → Supabase → PostgreSQL
 */

export class CategoriasService {

  /**
   * Verificar si el usuario es administrador
   */
  private static async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .limit(1)
        .maybeSingle()

      return profile?.role === 'admin'
    } catch {
      return false
    }
  }

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
      const isAdmin = await this.isAdmin()

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
      const isAdmin = await this.isAdmin()

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
   * ⚠️ SOLO ADMINISTRADORES
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

      // 2. Verificar que sea administrador
      const isAdmin = await this.isAdmin()
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden crear categorías')
      }

      // 3. Validar que no exista una categoría con el mismo nombre
      const { data: existente } = await supabase
        .from('categorias')
        .select('id')
        .eq('nombre', categoriaData.nombre.trim())
        .maybeSingle()

      if (existente) {
        throw new Error('Ya existe una categoría con este nombre')
      }

      // 4. Preparar datos
      const datosCompletos = {
        ...categoriaData,
        nombre: categoriaData.nombre.trim(),
        user_id: user.id,
      }

      // 5. Insertar en BD
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
   * ⚠️ SOLO ADMINISTRADORES
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

      // Verificar que sea administrador
      const isAdmin = await this.isAdmin()
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden actualizar categorías')
      }

      // Si se está actualizando el nombre, verificar que no exista
      if (updates.nombre) {
        const { data: existente } = await supabase
          .from('categorias')
          .select('id')
          .eq('nombre', updates.nombre.trim())
          .neq('id', id) // Excluir la categoría actual
          .maybeSingle()

        if (existente) {
          throw new Error('Ya existe otra categoría con este nombre')
        }
      }

      // Actualizar (sin filtrar por user_id, admin puede actualizar cualquiera)
      const { data, error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
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
   * ⚠️ SOLO ADMINISTRADORES
   */
  static async eliminar(id: string): Promise<void> {
    try {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No autenticado')
      }

      // Verificar que sea administrador
      const isAdmin = await this.isAdmin()
      if (!isAdmin) {
        throw new Error('Solo los administradores pueden eliminar categorías')
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

      // Eliminar (sin filtrar por user_id, admin puede eliminar cualquiera)
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error

    } catch (error) {
      throw error
    }
  }

  /**
   * Obtener estadísticas de categorías
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