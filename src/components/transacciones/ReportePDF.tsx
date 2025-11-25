import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { TransaccionCompleta } from '@/types/transacciones'

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
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
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 5,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
        padding: 15,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 5,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    table: {
        marginTop: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingVertical: 8,
    },
    tableHeader: {
        backgroundColor: '#F9FAFB',
        fontWeight: 'bold',
    },
    col1: { width: '15%', fontSize: 9 },
    col2: { width: '15%', fontSize: 9 },
    col3: { width: '10%', fontSize: 9 },
    col4: { width: '25%', fontSize: 9 },
    col5: { width: '15%', fontSize: 9 },
    col6: { width: '10%', fontSize: 9 },
    col7: { width: '10%', fontSize: 9 },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#9CA3AF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    },
    ingreso: {
        color: '#10B981',
        fontWeight: 'bold',
    },
    egreso: {
        color: '#EF4444',
        fontWeight: 'bold',
    },
})

interface ReportePDFProps {
    transacciones: TransaccionCompleta[]
}

export const ReportePDF: React.FC<ReportePDFProps> = ({ transacciones }) => {
    // Calcular estadísticas
    const totalIngresos = transacciones
        .filter(t => t.tipo === 'ingreso' && t.estado === 'activa')
        .reduce((sum, t) => sum + t.monto, 0)

    const totalEgresos = transacciones
        .filter(t => t.tipo === 'egreso' && t.estado === 'activa')
        .reduce((sum, t) => sum + t.monto, 0)

    const balance = totalIngresos - totalEgresos

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Filadelfia - Reporte de Transacciones</Text>
                    <Text style={styles.subtitle}>
                        Generado el {new Date().toLocaleDateString('es-CO')} a las {new Date().toLocaleTimeString('es-CO')}
                    </Text>
                    <Text style={styles.subtitle}>
                        Total de transacciones: {transacciones.length}
                    </Text>
                </View>

                {/* Estadísticas */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Ingresos</Text>
                        <Text style={[styles.statValue, styles.ingreso]}>
                            {formatCurrency(totalIngresos)}
                        </Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Egresos</Text>
                        <Text style={[styles.statValue, styles.egreso]}>
                            {formatCurrency(totalEgresos)}
                        </Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Balance</Text>
                        <Text style={[styles.statValue, balance >= 0 ? styles.ingreso : styles.egreso]}>
                            {formatCurrency(balance)}
                        </Text>
                    </View>
                </View>

                {/* Tabla */}
                <View style={styles.table}>
                    {/* Header de tabla */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.col1}>Fecha</Text>
                        <Text style={styles.col2}>N° Trans</Text>
                        <Text style={styles.col3}>Tipo</Text>
                        <Text style={styles.col4}>Descripción</Text>
                        <Text style={styles.col5}>Categoría</Text>
                        <Text style={styles.col6}>Monto</Text>
                        <Text style={styles.col7}>Estado</Text>
                    </View>

                    {/* Filas de datos */}
                    {transacciones.map((t, index) => (
                        <View key={t.id || index} style={styles.tableRow}>
                            <Text style={styles.col1}>
                                {new Date(t.fecha).toLocaleDateString('es-CO')}
                            </Text>
                            <Text style={styles.col2}>{t.numero_transaccion}</Text>
                            <Text style={[
                                styles.col3,
                                t.tipo === 'ingreso' ? styles.ingreso : styles.egreso
                            ]}>
                                {t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                            </Text>
                            <Text style={styles.col4}>{t.descripcion || '-'}</Text>
                            <Text style={styles.col5}>{t.categoria?.nombre || '-'}</Text>
                            <Text style={[
                                styles.col6,
                                t.tipo === 'ingreso' ? styles.ingreso : styles.egreso
                            ]}>
                                {formatCurrency(t.monto)}
                            </Text>
                            <Text style={styles.col7}>
                                {t.estado === 'anulada' ? 'Anulada' : 'Activa'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Generado automáticamente por el sistema Filadelfia</Text>
                    <Text>Este documento contiene información confidencial de la organización</Text>
                </View>
            </Page>
        </Document>
    )
}
