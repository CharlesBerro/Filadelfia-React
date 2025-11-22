// services/transacciones.service.ts
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import type {
    TransaccionCompleta,
    TransaccionCreate,
    TransaccionUpdate,
    TransaccionesFilters,
    TransaccionesStats,
} from '@/types/transacciones'

/**
 * Servicio para gestión de transacciones (ingresos/egresos)
 * 
 * Funcionalidades:
 * - CRUD con permisos (usuarios ven solo sus transacciones, admins ven todas)
 * - Auto-generación de números de transacción
 * - Anulación (no eliminación) con notas de auditoría
 * - Estadísticas y filtros avanzados
 * - Exportación a PDF y Excel
 */
export class TransaccionesService {
    /**
     * Obtener todas las transacciones con filtros opcionales
     */
    static async obtenerTodas(filters?: TransaccionesFilters): Promise<TransaccionCompleta[]> {
        const { user } = useAuthStore.getState()
        if (!user) throw new Error('Usuario no autenticado')

        let query = supabase
            .from('transacciones')
            .select(`
        *,
        categoria:categorias(id, nombre, tipo),
        actividad:actividades(id, nombre, meta),
        persona:persona(id, nombres, primer_apellido, segundo_apellido)
      `)
            .order('fecha', { ascending: false })
            .order('created_at', { ascending: false })

        // Filtro por permisos: usuarios ven solo sus transacciones
        if (user.rol !== 'admin') {
            query = query.eq('user_id', user.id)
        }

        // Aplicar filtros
        if (filters?.fechaInicio) {
            query = query.gte('fecha', filters.fechaInicio)
        }
        if (filters?.fechaFin) {
            query = query.lte('fecha', filters.fechaFin)
        }
        if (filters?.actividad_id) {
            query = query.eq('actividad_id', filters.actividad_id)
        }
        if (filters?.categoria_id) {
            query = query.eq('categoria_id', filters.categoria_id)
        }
        if (filters?.persona_id) {
            query = query.eq('persona_id', filters.persona_id)
        }
        if (filters?.tipo) {
            query = query.eq('tipo', filters.tipo)
        }
        if (filters?.estado) {
            query = query.eq('estado', filters.estado)
        } else {
            // Por defecto, solo mostrar transacciones activas
            query = query.eq('estado', 'activa')
        }

        const { data, error } = await query

        if (error) {
            console.error('Error obteniendo transacciones:', error)
            throw new Error('Error al cargar transacciones')
        }

        return data as TransaccionCompleta[]
    }

    /**
     * Obtener una transacción por ID
     */
    static async obtenerPorId(id: string): Promise<TransaccionCompleta> {
        const { user } = useAuthStore.getState()
        if (!user) throw new Error('Usuario no autenticado')

        const { data, error } = await supabase
            .from('transacciones')
            .select(`
        *,
        categoria:categorias(id, nombre, tipo),
        actividad:actividades(id, nombre, meta),
        persona:persona(id, nombres, primer_apellido, segundo_apellido)
      `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error obteniendo transacción:', error)
            throw new Error('Transacción no encontrada')
        }

        // Verificar permisos
        if (user.rol !== 'admin' && data.user_id !== user.id) {
            throw new Error('No tienes permisos para ver esta transacción')
        }

        return data as TransaccionCompleta
    }

    /**
     * Crear nueva transacción
     */
    static async crear(transaccionData: TransaccionCreate): Promise<TransaccionCompleta> {
        const { user } = useAuthStore.getState()
        if (!user) throw new Error('Usuario no autenticado')

        // Validaciones
        if (transaccionData.monto <= 0) {
            throw new Error('El monto debe ser mayor a 0')
        }

        // Generar número de transacción
        const numeroTransaccion = await this.generarNumeroTransaccion(transaccionData.tipo)

        // Sanitizar datos: convertir strings vacíos a null para campos UUID opcionales
        const dataSanitizada = {
            ...transaccionData,
            actividad_id: transaccionData.actividad_id || null,
            persona_id: transaccionData.persona_id || null,
            evidencia: transaccionData.evidencia || null,
            descripcion: transaccionData.descripcion || null,
        }

        const { data, error } = await supabase
            .from('transacciones')
            .insert({
                ...dataSanitizada,
                user_id: user.id,
                numero_transaccion: numeroTransaccion,
                estado: 'activa',
            })
            .select(`
        *,
        categoria:categorias(id, nombre, tipo),
        actividad:actividades(id, nombre, meta),
        persona:persona(id, nombres, primer_apellido, segundo_apellido)
      `)
            .single()

        if (error) {
            console.error('Error creando transacción:', error)
            throw new Error('Error al crear transacción')
        }

        return data as TransaccionCompleta
    }

    /**
     * Actualizar transacción existente
     */
    static async actualizar(id: string, transaccionData: TransaccionUpdate): Promise<TransaccionCompleta> {
        const { user } = useAuthStore.getState()
        if (!user) throw new Error('Usuario no autenticado')

        // Obtener transacción actual para verificar permisos y estado
        const transaccionActual = await this.obtenerPorId(id)

        // Verificar que no esté anulada
        if (transaccionActual.estado === 'anulada') {
            throw new Error('No se puede editar una transacción anulada')
        }

        // Verificar permisos
        if (user.rol !== 'admin' && transaccionActual.user_id !== user.id) {
            throw new Error('No tienes permisos para editar esta transacción')
        }

        // Validaciones
        if (transaccionData.monto !== undefined && transaccionData.monto <= 0) {
            throw new Error('El monto debe ser mayor a 0')
        }

        // Sanitizar datos: convertir strings vacíos a null para campos UUID opcionales
        const dataSanitizada: any = { ...transaccionData }
        if (dataSanitizada.actividad_id === '') dataSanitizada.actividad_id = null
        if (dataSanitizada.persona_id === '') dataSanitizada.persona_id = null
        if (dataSanitizada.evidencia === '') dataSanitizada.evidencia = null
        if (dataSanitizada.descripcion === '') dataSanitizada.descripcion = null

        const { data, error } = await supabase
            .from('transacciones')
            .update(dataSanitizada)
            .eq('id', id)
            .select(`
        *,
        categoria:categorias(id, nombre, tipo),
        actividad:actividades(id, nombre, meta),
        persona:persona(id, nombres, primer_apellido, segundo_apellido)
      `)
            .single()

        if (error) {
            console.error('Error actualizando transacción:', error)
            throw new Error('Error al actualizar transacción')
        }

        return data as TransaccionCompleta
    }

    /**
     * Anular transacción (no se elimina, se marca como anulada)
     */
    static async anular(id: string, notasAnulacion: string): Promise<TransaccionCompleta> {
        const { user } = useAuthStore.getState()
        if (!user) throw new Error('Usuario no autenticado')

        if (!notasAnulacion || notasAnulacion.trim().length < 10) {
            throw new Error('Debe proporcionar una razón detallada para la anulación (mínimo 10 caracteres)')
        }

        // Obtener transacción actual
        const transaccionActual = await this.obtenerPorId(id)

        // Verificar que no esté ya anulada
        if (transaccionActual.estado === 'anulada') {
            throw new Error('Esta transacción ya está anulada')
        }

        // Verificar permisos
        if (user.rol !== 'admin' && transaccionActual.user_id !== user.id) {
            throw new Error('No tienes permisos para anular esta transacción')
        }

        const { data, error } = await supabase
            .from('transacciones')
            .update({
                estado: 'anulada',
                notas_anulacion: notasAnulacion,
            })
            .eq('id', id)
            .select(`
        *,
        categoria:categorias(id, nombre, tipo),
        actividad:actividades(id, nombre, meta),
        persona:persona(id, nombres, primer_apellido, segundo_apellido)
      `)
            .single()

        if (error) {
            console.error('Error anulando transacción:', error)
            throw new Error('Error al anular transacción')
        }

        return data as TransaccionCompleta
    }

    /**
     * Generar número de transacción único
     * Formato: ING001, ING002, EGR001, EGR002, etc.
     */
    static async generarNumeroTransaccion(tipo: 'ingreso' | 'egreso'): Promise<string> {
        const prefijo = tipo === 'ingreso' ? 'ING' : 'EGR'

        // Obtener el último número de transacción del mismo tipo
        const { data, error } = await supabase
            .from('transacciones')
            .select('numero_transaccion')
            .eq('tipo', tipo)
            .like('numero_transaccion', `${prefijo}%`)
            .order('numero_transaccion', { ascending: false })
            .limit(1)

        if (error) {
            console.error('Error obteniendo último número:', error)
            // Si hay error, empezar desde 1
            return `${prefijo}001`
        }

        if (!data || data.length === 0) {
            // Primera transacción de este tipo
            return `${prefijo}001`
        }

        // Extraer el número y sumar 1
        const ultimoNumero = data[0].numero_transaccion
        const numeroActual = parseInt(ultimoNumero.replace(prefijo, ''), 10)
        const siguienteNumero = numeroActual + 1

        // Formatear con ceros a la izquierda (3 dígitos)
        return `${prefijo}${siguienteNumero.toString().padStart(3, '0')}`
    }

    /**
     * Obtener estadísticas de transacciones
     */
    static async obtenerEstadisticas(filters?: TransaccionesFilters): Promise<TransaccionesStats> {
        const { user } = useAuthStore.getState()
        if (!user) throw new Error('Usuario no autenticado')

        let query = supabase
            .from('transacciones')
            .select('monto, tipo, categoria_id, categorias(nombre)')
            .eq('estado', 'activa') // Solo transacciones activas

        // Filtro por permisos
        if (user.rol !== 'admin') {
            query = query.eq('user_id', user.id)
        }

        // Aplicar filtros
        if (filters?.fechaInicio) {
            query = query.gte('fecha', filters.fechaInicio)
        }
        if (filters?.fechaFin) {
            query = query.lte('fecha', filters.fechaFin)
        }
        if (filters?.actividad_id) {
            query = query.eq('actividad_id', filters.actividad_id)
        }
        if (filters?.categoria_id) {
            query = query.eq('categoria_id', filters.categoria_id)
        }
        if (filters?.persona_id) {
            query = query.eq('persona_id', filters.persona_id)
        }
        if (filters?.tipo) {
            query = query.eq('tipo', filters.tipo)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error obteniendo estadísticas:', error)
            throw new Error('Error al calcular estadísticas')
        }

        // Calcular totales
        let totalIngresos = 0
        let totalEgresos = 0
        const categorias: Record<string, number> = {}

        data?.forEach((t: any) => {
            if (t.tipo === 'ingreso') {
                totalIngresos += t.monto
            } else {
                totalEgresos += t.monto
            }

            // Agrupar por categoría
            const categoriaNombre = t.categorias?.nombre || 'Sin categoría'
            categorias[categoriaNombre] = (categorias[categoriaNombre] || 0) + t.monto
        })

        // Convertir categorías a array
        const transaccionesPorCategoria = Object.entries(categorias)
            .map(([categoria, total]) => ({ categoria, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5) // Top 5 categorías

        return {
            totalIngresos,
            totalEgresos,
            balance: totalIngresos - totalEgresos,
            totalTransacciones: data?.length || 0,
            transaccionesPorCategoria,
        }
    }
}
