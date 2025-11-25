// ========================================
// 💸 TRANSACCIONES - Type Definitions
// ========================================

import type { Categoria, Persona } from './index'

// Actividad con meta financiera (para transacciones)
export interface ActividadConMeta {
    id: string
    nombre: string
    descripcion?: string
    fecha_inicio: string
    fecha_fin?: string
    estado: 'planeada' | 'en_curso' | 'completada'
    meta: number
    user_id: string
    created_at: string
    updated_at: string
}

// Transacción completa
export interface TransaccionCompleta {
    id: string
    fecha: string
    monto: number
    tipo: 'ingreso' | 'egreso'
    categoria_id: string
    descripcion?: string
    actividad_id?: string
    user_id: string
    persona_id?: string
    evidencia?: string
    numero_transaccion: string
    estado: 'activa' | 'anulada'
    notas_anulacion?: string
    sede_id?: string
    created_at: string
    updated_at: string

    // Relaciones expandidas
    categoria?: Categoria
    actividad?: ActividadConMeta
    persona?: Persona
}

// Para crear transacción
export interface TransaccionCreate {
    fecha: string
    monto: number
    tipo: 'ingreso' | 'egreso'
    categoria_id: string
    descripcion?: string
    actividad_id?: string
    persona_id?: string
    evidencia?: string
    sede_id?: string
}

// Para actualizar transacción
export interface TransaccionUpdate {
    fecha?: string
    monto?: number
    tipo?: 'ingreso' | 'egreso'
    categoria_id?: string
    descripcion?: string
    actividad_id?: string
    persona_id?: string
    evidencia?: string
}

// Filtros para transacciones
export interface TransaccionesFilters {
    fechaInicio?: string
    fechaFin?: string
    actividad_id?: string
    categoria_id?: string
    persona_id?: string
    tipo?: 'ingreso' | 'egreso'
    estado?: 'activa' | 'anulada' | 'todas'
}

// Estadísticas de transacciones
export interface TransaccionesStats {
    totalIngresos: number
    totalEgresos: number
    balance: number
    totalTransacciones: number
    transaccionesPorCategoria?: Array<{ categoria: string; total: number }>
}

// Tipos para actividades con metas
export interface ActividadCreate {
    nombre: string
    descripcion?: string
    fecha_inicio: string
    fecha_fin?: string
    estado: 'planeada' | 'en_curso' | 'completada'
    meta: number
}

export interface ActividadUpdate {
    nombre?: string
    descripcion?: string
    fecha_inicio?: string
    fecha_fin?: string
    estado?: 'planeada' | 'en_curso' | 'completada'
    meta?: number
}
