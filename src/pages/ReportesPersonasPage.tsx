setIsLoading(false)
        }
    }

return (
    <Layout>
        <div className="min-h-full p-4 sm:p-6 lg:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/reportes')}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Reportes de Personas</h1>
                            <p className="text-gray-500">Estadísticas demográficas y de crecimiento</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-6">
                    <PersonasCharts
                        isLoading={isLoading}
                        growthData={growthData}
                        genderData={genderData}
                        ageData={ageData}
                    />
                </div>
            </div>
        </div>
    </Layout>
)
}
