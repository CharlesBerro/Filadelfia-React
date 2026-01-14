import React, { useState, useMemo } from 'react'
import { FileText, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePersonasStore } from '@/stores/personas.store'
import { pdf } from '@react-pdf/renderer'
import { PersonasReportPDF } from './PersonasReportPDF'

export const PersonasReportSection: React.FC = () => {
    const { personas } = usePersonasStore()
    const [reportType, setReportType] = useState<'bautizados' | 'taller' | 'pendientes' | 'todas'>('bautizados')
    const [isGenerating, setIsGenerating] = useState(false)

    const filteredData = useMemo(() => {
        let data = [...personas]

        switch (reportType) {
            case 'bautizados':
                data = personas.filter(p => p.bautizado)
                break
            case 'taller':
                data = personas.filter(p => p.taller_maestro)
                break
            case 'pendientes':
                data = personas.filter(p => !p.taller_maestro)
                break
            case 'todas':
            default:
                data = [...personas]
                break
        }

        // Ordenar alfabéticamente por Nombre
        return data.sort((a, b) => {
            const nombreA = `${a.nombres} ${a.primer_apellido}`.toLowerCase()
            const nombreB = `${b.nombres} ${b.primer_apellido}`.toLowerCase()
            return nombreA.localeCompare(nombreB)
        })
    }, [personas, reportType])

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-'
        try {
            // Intentar parsear ISO primero
            let d = new Date(dateString)

            // Si es inválida (NaN), intentar dividir manualmente si es formato yyyy-mm-dd
            if (isNaN(d.getTime()) && dateString.includes('-')) {
                const [year, month, day] = dateString.split('-').map(Number)
                d = new Date(year, month - 1, day)
            }

            if (isNaN(d.getTime())) return '-'

            // Formato: 09-Dic-2025
            const dayStr = d.getDate().toString().padStart(2, '0')
            const monthStr = d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')
            const yearStr = d.getFullYear()

            return `${dayStr}-${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)}-${yearStr}`
        } catch (e) {
            return '-'
        }
    }

    const handleDownloadPDF = async () => {
        setIsGenerating(true)
        try {
            const titles = {
                bautizados: 'Reporte de Personas Bautizadas',
                taller: 'Asistentes al Taller del Maestro',
                pendientes: 'Pendientes de Taller del Maestro',
                todas: 'Listado General de Personas'
            }

            const blob = await pdf(
                <PersonasReportPDF
                    personas={filteredData}
                    titulo={titles[reportType]}
                    tipoReporte={reportType}
                />
            ).toBlob()

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Error generando PDF', error)
            alert('Error generando el reporte PDF')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Generador de Informes</h2>
                        <p className="text-sm text-gray-500">Selecciona el tipo de reporte que deseas generar</p>
                    </div>
                </div>
            </div>

            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Informe</label>
                    <div className="relative">
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as any)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                        >
                            <option value="bautizados">Personas Bautizadas</option>
                            <option value="taller">Asistentes al Taller</option>
                            <option value="pendientes">Pendientes de Taller</option>
                            <option value="todas">Todas las Personas</option>
                        </select>
                        <Filter className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    </div>
                </div>

                <Button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating || filteredData.length === 0}
                    className="w-full sm:w-auto"
                >
                    {isGenerating ? 'Generando...' : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar PDF
                        </>
                    )}
                </Button>
            </div>

            {/* Vista Previa Tabla */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3">Nombre Completo</th>
                            <th className="px-4 py-3">Documento</th>
                            <th className="px-4 py-3">Teléfono</th>
                            <th className="px-4 py-3">
                                {reportType === 'todas' ? 'Estado' : (reportType === 'bautizados' ? '¿Bautizado?' : '¿Asistió Taller?')}
                            </th>
                            <th className="px-4 py-3">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData.length > 0 ? (
                            filteredData.slice(0, 10).map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {p.nombres} {p.primer_apellido} {p.segundo_apellido}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{p.numero_id}</td>
                                    <td className="px-4 py-3 text-gray-600">{p.telefono}</td>
                                    <td className="px-4 py-3">
                                        {reportType === 'bautizados' ? (
                                            <span className={`px-2 py-1 rounded-full text-xs ${p.bautizado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {p.bautizado ? 'Sí' : 'No'}
                                            </span>
                                        ) : reportType === 'todas' ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs">Bautizado: {p.bautizado ? 'Sí' : 'No'}</span>
                                                <span className="text-xs">Taller: {p.taller_maestro ? 'Sí' : 'No'}</span>
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs ${p.taller_maestro ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                {p.taller_maestro ? 'Sí' : 'No'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {reportType === 'bautizados' ? formatDate(p.fecha_bautismo) :
                                            reportType === 'todas' ? '-' :
                                                formatDate(p.fecha_taller_maestro)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    No se encontraron registros para este reporte
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {filteredData.length > 10 && (
                    <div className="bg-gray-50 px-4 py-2 text-xs text-center text-gray-500 border-t border-gray-200">
                        Mostrando primeros 10 registros de {filteredData.length}. Descarga el PDF para ver todos.
                    </div>
                )}
            </div>
        </div>
    )
}
