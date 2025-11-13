import React, { useMemo } from 'react'
import colombiaData from '@/data/colombia.json'

interface SelectDepartamentoProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const SelectDepartamento: React.FC<SelectDepartamentoProps> = ({
  value,
  onChange,
  placeholder = 'Selecciona un departamento',
  className = '',
}) => {
  // El json ya tiene los departamentos listos
  const departamentos = useMemo(
    () =>
      colombiaData.map((dept) => ({
        label: dept.departamento,
        value: dept.departamento,
      })),
    []
  )

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white ${className}`}
    >
      <option value="">{placeholder}</option>
      {departamentos.map((dept) => (
        <option key={dept.value} value={dept.value}>
          {dept.label}
        </option>
      ))}
    </select>
  )
}