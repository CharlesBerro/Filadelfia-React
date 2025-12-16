// src/services/actividades.service.ts
import { supabase } from '@/lib/supabase'
import type { Actividad, ActividadCreate, ActividadUpdate } from '@/types'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Servicio para gestionar Actividades
 * 
 * ¿Qué hace este servicio?
 * - Maneja toda la comunicación con Supabase para la tabla 'actividades'
 * - Usuarios normales: ven solo sus propias actividades
 * - Admin: ve todas las actividades de todos los usuarios
 * - Maneja errores de forma consistente
 * 
 * Patrón de arquitectura:
 * Componente → Store → Service → Supabase → PostgreSQL
 */

export class ActividadesService {
    /**
     * Obtener todas las actividades
     * 
     * Lógica de permisos:
     * - Usuario normal: solo sus propias actividades (user_id = auth.uid())
     * - Admin: todas las actividades de todos los usuarios
     */
    static async obtenerTodas(): Promise<Actividad[]> {
        try {

            // 1. Verificar autenticación
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('No autenticado')
            }


            // 2. Obtener rol del usuario desde el store
            const { user: authUser } = useAuthStore.getState()
            const esAdmin = authUser?.role === 'admin'


            // 3. Construir query según rol
            let query = supabase
                .from('actividades')
                .select('*')
                .order('created_at', { ascending: false })

            // Si no es admin, filtrar por user_id
            if (!esAdmin) {
                query = query.eq('user_id', user.id)
            }

            const { data, error } = await query

            if (error) {
                throw error
            }


            return (data || []) as Actividad[]
        } catch (error) {
            throw error
        }
    }

    /**
     * Obtener actividad por ID
     * 
     * Validación:
     * - Usuario normal: solo puede ver sus propias actividades
     * - Admin: puede ver cualquier actividad
     */
    static async obtenerPorId(id: string): Promise<Actividad> {
        try {

            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('No autenticado')
            }

            // Obtener rol
            const { user: authUser } = useAuthStore.getState()
            const esAdmin = authUser?.role === 'admin'

            // Construir query
            let query = supabase
                .from('actividades')
                .select('*')
                .eq('id', id)

            // Si no es admin, verificar que sea del usuario
            if (!esAdmin) {
                query = query.eq('user_id', user.id)
            }

            const { data, error } = await query.single()

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Actividad no encontrada o no tienes permisos para verla')
                }
                throw error
            }


            return data as Actividad
        } catch (error) {
            throw error
        }
    }

    /**
     * Crear una nueva actividad
     * 
     * Validaciones:
     * - Nombre no puede estar vacío
     * - Meta debe ser mayor a 0
     * - Fecha inicio es requerida
     * - Si hay fecha_fin, debe ser >= fecha_inicio
     */
    static async crear(actividadData: ActividadCreate): Promise<Actividad> {
        try {

            // 1. Obtener usuario actual
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('No autenticado')
            }

            // 2. Validaciones de negocio
            if (!actividadData.nombre || actividadData.nombre.trim() === '') {
                throw new Error('El nombre es requerido')
            }

            if (!actividadData.meta || actividadData.meta <= 0) {
                throw new Error('La meta debe ser mayor a 0')
            }

            if (!actividadData.fecha_inicio) {
                throw new Error('La fecha de inicio es requerida')
            }

            // Validar fechas
            if (actividadData.fecha_fin) {
                const inicio = new Date(actividadData.fecha_inicio)
                const fin = new Date(actividadData.fecha_fin)

                if (fin < inicio) {
                    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
                }
            }

            // 3. Preparar datos
            const datosCompletos = {
                ...actividadData,
                nombre: actividadData.nombre.trim(),
                fecha_fin: actividadData.fecha_fin || null, // Convertir '' a null
                user_id: user.id,
            }


            // 4. Insertar en BD
            const { data, error } = await supabase
                .from('actividades')
                .insert(datosCompletos)
                .select()
                .single()

            if (error) {
                throw error
            }


            return data as Actividad
        } catch (error: any) {
            throw error
        }
    }

    /**
     * Actualizar una actividad existente
     * 
     * Validación:
     * - Usuario normal: solo puede actualizar sus propias actividades
     * - Admin: puede actualizar cualquier actividad
     */
    static async actualizar(
        id: string,
        updates: ActividadUpdate
    ): Promise<Actividad> {
        try {

            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('No autenticado')
            }

            // Obtener rol
            const { user: authUser } = useAuthStore.getState()
            const esAdmin = authUser?.role === 'admin'

            // Validaciones de negocio
            if (updates.nombre !== undefined && updates.nombre.trim() === '') {
                throw new Error('El nombre no puede estar vacío')
            }

            if (updates.meta !== undefined && updates.meta <= 0) {
                throw new Error('La meta debe ser mayor a 0')
            }

            // Validar fechas si se están actualizando
            if (updates.fecha_inicio || updates.fecha_fin) {
                // Obtener actividad actual para validar fechas
                const actividadActual = await this.obtenerPorId(id)

                const fechaInicio = updates.fecha_inicio || actividadActual.fecha_inicio
                const fechaFin = updates.fecha_fin || actividadActual.fecha_fin

                if (fechaFin) {
                    const inicio = new Date(fechaInicio)
                    const fin = new Date(fechaFin)

                    if (fin < inicio) {
                        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
                    }
                }
            }

            // Limpiar nombre si existe
            const datosActualizados = {
                ...updates,
                ...(updates.nombre && { nombre: updates.nombre.trim() }),
                ...(updates.fecha_fin === '' && { fecha_fin: null }), // Convertir '' a null explícitamente
            }

            // Construir query
            let query = supabase
                .from('actividades')
                .update(datosActualizados)
                .eq('id', id)

            // Si no es admin, verificar que sea del usuario
            if (!esAdmin) {
                query = query.eq('user_id', user.id)
            }

            const { data, error } = await query.select()

            if (error) throw error

            if (!data || data.length === 0) {
                throw new Error('No se pudo actualizar la actividad o no tienes permisos')
            }


            return data[0] as Actividad
        } catch (error) {
            throw error
        }
    }

    /**
     * Eliminar una actividad
     * 
     * Validación:
     * - Usuario normal: solo puede eliminar sus propias actividades
     * - Admin: puede eliminar cualquier actividad
     * 
     * ⚠️ IMPORTANTE:
     * - Si hay transacciones asociadas, NO se puede eliminar
     * - Esto se implementará en la siguiente fase
     */
    static async eliminar(id: string): Promise<void> {
        try {

            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                throw new Error('No autenticado')
            }

            // Obtener rol
            const { user: authUser } = useAuthStore.getState()
            const esAdmin = authUser?.role === 'admin'

            // Verificar si hay transacciones asociadas
            const { count } = await supabase
                .from('transacciones')
                .select('id', { count: 'exact', head: true })
                .eq('actividad_id', id)

            if (count && count > 0) {
                throw new Error('No se puede eliminar porque tiene transacciones asociadas')
            }

            // Construir query
            let query = supabase
                .from('actividades')
                .delete()
                .eq('id', id)

            // Si no es admin, verificar que sea del usuario
            if (!esAdmin) {
                query = query.eq('user_id', user.id)
            }

            const { error } = await query

            if (error) throw error

        } catch (error) {
            throw error
        }
    }

    /**
     * Calcular progreso de una actividad
     * 
     * Por ahora retorna 0% porque no hay transacciones
     * En la siguiente fase se calculará sumando las transacciones relacionadas
     * 
     * Fórmula: (total_recaudado / meta) * 100
     */
    static async calcularProgreso(actividadId: string): Promise<{
        recaudado: number
        meta: number
        porcentaje: number
    }> {
        try {

            // Obtener la actividad para conocer la meta
            const actividad = await this.obtenerPorId(actividadId)

            // Sumar transacciones de tipo ingreso y estado activa
            const { data: transacciones } = await supabase
                .from('transacciones')
                .select('monto')
                .eq('actividad_id', actividadId)
                .eq('tipo', 'ingreso')
                .eq('estado', 'activa')

            const recaudado = transacciones?.reduce((sum, t) => sum + t.monto, 0) || 0

            const porcentaje = actividad.meta > 0
                ? Math.min((recaudado / actividad.meta) * 100, 100)
                : 0

            return {
                recaudado,
                meta: actividad.meta,
                porcentaje: Math.round(porcentaje * 100) / 100, // 2 decimales
            }
        } catch (error) {
            return { recaudado: 0, meta: 0, porcentaje: 0 }
        }
    }

    /**
     * Obtener estadísticas de actividades
     * 
     * Útil para mostrar:
     * - Total de actividades
     * - Actividades por estado
     * - Total de metas
     */
    static async obtenerEstadisticas(): Promise<{
        total: number
        planeadas: number
        enCurso: number
        completadas: number
        totalMetas: number
    }> {
        try {
            const actividades = await this.obtenerTodas()

            const planeadas = actividades.filter((a) => a.estado === 'planeada').length
            const enCurso = actividades.filter((a) => a.estado === 'en_curso').length
            const completadas = actividades.filter((a) => a.estado === 'completada').length
            const totalMetas = actividades.reduce((sum, a) => sum + a.meta, 0)

            return {
                total: actividades.length,
                planeadas,
                enCurso,
                completadas,
                totalMetas,
            }
        } catch (error) {
            return {
                total: 0,
                planeadas: 0,
                enCurso: 0,
                completadas: 0,
                totalMetas: 0,
            }
        }
    }
}
