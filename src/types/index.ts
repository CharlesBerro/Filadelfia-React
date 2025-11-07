export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: 'admin' | 'usuario'
  sede: string
  created_at: string
}

export interface Municipio {
  id: string
  nombre: string
}

export interface Departamento {
  id: string
  nombre: string
  ciudades: Municipio[]
}

export interface Persona {
  id: string
  created_at: string
  nombres: string
  primer_apellido: string
  segundo_apellido?: string
  tipo_id: string
  numero_id: string
  fecha_nacimiento: string
  edad?: string
  genero: string
  telefono: string
  email: string
  direccion: string
  url_foto?: string
  user_id: string
  sede_id: string
  estado_civil: string
  departamento: string
  municipio: string
  bautizado: boolean
  sedes?: { nombre_sede: string; direccion_sede: string }
  persona_escala?: Array<{ escala_de_crecimiento: { nombre_escala: string } }>
  persona_ministerios?: Array<{ ministerios: { id: string; nombre_minist: string } }>
}

export interface NuevaPersona {
  nombres: string
  primer_apellido: string
  segundo_apellido?: string
  tipo_id: string
  numero_id: string
  fecha_nacimiento: string
  edad?: string
  genero: string
  telefono: string
  email: string
  direccion: string
  url_foto?: string
  sede_id: string
  estado_civil: string
  departamento: string
  municipio: string
  bautizado: boolean
  ministerios?: string[]
}

export interface Transaccion {
  id: string
  fecha: string
  monto: number
  tipo: 'ingreso' | 'egreso'
  categoria_id: string
  user_id: string
  created_at: string
}

export interface Categoria {
  id: string
  nombre: string
  tipo: 'ingreso' | 'egreso'
  created_at: string
}

export interface Actividad {
  id: string
  nombre: string
  estado: 'planeada' | 'en_curso' | 'completada'
  user_id: string
  created_at: string
}