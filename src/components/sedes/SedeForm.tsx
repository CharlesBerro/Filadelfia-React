import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Building2, MapPin, User, Phone, Hash } from 'lucide-react'
import type { Sede } from '@/types'

interface SedeFormProps {
    sede?: Sede | null
    onSave: (data: any) => Promise<void>
    onCancel: () => void
    isLoading: boolean
}

export const SedeForm: React.FC<SedeFormProps> = ({ sede, onSave, onCancel, isLoading }) => {
    const [nombre, setNombre] = useState('')
    const [direccion, setDireccion] = useState('')
    const [lider, setLider] = useState('')
    const [telefono, setTelefono] = useState('')
    const [codigo, setCodigo] = useState('')

    useEffect(() => {
        if (sede) {
            setNombre(sede.nombre_sede)
            setDireccion(sede.direccion_sede || '')
            setLider(sede.lider || '')
            setTelefono(sede.telefono_sede || '')
            setCodigo(sede.codigo || '')
        } else {
            setNombre('')
            setDireccion('')
            setLider('')
            setTelefono('')
            setCodigo('')
        }
    }, [sede])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSave({
            nombre_sede: nombre,
            direccion_sede: direccion,
            lider,
            telefono_sede: telefono,
            codigo
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Sede</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        name="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Sede Principal"
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        name="direccion"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        placeholder="Calle 123 # 45-67"
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Líder / Pastor</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        name="lider"
                        value={lider}
                        onChange={(e) => setLider(e.target.value)}
                        placeholder="Nombre del líder"
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            name="telefono"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="300 123 4567"
                            className="pl-10"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código (Opcional)</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            name="codigo"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            placeholder="SED-001"
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : sede ? 'Actualizar Sede' : 'Crear Sede'}
                </Button>
            </div>
        </form>
    )
}
