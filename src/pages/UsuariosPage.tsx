import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/auth.store'
import { Users, Shield, Search, UserPlus, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { UserForm } from '@/components/usuarios/UserForm'
import { Layout } from '@/components/layout/Layout'
import { SavingOverlay } from '@/components/ui/SavingOverlay'

interface UserProfile {
    id: string
    full_name: string
    email?: string
    role: 'admin' | 'user' | 'contador'
    created_at: string
}

export const UsuariosPage = () => {
    const { user: currentUser } = useAuthStore()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null)

    // Saving State
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteSuccess, setDeleteSuccess] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    // Create Secondary Client for User Creation (to avoid logging out admin)
    const createSecondaryClient = () => createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    )

    const handleSaveUser = async (formData: any) => {
        try {
            setIsSaving(true)
            setSaveSuccess(false)

            if (editingUser) {
                // UPDATE Existing User (Profile only)
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: formData.full_name,
                        role: formData.role
                    })
                    .eq('id', editingUser.id)

                if (error) throw error
            } else {
                // CREATE New User
                const tempSupabase = createSecondaryClient()

                const { data, error } = await tempSupabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        emailRedirectTo: undefined,
                        data: {
                            nombre: formData.full_name
                        }
                    }
                })

                if (error) throw error

                if (data.user) {
                    // Manually create the profile (since we removed the trigger)
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: data.user.id,
                            full_name: formData.full_name,
                            email: formData.email,
                            role: formData.role
                        })

                    if (profileError) {
                        throw new Error('Error al crear el perfil: ' + profileError.message)
                    }
                }
            }

            setSaveSuccess(true)
            fetchUsers()

            // Close modal after short delay to show success
            setTimeout(() => {
                setIsModalOpen(false)
                setEditingUser(null)
                setIsSaving(false)
                setSaveSuccess(false)
            }, 1500)

        } catch (error: any) {
            alert('Error: ' + error.message)
            setIsSaving(false)
        }
    }

    const openDeleteModal = (user: UserProfile) => {
        setDeletingUser(user)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteUser = async () => {
        if (!deletingUser) return

        try {
            setIsDeleting(true)
            setDeleteSuccess(false)

            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', deletingUser.id)

            if (error) throw error

            setDeleteSuccess(true)
            fetchUsers()

            // Close modal after short delay
            setTimeout(() => {
                setIsDeleteModalOpen(false)
                setDeletingUser(null)
                setIsDeleting(false)
                setDeleteSuccess(false)
            }, 1500)

        } catch (error: any) {
            alert('Error al eliminar: ' + error.message)
            setIsDeleting(false)
        }
    }

    const openCreateModal = () => {
        setEditingUser(null)
        setIsModalOpen(true)
    }

    const openEditModal = (user: UserProfile) => {
        setEditingUser(user)
        setIsModalOpen(true)
    }

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (currentUser?.role !== 'admin') {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center p-8 bg-white rounded-lg shadow-md">
                        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
                        <p className="text-gray-600">No tienes permisos para ver esta página.</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-8 h-8 text-green-600" />
                            Gestión de Usuarios
                        </h1>
                        <p className="text-gray-500 mt-1">Administra los usuarios y sus roles</p>
                    </div>
                    <Button onClick={openCreateModal} className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Crear Usuario
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                name="search"
                                placeholder="Buscar usuarios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            Cargando usuarios...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                                                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.full_name || 'Sin nombre'}</div>
                                                        <div className="text-xs text-gray-500">{user.email || 'Sin email'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : user.role === 'contador'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role === 'admin' ? 'Administrador' : user.role === 'contador' ? 'Contador' : 'Usuario'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                        title="Eliminar"
                                                        disabled={user.id === currentUser?.id}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => !isSaving && setIsModalOpen(false)}
                    title={editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                >
                    <UserForm
                        user={editingUser}
                        onSave={handleSaveUser}
                        onCancel={() => setIsModalOpen(false)}
                        isLoading={isSaving}
                    />
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                    title="Confirmar Eliminación"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                            <AlertTriangle className="w-12 h-12 text-red-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    ¿Estás seguro de eliminar a {deletingUser?.full_name}?
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Esta acción eliminará su perfil y revocará su acceso al sistema.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleDeleteUser}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar Usuario'}
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Save Overlay */}
                <SavingOverlay
                    isLoading={isSaving}
                    isSuccess={saveSuccess}
                    loadingText={editingUser ? "Actualizando usuario..." : "Creando usuario..."}
                    successText={editingUser ? "Usuario actualizado" : "Usuario creado exitosamente"}
                />

                {/* Delete Overlay */}
                <SavingOverlay
                    isLoading={isDeleting}
                    isSuccess={deleteSuccess}
                    loadingText="Eliminando usuario..."
                    successText="Usuario eliminado"
                />
            </div>
        </Layout>
    )
}
