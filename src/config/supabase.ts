// Mantener compatibilidad de imports antiguos reusando el mismo cliente
// principal definido en '@/lib/supabase'.
import { supabase as libSupabase } from '@/lib/supabase'

export const supabase = libSupabase
