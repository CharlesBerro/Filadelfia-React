export const validators = {
    // Validar email
    email: (email: string): string | null => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!email) return 'El email es requerido'
      if (!emailRegex.test(email)) return 'Email inválido'
      return null
    },
  
    // Validar contraseña
    password: (password: string): string | null => {
      if (!password) return 'La contraseña es requerida'
      if (password.length < 6) return 'Mínimo 6 caracteres'
      return null
    },
  
    // Validar cédula
    cedula: (cedula: string): string | null => {
      if (!cedula) return 'La cédula es requerida'
      if (cedula.length < 8) return 'Cédula inválida'
      return null
    },
  
    // Validar nombres
    nombres: (nombres: string): string | null => {
      if (!nombres) return 'El nombre es requerido'
      if (nombres.length < 2) return 'Mínimo 2 caracteres'
      return null
    },
  
    // Validar teléfono
    telefono: (telefono: string): string | null => {
      if (!telefono) return 'El teléfono es requerido'
      if (!/^\d{7,}$/.test(telefono)) return 'Teléfono inválido'
      return null
    },
  }