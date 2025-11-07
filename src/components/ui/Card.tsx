import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-8 border border-gray-100 ${className}`}
    >
      {children}
    </div>
  )
}