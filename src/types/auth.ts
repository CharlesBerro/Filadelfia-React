export interface User {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'usuario' | 'contador'
    sede_id: string
    sede_nombre?: string
    sede_lider?: string
    created_at: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    email: string
    password: string
    nombre: string
}
