// src/components/ui/LoadingSpinner.tsx
import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Componente de Loading/Spinner reutilizable
 * 
 * ¿Cuándo usarlo?
 * - Verificando datos
 * - Guardando
 * - Actualizando
 * - Eliminando
 * - Consultando
 * - Cualquier operación asíncrona
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' → Tamaño del spinner
 * - text: string → Texto a mostrar
 * - fullScreen: boolean → Mostrar en pantalla completa
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Cargando...',
  fullScreen = false,
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizes[size]} text-green-600 animate-spin`} />
      {text && (
        <p className={`${textSizes[size]} text-gray-700 font-medium`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}

/**
 * Variante inline (para botones)
 */
export const LoadingInline: React.FC<{ text?: string }> = ({ text = 'Cargando...' }) => {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      {text}
    </span>
  )
}

/**
 * Variante overlay (para modales o secciones)
 */
export const LoadingOverlay: React.FC<{ text?: string }> = ({ text = 'Cargando...' }) => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <LoadingSpinner text={text} />
    </div>
  )
}