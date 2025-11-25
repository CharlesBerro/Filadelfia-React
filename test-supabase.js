// Script de prueba para verificar consulta directa a Supabase
// Ejecutar con: node test-supabase.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TU_SUPABASE_URL'
const supabaseKey = 'TU_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
    console.log('🔍 Probando consulta directa a Supabase...\n')

    // Consulta SIN filtros
    const { data, error, count } = await supabase
        .from('transacciones')
        .select('*', { count: 'exact' })
        .order('fecha', { ascending: false })

    if (error) {
        console.error('❌ Error:', error)
        return
    }

    console.log('✅ Transacciones obtenidas:', data?.length || 0)
    console.log('📊 Count total:', count)
    console.log('\n📋 Primeras 5 transacciones:')
    data?.slice(0, 5).forEach((t, i) => {
        console.log(`${i + 1}. ${t.numero_transaccion} - ${t.tipo} - $${t.monto} - Estado: ${t.estado}`)
    })
}

testQuery()
