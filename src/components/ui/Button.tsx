import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  title?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  title
}) => {
  const baseStyles = 'px-6 py-2 rounded-lg font-semibold transition-all duration-200'

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    outline: 'bg-transparent border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {loading ? '⏳ Procesando...' : children}
    </button>
  )
}