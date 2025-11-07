import { supabase } from '@/config/supabase'
import type { User } from '@/types'

export class AuthService {
  /**
   * Hacer login con email y contraseña
   */
  static async login(email: string, password: string) {
    try {
      // 1. Supabase autentica el usuario
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.session) {
        throw new Error('No se obtuvo sesión')
      }

      // 2. Obtener datos del usuario desde tabla 'users'
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError) {
        console.warn('Usuario en auth pero no en tabla users')
      }

      // 3. Retornar datos completos
      return {
        user: {
          id: data.user.id,
          email: data.user.email || '',
          nombre: userData?.nombre || 'Usuario',
          apellido: userData?.apellido || '',
          rol: userData?.rol || 'usuario',
          sede: userData?.sede || 'Principal',
          created_at: data.user.created_at || new Date().toISOString(),
        },
        token: data.session.access_token,
      }
    } catch (error: any) {
      console.error('Error en login:', error)
      throw error
    }
  }

  /**
   * Registrar nuevo usuario
   */
  static async signup(email: string, password: string, nombre: string) {
    try {
      // 1. Crear usuario en Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('Error creando usuario')
      }

      // 2. Crear registro en tabla 'users'
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email,
          nombre,
          apellido: '',
          rol: 'usuario',
          sede: 'Principal',
          created_at: new Date().toISOString(),
        },
      ])

      if (insertError) {
        throw new Error(insertError.message)
      }

      return {
        user: data.user,
        message: 'Usuario creado. Verifica tu email.',
      }
    } catch (error: any) {
      console.error('Error en signup:', error)
      throw error
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Error en logout:', error)
      throw error
    }
  }

  /**
   * Obtener sesión actual
   */
  static async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session
    } catch (error: any) {
      console.error('Error obteniendo sesión:', error)
      return null
    }
  }

  /**
   * Obtener usuario actual desde BD
   */
  static async getCurrentUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error obteniendo usuario:', error)
      return null
    }
  }
}