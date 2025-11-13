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

interface InputProps {
  label?: string
  name: string
  type?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-green-300 focus:ring-green-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}