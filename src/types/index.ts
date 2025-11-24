// Usuario autenticado
export interface User {
  id: string
  email: string
  full_name: string
  rol: 'admin' | 'usuario' | 'contador'
  sede_id: string
  sede_nombre?: string
  sede_lider?: string
  created_at: string
}

// Persona completa (desde BD)
export interface Persona {
  id: string
  user_id: string
  tipo_id: string
  numero_id: string
  nombres: string
  primer_apellido: string
  segundo_apellido?: string | null
  fecha_nacimiento: string
  genero: string
  estado_civil: string
  telefono: string
  email?: string | null
  direccion?: string | null
  departamento: string
  municipio: string
  barrio?: string | null
  ocupacion?: string | null
  nivel_educativo: string
  bautizado: boolean
  fecha_bautismo?: string | null
  ministerio?: string | null
  escala_crecimiento: number
  observaciones?: string | null
  url_foto?: string | null
  created_at: string
  updated_at: string
}

// Para crear persona (sin id, user_id, timestamps)
export interface PersonaCreate {
  tipo_id: string
  numero_id: string
  nombres: string
  primer_apellido: string
  segundo_apellido?: string | null
  fecha_nacimiento: string
  genero: string
  estado_civil: string
  telefono: string
  email?: string | null
  direccion?: string | null
  departamento: string
  municipio: string
  barrio?: string | null
  ocupacion?: string | null
  nivel_educativo: string
  bautizado: boolean
  fecha_bautismo?: string | null
  ministerio?: string | null
  escala_crecimiento: number
  observaciones?: string | null
  url_foto?: string | null
}

// Para actualizar persona
export interface PersonaUpdate extends Partial<PersonaCreate> { }

// Transacción
export interface Transaccion {
  id: string
  user_id: string
  tipo: 'ingreso' | 'egreso'
  monto: number
  categoria_id: string
  descripcion?: string | null
  fecha: string
  created_at: string
  updated_at: string
}

// Categoría
export interface Categoria {
  id: string
  user_id: string
  nombre: string
  tipo: 'ingreso' | 'egreso'
  created_at: string
}

// Actividad
export interface Actividad {
  id: string
  user_id: string
  nombre: string
  descripcion?: string | null
  fecha_inicio: string
  fecha_fin?: string | null
  estado: 'planeada' | 'en_curso' | 'completada'
  meta: number
  created_at: string
  updated_at?: string
}

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

// Ministerio
export interface Ministerio {
  id: string
  nombre: string
  descripcion?: string | null
  created_at: string
}

// Escala de Crecimiento
export interface EscalaCrecimiento {
  id: string
  nombre: string
  orden: number
  descripcion?: string | null
  created_at: string
}

// Relación Persona-Ministerio
export interface PersonaMinisterio {
  id: string
  id_persona: string
  id_ministerio: string
  fecha_inicio: string
  fecha_fin?: string | null
  activo: boolean
  created_at: string
}

// Relación Persona-Escala
export interface PersonaEscala {
  id: string
  persona_id: string
  escala_id: string
  fecha_inicio: string
  fecha_fin?: string | null
  completado: boolean
  created_at: string
}