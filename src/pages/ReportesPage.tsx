import React, { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ReportsLanding } from '@/components/reports/ReportsLanding'
import { AccountingReports } from '@/components/reports/AccountingReports'
import { PeopleReports } from '@/components/reports/PeopleReports'
import { ExportReports } from '@/components/reports/ExportReports'

export const ReportesPage: React.FC = () => {
    const [currentView, setCurrentView] = useState<'landing' | 'accounting' | 'people' | 'export'>('landing')

    const renderContent = () => {
        switch (currentView) {
            case 'accounting':
                return <AccountingReports onBack={() => setCurrentView('landing')} />
            case 'people':
                return <PeopleReports onBack={() => setCurrentView('landing')} />
            case 'export':
                return <ExportReports onBack={() => setCurrentView('landing')} />
            default:
                return <ReportsLanding onSelect={(view) => setCurrentView(view)} />
        }
    }

    return (
        <Layout>
            <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </div>
        </Layout>
    )
}
