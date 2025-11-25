import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer'
import { TransaccionCompleta } from '@/types/transacciones'

// Registrar fuentes si es necesario (opcional, usando standard fonts por ahora)
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#10B981', // Green-500
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#10B981',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#374151', // Gray-700
    },
    subtitle: {
        fontSize: 10,
        color: '#6B7280', // Gray-500
    },
    receiptInfo: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    receiptNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
    },
    date: {
        fontSize: 10,
        color: '#6B7280',
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB', // Gray-200
        paddingVertical: 8,
    },
    label: {
        width: '30%',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    value: {
        width: '70%',
        fontSize: 10,
        color: '#111827', // Gray-900
    },
    amountRow: {
        flexDirection: 'row',
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: '#10B981',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#374151',
    },
    amountValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10B981',
    },
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
    statusBadge: {
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 10,
        marginTop: 5,
        alignSelf: 'flex-end',
    },
    statusActive: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
    },
    statusVoid: {
        backgroundColor: '#F3F4F6',
        color: '#374151',
        textDecoration: 'line-through',
    },
})

interface ComprobantePDFProps {
    transaccion: TransaccionCompleta
}

export const ComprobantePDF: React.FC<ComprobantePDFProps> = ({ transaccion }) => {
    const isIngreso = transaccion.tipo === 'ingreso'
    const isAnulada = transaccion.estado === 'anulada'

    return (
        <Document>
            <Page size="A5" style={styles.page} orientation="landscape"> {/* Tamaño recibo */}
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>Filadelfia</Text>
                    </View>
                    <View style={styles.receiptInfo}>
                        <Text style={styles.title}>COMPROBANTE DE {isIngreso ? 'INGRESO' : 'EGRESO'}</Text>
                        <Text style={styles.receiptNumber}>N° {transaccion.numero_transaccion || '---'}</Text>
                        <Text style={styles.date}>{new Date(transaccion.fecha).toLocaleDateString('es-CO')}</Text>
                        {isAnulada && (
                            <Text style={{ color: 'red', fontSize: 12, fontWeight: 'bold' }}>ANULADA</Text>
                        )}
                    </View>
                </View>

                {/* Detalles */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Categoría:</Text>
                        <Text style={styles.value}>{transaccion.categoria?.nombre || 'Sin categoría'}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Persona:</Text>
                        <Text style={styles.value}>
                            {transaccion.persona
                                ? `${transaccion.persona.nombres} ${transaccion.persona.primer_apellido}`
                                : 'No especificada'}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Descripción:</Text>
                        <Text style={styles.value}>{transaccion.descripcion || '-'}</Text>
                    </View>

                    {transaccion.actividad && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Actividad:</Text>
                            <Text style={styles.value}>{transaccion.actividad.nombre}</Text>
                        </View>
                    )}

                    {/* Total */}
                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>TOTAL:</Text>
                        <Text style={styles.amountValue}>
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(transaccion.monto)}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Generado automáticamente por el sistema Filadelfia el {new Date().toLocaleString('es-CO')}</Text>
                    <Text>Este documento es un comprobante válido de la transacción registrada.</Text>
                </View>
            </Page>
        </Document>
    )
}
