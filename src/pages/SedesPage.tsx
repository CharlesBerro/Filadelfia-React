import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SavingOverlay } from '@/components/ui/SavingOverlay'
import { SedeForm } from '@/components/sedes/SedeForm'
import { SedesService } from '@/services/sedes.service'
import { useAuthStore } from '@/stores/auth.store'
import {
    Building2,
    Plus,
    Edit,
    Trash2,
    AlertTriangle,
    MapPin,
    User,
    Phone
} from 'lucide-react'
import type { Sede } from '@/types'

export const SedesPage: React.FC = () => {
    const { user: currentUser } = useAuthStore()
    const [sedes, setSedes] = useState<Sede[]>([])
    const [loading, setLoading] = useState(true)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSede, setEditingSede] = useState<Sede | null>(null)

    // Saving State
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletingSede, setDeletingSede] = useState<Sede | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteSuccess, setDeleteSuccess] = useState(false)

    useEffect(() => {
        fetchSedes()
    }, [])

    const fetchSedes = async () => {
        try {
            setLoading(true)
            const data = await SedesService.obtenerTodas()
            setSedes(data)
        } catch (error) {
            console.error('Error fetching sedes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSede = async (formData: any) => {
        try {
            setIsSaving(true)
            setSaveSuccess(false)

            if (editingSede) {
                await SedesService.actualizar(editingSede.id, formData)
            } else {
                await SedesService.crear(formData)
            }

            setSaveSuccess(true)
            fetchSedes()

            setTimeout(() => {
                setIsModalOpen(false)
                setEditingSede(null)
                setIsSaving(false)
                setSaveSuccess(false)
            }, 1500)

        } catch (error: any) {
            alert('Error: ' + error.message)
            setIsSaving(false)
        }
    }

    const handleDeleteSede = async () => {
        if (!deletingSede) return

        try {
            setIsDeleting(true)
            setDeleteSuccess(false)

            await SedesService.eliminar(deletingSede.id)

            setDeleteSuccess(true)
            fetchSedes()

            setTimeout(() => {
                setIsDeleteModalOpen(false)
                setDeletingSede(null)
                setIsDeleting(false)
                setDeleteSuccess(false)
            }, 1500)

        } catch (error: any) {
            alert('Error al eliminar: ' + error.message)
            setIsDeleting(false)
        }
    }

    const openCreateModal = () => {
        setEditingSede(null)
        setIsModalOpen(true)
    }

    const openEditModal = (sede: Sede) => {
        setEditingSede(sede)
        setIsModalOpen(true)
    }

    const openDeleteModal = (sede: Sede) => {
        setDeletingSede(sede)
        setIsDeleteModalOpen(true)
    }

    if (currentUser?.role !== 'admin') {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center p-8 bg-white rounded-lg shadow-md">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
                        <p className="text-gray-600">Solo los administradores pueden gestionar las sedes.</p>
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
                            <Building2 className="w-8 h-8 text-green-600" />
                            Gestión de Sedes
                        </h1>
                        <p className="text-gray-500 mt-1">Administra las sedes de la iglesia</p>
                    </div>
                    <Button onClick={openCreateModal} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nueva Sede
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            Cargando sedes...
                        </div>
                    ) : sedes.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No hay sedes registradas</p>
                            <Button variant="outline" onClick={openCreateModal} className="mt-4">
                                Crear primera sede
                            </Button>
                        </div>
                    ) : (
                        sedes.map((sede) => (
                            <div key={sede.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{sede.nombre_sede}</h3>
                                                {sede.codigo && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                        {sede.codigo}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openEditModal(sede)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(sede)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span>{sede.lider || 'Sin líder asignado'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="truncate">{sede.direccion_sede || 'Sin dirección'}</span>
                                        </div>
                                        {sede.telefono_sede && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{sede.telefono_sede}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Create/Edit Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => !isSaving && setIsModalOpen(false)}
                    title={editingSede ? 'Editar Sede' : 'Nueva Sede'}
                >
                    <SedeForm
                        sede={editingSede}
                        onSave={handleSaveSede}
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
                                    ¿Estás seguro de eliminar la sede {deletingSede?.nombre_sede}?
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Esta acción no se puede deshacer. Asegúrate de que no haya usuarios vinculados a esta sede.
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
                                onClick={handleDeleteSede}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar Sede'}
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Save Overlay */}
                <SavingOverlay
                    isLoading={isSaving}
                    isSuccess={saveSuccess}
                    loadingText={editingSede ? "Actualizando sede..." : "Creando sede..."}
                    successText={editingSede ? "Sede actualizada" : "Sede creada exitosamente"}
                />

                {/* Delete Overlay */}
                <SavingOverlay
                    isLoading={isDeleting}
                    isSuccess={deleteSuccess}
                    loadingText="Eliminando sede..."
                    successText="Sede eliminada"
                />
            </div>
        </Layout>
    )
}
