import { StyleSheet, Text, View } from 'react-native';
import { Order } from '@/types';

interface OrderCardProps {
  order: Order;
}

const statusColors = {
  pending: '#F39C12',
  preparing: '#3498DB',
  ready: '#27AE60',
  completed: '#95A5A6',
  cancelled: '#E74C3C',
};

const statusLabels = {
  pending: 'Order Received',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function OrderCard({ order }: OrderCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] }]}>
          <Text style={styles.statusText}>{statusLabels[order.status]}</Text>
        </View>
      </View>
      
      <Text style={styles.date}>
        Ordered: {order.orderDate.toLocaleDateString()} at {order.orderDate.toLocaleTimeString()}
      </Text>
      
      <Text style={styles.deliveryDate}>
        Delivery: {formatDate(order.deliveryDate)}
      </Text>
      
      <View style={styles.items}>
        {order.items.map((item, index) => (
          <Text key={index} style={styles.item}>
            {item.quantity}x {item.product.name}
          </Text>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.customer}>{order.customerName}</Text>
        <Text style={styles.total}>${order.total.toFixed(2)}</Text>
      </View>
      
      {order.estimatedTime && (
        <Text style={styles.estimatedTime}>
          Estimated ready: {order.estimatedTime}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#6B5B73',
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 14,
    color: '#D4A574',
    fontWeight: '600',
    marginBottom: 12,
  },
  items: {
    marginBottom: 12,
  },
  item: {
    fontSize: 14,
    color: '#2D1810',
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customer: {
    fontSize: 14,
    color: '#6B5B73',
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A574',
  },
  estimatedTime: {
    fontSize: 12,
    color: '#27AE60',
    marginTop: 8,
    fontStyle: 'italic',
  },
});