
import { createClient } from '@supabase/supabase-js'

// Obtener credenciales desde variables de entorno
const supabaseUrl = import.meta.env.local.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar que existan las credenciales
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ DEBES REEMPLAZAR LAS CREDENCIALES DE SUPABASE')
  console.error('👉 Edita el archivo: src/lib/supabase.ts')
  console.error('👉 Ve a: https://supabase.com/dashboard -> Settings -> API')
  throw new Error(
    'Faltan las credenciales de Supabase. Verifica tu archivo .env'
  )
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuración de autenticación
    persistSession: true, // Guardar sesión en localStorage
    autoRefreshToken: true, // Renovar token automáticamente
    detectSessionInUrl: true, // Detectar sesión en URL (para reset password)
  },
})