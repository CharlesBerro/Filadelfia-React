// src/hooks/useCedulaValidator.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Hook personalizado para validar cédula en tiempo real
 * 
 * ¿Qué hace?
 * - Espera 1 segundo después de que el usuario deja de escribir (debounce)
 * - Consulta la BD para ver si existe la cédula
 * - Retorna el estado de validación
 * 
 * ¿Por qué usar debounce?
 * - Evita hacer una consulta por cada letra que escribe el usuario
 * - Ahorra recursos del servidor
 * - Mejora la experiencia del usuario
 */

interface CedulaValidation {
  isValidating: boolean  // ¿Está consultando ahora?
  existe: boolean        // ¿La cédula ya existe?
  mensaje: string        // Mensaje para mostrar al usuario
}

export const useCedulaValidator = (cedula: string) => {
  const [validation, setValidation] = useState<CedulaValidation>({
    isValidating: false,
    existe: false,
    mensaje: '',
  })

  useEffect(() => {
    // Si la cédula está vacía o muy corta, no validar
    if (!cedula || cedula.length < 6) {
      setValidation({ isValidating: false, existe: false, mensaje: '' })
      return
    }

    // DEBOUNCE: Esperar 1 segundo después de que el usuario deja de escribir
    const timer = setTimeout(async () => {
      setValidation({ isValidating: true, existe: false, mensaje: 'Verificando...' })

      try {
        // 1. Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setValidation({ 
            isValidating: false, 
            existe: false, 
            mensaje: 'No autenticado' 
          })
          return
        }

        // 2. Buscar si existe la cédula
        const { data, error } = await supabase
          .from('personas')
          .select('id, nombres, primer_apellido')
          .eq('numero_id', cedula)
          .eq('user_id', user.id)
          .maybeSingle() // Usar maybeSingle() en lugar de single()

        if (error) {
          console.error('Error validando cédula:', error)
          setValidation({ 
            isValidating: false, 
            existe: false, 
            mensaje: '' 
          })
          return
        }

        // 3. Si existe, mostrar error
        if (data) {
          setValidation({
            isValidating: false,
            existe: true,
            mensaje: `⚠️ Ya existe: ${data.nombres} ${data.primer_apellido}`,
          })
        } else {
          // 4. Si no existe, todo bien
          setValidation({
            isValidating: false,
            existe: false,
            mensaje: '✅ Cédula disponible',
          })
        }
      } catch (error) {
        console.error('Error:', error)
        setValidation({ 
          isValidating: false, 
          existe: false, 
          mensaje: '' 
        })
      }
    }, 1000) // Esperar 1 segundo

    // CLEANUP: Limpiar el timer si el usuario sigue escribiendo
    return () => clearTimeout(timer)
  }, [cedula]) // Se ejecuta cada vez que cambia la cédula

  return validation
}