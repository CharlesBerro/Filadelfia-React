// src/hooks/useCedulaValidator.ts
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Hook para validar cédula de forma MANUAL (al presionar un botón).
 *
 * La validación ya NO se hace en tiempo real ni con debounce.
 * El componente llama a `validarCedula(cedula)` cuando el usuario presiona
 * el botón "Verificar".
 */

interface CedulaValidation {
  isValidating: boolean  // ¿Está consultando ahora?
  existe: boolean        // ¿La cédula ya existe?
  mensaje: string        // Mensaje para mostrar al usuario
}

export const useCedulaValidator = () => {
  const [validation, setValidation] = useState<CedulaValidation>({
    isValidating: false,
    existe: false,
    mensaje: '',
  })

  /**
   * Ejecuta la validación de la cédula de forma manual.
   * Retorna true si la cédula está disponible, false si ya existe o hay error.
   */
  const validarCedula = async (cedula: string): Promise<boolean> => {
    // Reset básico
    if (!cedula || cedula.trim().length < 6) {
      setValidation({
        isValidating: false,
        existe: false,
        mensaje: 'Debe tener al menos 6 dígitos',
      })
      return false
    }

    setValidation({ isValidating: true, existe: false, mensaje: 'Verificando...' })

    try {
      // 1. Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setValidation({
          isValidating: false,
          existe: false,
          mensaje: 'No autenticado',
        })
        return false
      }

      // 2. Buscar si existe la cédula en toda la tabla (sin filtrar por user_id)
      const { data, error } = await supabase
        .from('persona')
        .select('id, nombres, primer_apellido, user_id')
        .eq('numero_id', cedula)
        .maybeSingle()

      if (error) {
        setValidation({
          isValidating: false,
          existe: false,
          mensaje: 'Error al verificar cédula',
        })
        return false
      }

      // 3. Si existe, mostrar error diferenciando si es del mismo usuario u otro
      if (data) {
        const mismaCuenta = data.user_id === user.id
        setValidation({
          isValidating: false,
          existe: true,
          mensaje: mismaCuenta
            ? `⚠️ Ya existe registrada para este usuario: ${data.nombres} ${data.primer_apellido}`
            : '⚠️ Ya está en la base de datos con otro usuario',
        })
        return false
      }

      // 4. Si no existe en ninguna cuenta, está disponible
      setValidation({
        isValidating: false,
        existe: false,
        mensaje: '✅ Cédula disponible',
      })
      return true
    } catch (error) {
      setValidation({
        isValidating: false,
        existe: false,
        mensaje: 'Error inesperado al verificar',
      })
      return false
    }
  }

  return {
    validation,
    validarCedula,
  }
}
