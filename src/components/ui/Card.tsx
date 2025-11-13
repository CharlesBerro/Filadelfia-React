import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 border border-green-100 hover:border-green-300 transition ${className}`}
    >
      {children}
    </div>
  )
}