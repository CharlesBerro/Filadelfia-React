import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { User, Mail, Lock, Shield } from 'lucide-react'

interface UserFormProps {
    user?: {
        id: string
        full_name?: string
        email?: string
        role: 'admin' | 'user' | 'contador'
    } | null
    onSave: (data: any) => Promise<void>
    onCancel: () => void
    isLoading: boolean
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, isLoading }) => {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'admin' | 'user' | 'contador'>('user')

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '')
            setEmail(user.email || '')
            setRole(user.role)
        } else {
            setFullName('')
            setEmail('')
            setPassword('')
            setRole('user')
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSave({
            full_name: fullName,
            email,
            password: user ? undefined : password, // Only send password if creating
            role
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
                        disabled={!!user} // Disable email editing for now as it's complex in Supabase
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

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none appearance-none bg-white"
                    >
                        <option value="user">Usuario</option>
                        <option value="contador">Contador</option>
                        <option value="admin">Administrador</option>
                    </select>
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
