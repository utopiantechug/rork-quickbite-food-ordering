import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Order } from '@/types';
import { formatCurrency } from '@/utils/currency';

interface InvoiceProps {
  order: Order;
}

export function Invoice({ order }: InvoiceProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-UG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-UG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.invoice}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.bakeryName}>OvenTreats UG</Text>
        <Text style={styles.bakerySubtitle}>Bakery - Kampala, Uganda</Text>
        <Text style={styles.invoiceTitle}>INVOICE</Text>
      </View>

      {/* Order Info */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Invoice #:</Text>
          <Text style={styles.value}>INV-{order.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Order Date:</Text>
          <Text style={styles.value}>{formatDate(order.orderDate)} at {formatTime(order.orderDate)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Delivery Date:</Text>
          <Text style={styles.value}>{formatDate(order.deliveryDate)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, styles.statusReady]}>Ready for Pickup</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill To:</Text>
        <Text style={styles.customerName}>{order.customerName}</Text>
        <Text style={styles.customerInfo}>{order.customerPhone}</Text>
        <Text style={styles.customerInfo}>{order.customerEmail}</Text>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items:</Text>
        <View style={styles.itemsHeader}>
          <Text style={[styles.itemHeaderText, styles.itemName]}>Item</Text>
          <Text style={[styles.itemHeaderText, styles.itemQty]}>Qty</Text>
          <Text style={[styles.itemHeaderText, styles.itemPrice]}>Price</Text>
          <Text style={[styles.itemHeaderText, styles.itemTotal]}>Total</Text>
        </View>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={[styles.itemText, styles.itemName]}>{item.product.name}</Text>
            <Text style={[styles.itemText, styles.itemQty]}>{item.quantity}</Text>
            <Text style={[styles.itemText, styles.itemPrice]}>{formatCurrency(item.product.price)}</Text>
            <Text style={[styles.itemText, styles.itemTotal]}>{formatCurrency(item.product.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(order.total)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Thank you for choosing Golden Crust Bakery!</Text>
        <Text style={styles.footerText}>Your order is ready for pickup.</Text>
        {order.estimatedTime && (
          <Text style={styles.footerText}>Estimated preparation time was: {order.estimatedTime}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  invoice: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
  },
  bakeryName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 4,
  },
  bakerySubtitle: {
    fontSize: 16,
    color: '#6B5B73',
    marginBottom: 16,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#D4A574',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B5B73',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#2D1810',
    fontWeight: '600',
  },
  statusReady: {
    color: '#27AE60',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 14,
    color: '#6B5B73',
    marginBottom: 2,
  },
  itemsHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#F5F1EB',
    marginBottom: 8,
  },
  itemHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F1EB',
  },
  itemText: {
    fontSize: 14,
    color: '#2D1810',
  },
  itemName: {
    flex: 2,
  },
  itemQty: {
    flex: 1,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    textAlign: 'right',
  },
  itemTotal: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  totalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#D4A574',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1810',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4A574',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B5B73',
    textAlign: 'center',
    marginBottom: 4,
  },
});