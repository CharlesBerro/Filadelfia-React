import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { Persona } from '@/types'

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20, // margins
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#10B981',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#10B981',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 5,
    },
    table: {
        marginTop: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingVertical: 6,
        alignItems: 'center',
        minHeight: 24,
    },
    tableHeader: {
        backgroundColor: '#F9FAFB',
        fontWeight: 'bold',
    },
    // Standard Cols
    colName: { width: '30%', fontSize: 9 },
    colDoc: { width: '15%', fontSize: 9 },
    colTel: { width: '15%', fontSize: 9 },
    // Specific Cols
    colStatus: { width: '15%', fontSize: 9 },
    colDate: { width: '25%', fontSize: 9 },

    // General Report Cols
    colNameGen: { width: '25%', fontSize: 8 },
    colDocGen: { width: '15%', fontSize: 8 },
    colTelGen: { width: '15%', fontSize: 8 },
    colBauGen: { width: '22%', fontSize: 8 }, // Bautizado info
    colTallerGen: { width: '23%', fontSize: 8 }, // Taller info

    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        textAlign: 'center',
        fontSize: 8,
        color: '#9CA3AF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    },
})

interface PersonasReportPDFProps {
    personas: Persona[]
    titulo: string
    tipoReporte: 'bautizados' | 'taller' | 'pendientes' | 'todas'
}

export const PersonasReportPDF: React.FC<PersonasReportPDFProps> = ({ personas, titulo, tipoReporte }) => {

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return ''
        try {
            let d = new Date(dateString)
            if (isNaN(d.getTime()) && dateString.includes('-')) {
                const [year, month, day] = dateString.split('-').map(Number)
                d = new Date(year, month - 1, day)
            }
            if (isNaN(d.getTime())) return ''

            const dayStr = d.getDate().toString().padStart(2, '0')
            const monthStr = d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')
            const yearStr = d.getFullYear()

            return `${dayStr}-${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)}-${yearStr}`
        } catch (e) {
            return ''
        }
    }

    // Helper for General Report Columns
    const renderGeneralRow = (p: Persona, index: number) => (
        <View key={p.id} style={[styles.tableRow, index % 2 === 0 ? { backgroundColor: '#F9FAFB' } : {}]}>
            <Text style={styles.colNameGen}>
                {p.nombres} {p.primer_apellido} {p.segundo_apellido || ''}
            </Text>
            <Text style={styles.colDocGen}>{p.numero_id}</Text>
            <Text style={styles.colTelGen}>{p.telefono}</Text>

            {/* Bautizado Col */}
            <View style={styles.colBauGen}>
                <Text style={{ fontWeight: p.bautizado ? 'bold' : 'normal', color: p.bautizado ? '#059669' : '#374151' }}>
                    {p.bautizado ? 'Si' : 'No'}
                </Text>
                {p.bautizado && p.fecha_bautismo && (
                    <Text style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}>
                        {formatDate(p.fecha_bautismo)}
                    </Text>
                )}
            </View>

            {/* Taller Col */}
            <View style={styles.colTallerGen}>
                <Text style={{ fontWeight: p.taller_maestro ? 'bold' : 'normal', color: p.taller_maestro ? '#2563EB' : '#374151' }}>
                    {p.taller_maestro ? 'Si' : 'No'}
                </Text>
                {p.taller_maestro && p.fecha_taller_maestro && (
                    <Text style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}>
                        {formatDate(p.fecha_taller_maestro)}
                    </Text>
                )}
            </View>
        </View>
    )

    // Helper for Specific Reports (Bautizados, Taller, Pendientes)
    const renderSpecificRow = (p: Persona, index: number) => {
        // FALLBACK: Si llega 'todas' aquí, redireccionar a generalRow
        if (tipoReporte === 'todas') return renderGeneralRow(p, index);

        let status = '-'
        let date = '-'

        if (tipoReporte === 'bautizados') {
            status = p.bautizado ? 'Sí' : 'No'
            date = formatDate(p.fecha_bautismo) || '-'
        } else if (tipoReporte === 'taller') {
            status = p.taller_maestro ? 'Sí' : 'No'
            date = formatDate(p.fecha_taller_maestro) || '-'
        } else if (tipoReporte === 'pendientes') {
            status = 'No' // Pendiente implícitamente es No
            date = '-'
        }

        return (
            <View key={p.id} style={[styles.tableRow, index % 2 === 0 ? { backgroundColor: '#F9FAFB' } : {}]}>
                <Text style={styles.colName}>
                    {p.nombres} {p.primer_apellido} {p.segundo_apellido || ''}
                </Text>
                <Text style={styles.colDoc}>{p.numero_id}</Text>
                <Text style={styles.colTel}>{p.telefono}</Text>
                <Text style={styles.colStatus}>{status}</Text>
                <Text style={styles.colDate}>{date}</Text>
            </View>
        )
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Filadelfia - {titulo}</Text>
                    <Text style={styles.subtitle}>
                        Generado el {new Date().toLocaleDateString('es-CO')} a las {new Date().toLocaleTimeString('es-CO')}
                    </Text>
                    <Text style={styles.subtitle}>
                        Total de personas: {personas.length}
                    </Text>
                </View>

                {/* Tabla */}
                <View style={styles.table}>
                    {/* Header Dinámico */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        {tipoReporte === 'todas' ? (
                            <>
                                <Text style={styles.colNameGen}>Nombre Completo</Text>
                                <Text style={styles.colDocGen}>Documento</Text>
                                <Text style={styles.colTelGen}>Teléfono</Text>
                                <Text style={styles.colBauGen}>Bautizado</Text>
                                <Text style={styles.colTallerGen}>Taller Maestro</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.colName}>Nombre Completo</Text>
                                <Text style={styles.colDoc}>Documento</Text>
                                <Text style={styles.colTel}>Teléfono</Text>
                                <Text style={styles.colStatus}>
                                    {tipoReporte === 'bautizados' ? '¿Bautizado?' :
                                        tipoReporte === 'taller' ? '¿Taller?' : 'Estado'}
                                </Text>
                                <Text style={styles.colDate}>Fecha</Text>
                            </>
                        )}
                    </View>

                    {/* Filas */}
                    {personas.map((p, index) => (
                        tipoReporte === 'todas'
                            ? renderGeneralRow(p, index)
                            : renderSpecificRow(p, index)
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Generado automáticamente por el sistema Filadelfia</Text>
                </View>
            </Page>
        </Document>
    )
}
