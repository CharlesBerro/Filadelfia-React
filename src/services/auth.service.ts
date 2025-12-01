import { supabase } from '@/lib/supabase'

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

      // 2. Obtener datos del usuario desde tabla profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          sede_id,
          sedes:sede_id(nombre_sede, lider)
        `)
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        throw new Error('Error obteniendo perfil: ' + profileError.message)
      }

      if (!profileData) {
        throw new Error('Perfil no encontrado')
      }

      // 3. Obtener información de la sede
      const sedeInfo = Array.isArray(profileData.sedes)
        ? profileData.sedes[0]
        : profileData.sedes

      // 4. Retornar datos completos
      return {
        user: {
          id: profileData.id,
          email: data.user.email || '',
          full_name: profileData.full_name || 'Usuario',
          role: profileData.role as 'admin' | 'usuario' | 'contador',
          sede_id: profileData.sede_id,
          sede_nombre: sedeInfo?.nombre_sede || 'Sin sede',
          sede_lider: sedeInfo?.lider || 'Sin asignar',
          created_at: data.user.created_at,
        },
        token: data.session.access_token,
      }
    } catch (error: any) {
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
      return null
    }
  }

  /**
   * Enviar correo de recuperación de contraseña
   */
  static async resetPasswordForEmail(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      return true
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Actualizar contraseña (estando logueado o tras recuperación)
   */
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      return true
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Actualizar email del usuario
   */
  static async updateEmail(newEmail: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })
      if (error) throw error
      return true
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Actualizar email de otro usuario (Admin)
   * Requiere función RPC 'admin_update_user_email'
   */
  static async adminUpdateEmail(userId: string, newEmail: string) {
    try {
      const { error } = await supabase.rpc('admin_update_user_email', {
        target_user_id: userId,
        new_email: newEmail
      })

      if (error) throw error
      return true
    } catch (error: any) {
      throw error
    }
  }
}