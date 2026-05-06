import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import type { EscalaCrecimiento, GrupoEscala, GrupoEscalaDetallado, Persona, PersonaEscala, User } from '@/types'

type EstadoSeguimiento = 'pendiente' | 'en_curso' | 'finalizado' | 'retirado'

export class SeguimientoService {
  static async obtenerEscalasActivas(): Promise<EscalaCrecimiento[]> {
    const { data, error } = await supabase
      .from('escala_de_crecimiento')
      .select('id, nombre_escala, orden, activo, created_at')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      nombre: row.nombre_escala,
      orden: row.orden ?? 0,
      activo: row.activo,
      created_at: row.created_at ?? '',
    }))
  }

  static async obtenerGruposPorSede(): Promise<GrupoEscalaDetallado[]> {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('Usuario no autenticado')

    let query = supabase
      .from('grupos_escala')
      .select(`
        *,
        escala:escala_id(id, nombre_escala, orden),
        formador:formador_id(id, full_name),
        sede:sede_id(id, nombre_sede)
      `)
      .order('created_at', { ascending: false })

    if (user.role === 'formador') {
      query = query.eq('formador_id', user.id)
    } else if (user.role !== 'admin') {
      query = query.eq('sede_id', user.sede_id)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as GrupoEscalaDetallado[]
  }

  static async crearGrupo(input: Omit<GrupoEscala, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<GrupoEscala> {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('Usuario no autenticado')
    if (user.role !== 'admin' && user.role !== 'lider' && user.role !== 'organizador') {
      throw new Error('Solo admin, lider y organizador pueden crear grupos')
    }

    const payload = {
      ...input,
      created_by: user.id,
    }

    const { data, error } = await supabase
      .from('grupos_escala')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error
    return data as GrupoEscala
  }

  static async obtenerSeguimientoPorPersona(personaId: string): Promise<PersonaEscala[]> {
    const { data, error } = await supabase
      .from('persona_escala')
      .select('*')
      .eq('persona_id', personaId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as PersonaEscala[]
  }

  static async obtenerSeguimientoPorGrupo(grupoId: string): Promise<Array<PersonaEscala & { persona?: Persona | null }>> {
    const { data, error } = await supabase
      .from('persona_escala')
      .select(`
        *,
        persona:persona_id(*)
      `)
      .eq('grupo_id', grupoId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as Array<PersonaEscala & { persona?: Persona | null }>
  }

  static async obtenerFormadoresPorSede(): Promise<User[]> {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('Usuario no autenticado')

    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        sede_id,
        created_at
      `)
      .eq('role', 'formador')
      .order('full_name', { ascending: true })

    if (user.role !== 'admin') {
      query = query.eq('sede_id', user.sede_id)
    }

    const { data, error } = await query
    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email || '',
      full_name: row.full_name || 'Sin nombre',
      role: row.role,
      sede_id: row.sede_id,
      created_at: row.created_at || new Date().toISOString(),
    })) as User[]
  }

  static async obtenerPersonasDisponiblesPorSede(): Promise<Persona[]> {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('Usuario no autenticado')

    let query = supabase
      .from('persona')
      .select('*')
      .order('nombres', { ascending: true })

    if (user.role !== 'admin') {
      query = query.eq('sede_id', user.sede_id)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as Persona[]
  }

  static async inscribirPersona(input: {
    persona_id: string
    grupo_id: string
    escala_id: string
    sede_id: string
    estado?: EstadoSeguimiento
    fecha_estudio?: string
  }): Promise<PersonaEscala> {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('Usuario no autenticado')

    await this.validarProgresion(input.persona_id, input.escala_id)

    const payload = {
      ...input,
      estado: input.estado ?? 'pendiente',
      created_by: user.id,
      updated_by: user.id,
    }

    const { data, error } = await supabase
      .from('persona_escala')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      // Compatibilidad con registros antiguos: si ya existe por persona+escala
      // pero no tiene grupo asignado, lo vinculamos al grupo actual.
      if (error.message?.toLowerCase().includes('duplicate key value')) {
        const { data: existentes, error: findErr } = await supabase
          .from('persona_escala')
          .select('*')
          .eq('persona_id', input.persona_id)
          .eq('escala_id', input.escala_id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (findErr) throw findErr
        if (existentes && existentes.length > 0) {
          const existente = existentes[0] as PersonaEscala
          const { data: actualizado, error: updErr } = await supabase
            .from('persona_escala')
            .update({
              grupo_id: input.grupo_id,
              sede_id: input.sede_id,
              estado: input.estado ?? 'pendiente',
              fecha_estudio: input.fecha_estudio || null,
              updated_by: user.id,
            })
            .eq('id', existente.id)
            .select('*')
            .single()

          if (updErr) throw updErr
          return actualizado as PersonaEscala
        }
      }
      throw error
    }
    return data as PersonaEscala
  }

  static async eliminarInscripcion(id: string): Promise<void> {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('Usuario no autenticado')
    if (user.role !== 'admin' && user.role !== 'lider' && user.role !== 'organizador') {
      throw new Error('Solo admin, lider u organizador pueden eliminar inscripciones')
    }

    const { error } = await supabase
      .from('persona_escala')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async actualizarEstadoSeguimiento(
    id: string,
    estado: EstadoSeguimiento,
    options?: { fechaAprobacionManual?: string; fechaEstudio?: string }
  ): Promise<PersonaEscala> {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('Usuario no autenticado')

    const payload: any = {
      estado,
      updated_by: user.id,
    }

    if (estado === 'finalizado') {
      payload.fecha_aprobacion_manual = options?.fechaAprobacionManual ?? new Date().toISOString().slice(0, 10)
    }

    if (options?.fechaEstudio) {
      payload.fecha_estudio = options.fechaEstudio
    }

    const { data, error } = await supabase
      .from('persona_escala')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data as PersonaEscala
  }

  private static async validarProgresion(personaId: string, escalaObjetivoId: string): Promise<void> {
    const { data: escalaObjetivo, error: escalaErr } = await supabase
      .from('escala_de_crecimiento')
      .select('id, orden')
      .eq('id', escalaObjetivoId)
      .single()

    if (escalaErr || !escalaObjetivo) {
      throw new Error('Escala objetivo no encontrada')
    }

    if (!escalaObjetivo.orden || escalaObjetivo.orden <= 1) {
      return
    }

    const ordenPrevio = escalaObjetivo.orden - 1

    const { data: escalaPrevia, error: previaErr } = await supabase
      .from('escala_de_crecimiento')
      .select('id')
      .eq('orden', ordenPrevio)
      .single()

    if (previaErr || !escalaPrevia) {
      throw new Error('No existe la escala previa requerida para esta inscripción')
    }

    const { data: aprobacionPrevia, error: aprobErr } = await supabase
      .from('persona_escala')
      .select('id, estado')
      .eq('persona_id', personaId)
      .eq('escala_id', escalaPrevia.id)
      .eq('estado', 'finalizado')
      .limit(1)

    if (aprobErr) throw aprobErr
    if (!aprobacionPrevia || aprobacionPrevia.length === 0) {
      throw new Error(`No se puede avanzar: debe aprobar primero la escala de orden ${ordenPrevio}`)
    }
  }
}
