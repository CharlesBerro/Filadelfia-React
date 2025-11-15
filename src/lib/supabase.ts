// import { createClient } from '@supabase/supabase-js'

// // Obtener credenciales desde variables de entorno
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// // Validar que existan las credenciales
// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error('⚠️ DEBES REEMPLAZAR LAS CREDENCIALES DE SUPABASE')
//   console.error('👉 Edita tu archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
//   throw new Error(
//     'Faltan las credenciales de Supabase. Verifica tu archivo .env'
//   )
// }

// // Crear cliente de Supabase
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     persistSession: true,
//     autoRefreshToken: true,
//     detectSessionInUrl: true,
//   },
// })
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase no configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)