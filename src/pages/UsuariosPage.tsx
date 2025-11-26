import React, { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/auth.store'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Shield, User, Trash2 } from 'lucide-react'

interface UserProfile {
    id: string
    email?: string
    full_name?: string
    role: 'admin' | 'user' | 'contador'
    created_at: string
    last_sign_in_at?: string
}

export const UsuariosPage: React.FC = () => {
    const { user } = useAuthStore()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers()
        }
    }, [user])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            // Intentamos obtener de la tabla 'profiles' que es la que usa AuthService
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (err: any) {
            console.error('Error fetching users:', err)
            setError('Error al cargar usuarios. Asegúrate de tener permisos de administrador.')
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'user' | 'contador') => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

            // Actualizar estado local
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        } catch (err: any) {
            console.error('Error updating role:', err)
            alert('Error al actualizar rol')
        }
    }

    if (user?.role !== 'admin') {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                    <Shield className="w-16 h-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
                    <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gray-50">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <User className="w-6 h-6" />
                                Gestión de Usuarios
                            </h1>
                            <p className="text-gray-500">Administra roles y accesos de usuarios</p>
                        </div>
                    </div>

                    {loading ? (
                        <LoadingSpinner text="Cargando usuarios..." />
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
                    ) : (
                        <Card>
                            <CardContent className="p-0 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((u) => (
                                            <tr key={u.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{u.full_name || 'Usuario sin nombre'}</div>
                                                            <div className="text-sm text-gray-500">{u.email || `ID: ${u.id.slice(0, 8)}...`}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                                                        className={`text-sm rounded-full px-3 py-1 font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                            u.role === 'contador' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}
                                                    >
                                                        <option value="user">Usuario</option>
                                                        <option value="contador">Contador</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    )
}
