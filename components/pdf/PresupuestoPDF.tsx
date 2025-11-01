'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { Habitacion } from '@/app/presupuestos/nuevo/components/FormHabitaciones'

interface PresupuestoPDFProps {
  datos: {
    cliente: any
    obra: any
    espacio: any
    habitaciones: Habitacion[]
    trabajos: Array<{ habitacionId: string, servicios: any[] }>
  }
}

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderColor: '#3b82f6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 11,
  },
  label: {
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    color: '#0f172a',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    color: '#FFFFFF',
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: 1,
    borderColor: '#e2e8f0',
    fontSize: 9,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#dbeafe',
    borderTop: 2,
    borderColor: '#3b82f6',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    borderTop: 1,
    borderColor: '#e2e8f0',
    paddingTop: 10,
  },
})

export const PresupuestoPDF: React.FC<PresupuestoPDFProps> = ({ datos }) => {
  // Calcular totales
  const calcularTotales = () => {
    let subtotal = 0

    datos.trabajos.forEach(trabajo => {
      trabajo.servicios.forEach(servicio => {
        if (servicio.calculo) {
          subtotal += servicio.calculo.subtotal || 0
        } else if (servicio.precioPorMetro) {
          const habitacion = datos.habitaciones.find(h => h.id === trabajo.habitacionId)
          if (habitacion) {
            const metros = parseFloat(habitacion.metrosCuadrados) || 0
            subtotal += metros * servicio.precioPorMetro
          }
        }
      })
    })

    const iva = subtotal * 0.21
    const total = subtotal + iva

    return { subtotal, iva, total }
  }

  const totales = calcularTotales()
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PRESUPUESTO DE REFORMA</Text>
          <Text style={styles.subtitle}>
            {datos.obra.tipo.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={{ fontSize: 10, color: '#94a3b8' }}>
            Generado el {fechaActual}
          </Text>
        </View>

        {/* Información del Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{datos.cliente.nombre}</Text>
          </View>
          {datos.cliente.telefono && (
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{datos.cliente.telefono}</Text>
            </View>
          )}
          {datos.cliente.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{datos.cliente.email}</Text>
            </View>
          )}
          {datos.cliente.direccion && (
            <View style={styles.row}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{datos.cliente.direccion}</Text>
            </View>
          )}
        </View>

        {/* Información del Inmueble */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Inmueble</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Metros totales:</Text>
            <Text style={styles.value}>{datos.espacio.metrosTotales || 'N/A'} m²</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Altura techos:</Text>
            <Text style={styles.value}>{datos.espacio.alturaTechos || 'N/A'} m</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={styles.value}>
              {datos.espacio.estado === 'nuevo' ? 'Nuevo' :
               datos.espacio.estado === 'reciente' ? 'Reciente' : 'Antiguo'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Número de habitaciones:</Text>
            <Text style={styles.value}>{datos.habitaciones.length}</Text>
          </View>
        </View>

        {/* Descripción de la Obra */}
        {datos.obra.descripcion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción del Proyecto</Text>
            <Text style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
              {datos.obra.descripcion}
            </Text>
          </View>
        )}

        {/* Tabla de Habitaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habitaciones</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ width: '40%' }}>Habitación</Text>
              <Text style={{ width: '25%', textAlign: 'center' }}>Tipo</Text>
              <Text style={{ width: '20%', textAlign: 'right' }}>M²</Text>
              <Text style={{ width: '15%', textAlign: 'right' }}>Altura</Text>
            </View>
            {datos.habitaciones.map((hab) => (
              <View key={hab.id} style={styles.tableRow}>
                <Text style={{ width: '40%' }}>{hab.nombre || 'Sin nombre'}</Text>
                <Text style={{ width: '25%', textAlign: 'center' }}>
                  {hab.tipo.replace('_', ' ')}
                </Text>
                <Text style={{ width: '20%', textAlign: 'right' }}>
                  {hab.metrosCuadrados || '0'}
                </Text>
                <Text style={{ width: '15%', textAlign: 'right' }}>
                  {hab.alturaTechos || 'N/A'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabla de Trabajos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajos y Servicios</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ width: '35%' }}>Servicio</Text>
              <Text style={{ width: '30%', textAlign: 'center' }}>Habitación</Text>
              <Text style={{ width: '20%', textAlign: 'right' }}>M²</Text>
              <Text style={{ width: '15%', textAlign: 'right' }}>Precio</Text>
            </View>
            {datos.trabajos.map((trabajo) => {
              const habitacion = datos.habitaciones.find(h => h.id === trabajo.habitacionId)
              return trabajo.servicios.map((servicio, idx) => {
                const metros = habitacion ? parseFloat(habitacion.metrosCuadrados) : 0
                const precio = servicio.calculo?.total || 
                             (servicio.precioPorMetro ? metros * servicio.precioPorMetro * 1.21 : 0)
                
                return (
                  <View key={`${trabajo.habitacionId}-${idx}`} style={styles.tableRow}>
                    <Text style={{ width: '35%' }}>
                      {servicio.tipo.replace('_', ' ')}
                    </Text>
                    <Text style={{ width: '30%', textAlign: 'center' }}>
                      {habitacion?.nombre || 'N/A'}
                    </Text>
                    <Text style={{ width: '20%', textAlign: 'right' }}>
                      {metros.toFixed(1)}
                    </Text>
                    <Text style={{ width: '15%', textAlign: 'right' }}>
                      €{precio.toFixed(2)}
                    </Text>
                  </View>
                )
              })
            }).flat()}
          </View>
        </View>

        {/* Resumen Financiero */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>€{totales.total.toFixed(2)}</Text>
        </View>
        <View style={{ marginTop: 5 }}>
          <View style={styles.row}>
            <Text style={{ fontSize: 10, color: '#64748b' }}>Subtotal (sin IVA):</Text>
            <Text style={{ fontSize: 10, color: '#475569' }}>
              €{totales.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={{ fontSize: 10, color: '#64748b' }}>IVA (21%):</Text>
            <Text style={{ fontSize: 10, color: '#475569' }}>
              €{totales.iva.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Este presupuesto tiene una validez de 30 días desde su emisión.</Text>
        </View>
      </Page>
    </Document>
  )
}

