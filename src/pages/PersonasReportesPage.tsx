import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { PersonasReportSection } from '@/components/personas/PersonasReportSection'
import { FileText } from 'lucide-react'

export const PersonasReportesPage: React.FC = () => {
    return (
        <Layout>
            <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-50">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Informes de Personas</h1>
                                <p className="text-sm text-gray-600">
                                    Genera y descarga listados detallados
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="fade-in animate-in slide-in-from-top-4 duration-300">
                        <PersonasReportSection />
                    </div>
                </div>
            </div>
        </Layout>
    )
}
