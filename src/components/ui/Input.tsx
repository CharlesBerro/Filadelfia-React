// src/components/ui/Input.tsx
import React from 'react'

/**
 * Componente Input reutilizable
 * 
// src/components/ui/Input.tsx
import React from 'react'

/**
 * Componente Input reutilizable
 * 
 * ¿Qué hace?
 * - Muestra un campo de texto con label
 * - Maneja errores de validación
 * - Estilos consistentes en toda la app
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  name: string
  error?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-green-300 focus:ring-green-500'
          } ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        {...props}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}