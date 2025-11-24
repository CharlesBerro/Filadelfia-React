import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { TransaccionCompleta } from '@/types/transacciones'

export class ExportService {
    /**
     * Exportar transacciones a PDF
     */
    static exportToPDF(transacciones: TransaccionCompleta[], titulo: string = 'Reporte de Transacciones') {
        const doc = new jsPDF()

        // Título
        doc.setFontSize(18)
        doc.setTextColor(40, 40, 40)
        doc.text(titulo, 14, 22)

        // Fecha de generación
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`, 14, 30)

        // Totales
        let totalIngresos = 0
        let totalEgresos = 0
        transacciones.forEach(t => {
            if (t.tipo === 'ingreso') totalIngresos += t.monto
            else totalEgresos += t.monto
        })

        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        doc.text(`Total Ingresos: $${totalIngresos.toLocaleString('es-CO')}`, 14, 40)
        doc.text(`Total Egresos: $${totalEgresos.toLocaleString('es-CO')}`, 80, 40)
        doc.text(`Balance: $${(totalIngresos - totalEgresos).toLocaleString('es-CO')}`, 150, 40)

        // Tabla
        const tableColumn = ["Fecha", "N° Trans.", "Tipo", "Categoría", "Monto", "Descripción"]
        const tableRows: any[] = []

        transacciones.forEach(t => {
            const transaccionData = [
                new Date(t.fecha).toLocaleDateString('es-CO'),
                t.numero_transaccion,
                t.tipo.toUpperCase(),
                t.categoria?.nombre || '-',
                `$${t.monto.toLocaleString('es-CO')}`,
                t.descripcion || '-'
            ]
            tableRows.push(transaccionData)
        })

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [66, 66, 66] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        })

        doc.save('reporte_transacciones.pdf')
    }

    /**
     * Exportar transacciones a Excel
     */
    static exportToExcel(transacciones: TransaccionCompleta[], filename: string = 'reporte_transacciones') {
        // Preparar datos para Excel
        const data = transacciones.map(t => ({
            Fecha: new Date(t.fecha).toLocaleDateString('es-CO'),
            'N° Transacción': t.numero_transaccion,
            Tipo: t.tipo.toUpperCase(),
            Monto: t.monto,
            Categoría: t.categoria?.nombre || '-',
            Actividad: t.actividad?.nombre || '-',
            Persona: t.persona ? `${t.persona.nombres} ${t.persona.primer_apellido}` : '-',
            Descripción: t.descripcion || '-',
            Estado: t.estado.toUpperCase()
        }))

        // Crear hoja de trabajo
        const ws = XLSX.utils.json_to_sheet(data)

        // Crear libro de trabajo
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Transacciones')

        // Generar buffer
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' })

        // Guardar archivo
        saveAs(dataBlob, `${filename}.xlsx`)
    }
}
