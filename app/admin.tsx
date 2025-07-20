import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Clock, CheckCircle, XCircle, Plus } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useBakeryStore } from '@/store/bakery-store';
import { Order } from '@/types';

export default function AdminScreen() {
  const { orders, updateOrderStatus } = useBakeryStore();

  const handleStatusUpdate = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color="#F39C12" />;
      case 'preparing':
        return <Clock size={16} color="#3498DB" />;
      case 'ready':
        return <CheckCircle size={16} color="#27AE60" />;
      case 'completed':
        return <CheckCircle size={16} color="#95A5A6" />;
      case 'cancelled':
        return <XCircle size={16} color="#E74C3C" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderOrderCard = ({ item: order }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{order.id}</Text>
        <View style={styles.statusContainer}>
          {getStatusIcon(order.status)}
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <Text style={styles.customerInfo}>
        {order.customerName} • {order.customerPhone}
      </Text>

      <Text style={styles.deliveryInfo}>
        Delivery: {formatDate(order.deliveryDate)}
      </Text>

      <View style={styles.itemsList}>
        {order.items.map((item, index) => (
          <Text key={index} style={styles.itemText}>
            {item.quantity}x {item.product.name}
          </Text>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.total}>${order.total.toFixed(2)}</Text>
        <Text style={styles.orderDate}>
          {order.orderDate.toLocaleDateString()} {order.orderDate.toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        {order.status === 'pending' && (
          <>
            <Pressable
              style={[styles.actionButton, styles.prepareButton]}
              onPress={() => handleStatusUpdate(order.id, 'preparing')}
            >
              <Text style={styles.actionButtonText}>Start Preparing</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleStatusUpdate(order.id, 'cancelled')}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </Pressable>
          </>
        )}
        
        {order.status === 'preparing' && (
          <Pressable
            style={[styles.actionButton, styles.readyButton]}
            onPress={() => handleStatusUpdate(order.id, 'ready')}
          >
            <Text style={styles.actionButtonText}>Mark Ready</Text>
          </Pressable>
        )}
        
        {order.status === 'ready' && (
          <Pressable
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleStatusUpdate(order.id, 'completed')}
          >
            <Text style={styles.actionButtonText}>Complete Order</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Order Management',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color="#2D1810" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => router.push('/order-form')}>
              <Plus size={24} color="#D4A574" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {orders.filter(o => o.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {orders.filter(o => o.status === 'preparing').length}
            </Text>
            <Text style={styles.statLabel}>Preparing</Text>
          </View>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>Orders will appear here once they are created</Text>
            <Pressable style={styles.createButton} onPress={() => router.push('/order-form')}>
              <Text style={styles.createButtonText}>Create First Order</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={orders.sort((a, b) => {
              const statusOrder = { pending: 0, preparing: 1, ready: 2, completed: 3, cancelled: 4 };
              return statusOrder[a.status] - statusOrder[b.status] || 
                     b.orderDate.getTime() - a.orderDate.getTime();
            })}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EB',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4A574',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B5B73',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B5B73',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
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
  orderHeader: {
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B5B73',
    textTransform: 'capitalize',
  },
  customerInfo: {
    fontSize: 14,
    color: '#6B5B73',
    marginBottom: 4,
  },
  deliveryInfo: {
    fontSize: 14,
    color: '#D4A574',
    fontWeight: '600',
    marginBottom: 12,
  },
  itemsList: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#2D1810',
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A574',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B5B73',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  prepareButton: {
    backgroundColor: '#3498DB',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
  },
  readyButton: {
    backgroundColor: '#27AE60',
  },
  completeButton: {
    backgroundColor: '#95A5A6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});