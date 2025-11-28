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
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  title,
  className = ''
}) => {
  const baseStyles = 'px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2'

  const variantStyles = {
    primary: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 shadow-sm hover:shadow',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100',
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
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {loading ? '⏳ Procesando...' : children}
    </button>
  )
}