import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { User, Mail, Lock, Shield, Building2 } from 'lucide-react'
import { SedesService } from '@/services/sedes.service'
import type { Sede } from '@/types'

interface UserFormProps {
    user?: {
        id: string
        full_name?: string
        email?: string
        role: 'admin' | 'usuario' | 'contador'
        sede_id?: string
    } | null
    onSave: (data: any) => Promise<void>
    onCancel: () => void
    isLoading: boolean
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, isLoading }) => {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'admin' | 'usuario' | 'contador'>('usuario')
    const [sedeId, setSedeId] = useState('')
    const [sedes, setSedes] = useState<Sede[]>([])

    useEffect(() => {
        const loadSedes = async () => {
            try {
                const data = await SedesService.obtenerTodas()
                setSedes(data)
            } catch (error) {
                console.error('Error loading sedes:', error)
            }
        }
        loadSedes()
    }, [])

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '')
            setEmail(user.email || '')
            setRole(user.role)
            setSedeId(user.sede_id || '')
        } else {
            setFullName('')
            setEmail('')
            setPassword('')
            setRole('usuario')
            setSedeId('')
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSave({
            full_name: fullName,
            email,
            password: user ? undefined : password,
            role,
            sede_id: sedeId || null
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        name="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Juan Pérez"
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="juan@ejemplo.com"
                        className="pl-10"
                        required
                        disabled={!!user}
                    />
                </div>
                {user && <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar directamente.</p>}
            </div>

            {!user && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******"
                            className="pl-10"
                            required={!user}
                            minLength={6}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none appearance-none bg-white"
                        >
                            <option value="usuario">Usuario</option>
                            <option value="contador">Contador</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={sedeId}
                            onChange={(e) => setSedeId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none appearance-none bg-white"
                            required
                        >
                            <option value="">Seleccionar Sede</option>
                            {sedes.map((sede) => (
                                <option key={sede.id} value={sede.id}>
                                    {sede.nombre_sede}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : user ? 'Actualizar Usuario' : 'Crear Usuario'}
                </Button>
            </div>
        </form>
    )
}
