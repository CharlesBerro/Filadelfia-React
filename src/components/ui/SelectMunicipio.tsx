import React, { useMemo } from 'react'
import colombiaData from '@/data/colombia.json'

interface SelectMunicipioProps {
  departamento: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const SelectMunicipio: React.FC<SelectMunicipioProps> = ({
  departamento,
  value,
  onChange,
  placeholder = 'Selecciona un municipio',
  className = '',
}) => {
  const municipios = useMemo(() => {
    if (!departamento) return []

    // Buscar el departamento en el json
    const dept = colombiaData.find((d) => d.departamento === departamento)
    
    // El json tiene ciudades como array de strings
    return dept?.ciudades || []
  }, [departamento])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!departamento}
      className={`w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white ${className}`}
    >
      <option value="">{placeholder}</option>
      {municipios.map((municipio, index) => (
        <option key={`${departamento}-${index}`} value={municipio}>
          {municipio}
        </option>
      ))}
    </select>
  )
}