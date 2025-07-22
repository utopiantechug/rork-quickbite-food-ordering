import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { useBakeryStore } from '@/store/bakery-store';
import { Product, CartItem } from '@/types';
import { DatePicker } from '@/components/DatePicker';

export default function OrderFormScreen() {
  const { products, addOrder } = useBakeryStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [deliveryDate, setDeliveryDate] = useState('');

  const addToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.product.id !== productId));
      return;
    }
    
    setOrderItems(orderItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.product.id !== productId));
  };

  const getTotal = () => {
    return orderItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateOrder = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      Alert.alert('Missing Information', 'Please enter customer name, phone number, and email address');
      return;
    }

    if (!validateEmail(customerEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!deliveryDate) {
      Alert.alert('Missing Information', 'Please select a delivery date');
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert('Empty Order', 'Please add items to the order');
      return;
    }

    const selectedDate = new Date(deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      Alert.alert('Invalid Date', 'Delivery date cannot be in the past');
      return;
    }

    addOrder({
      items: orderItems,
      total: getTotal(),
      status: 'pending',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      deliveryDate: selectedDate,
      estimatedTime: '20-30 minutes',
    });

    Alert.alert(
      'Order Created!',
      'The order has been created successfully.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const renderProductItem = ({ item: product }: { item: Product }) => {
    const orderItem = orderItems.find(item => item.product.id === product.id);
    
    return (
      <View style={styles.productItem}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => addToOrder(product)}
          disabled={!product.available}
        >
          <Plus size={20} color={product.available ? "#fff" : "#ccc"} />
        </Pressable>
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.product.image }} style={styles.orderItemImage} />
      <View style={styles.orderItemInfo}>
        <Text style={styles.orderItemName}>{item.product.name}</Text>
        <Text style={styles.orderItemPrice}>${item.product.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityControls}>
        <Pressable
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
        >
          <Minus size={16} color="#D4A574" />
        </Pressable>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <Pressable
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
        >
          <Plus size={16} color="#D4A574" />
        </Pressable>
      </View>
      <Pressable
        style={styles.removeButton}
        onPress={() => removeFromOrder(item.product.id)}
      >
        <Trash2 size={18} color="#E74C3C" />
      </Pressable>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Order',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color="#2D1810" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Customer Name</Text>
            <TextInput
              style={styles.input}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter customer name"
              placeholderTextColor="#6B5B73"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="Enter phone number"
              placeholderTextColor="#6B5B73"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={customerEmail}
              onChangeText={setCustomerEmail}
              placeholder="Enter email address"
              placeholderTextColor="#6B5B73"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Delivery Date</Text>
            <DatePicker
              value={deliveryDate}
              onDateChange={setDeliveryDate}
              placeholder="Select delivery date"
              minDate={getTomorrowDate()}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Products</Text>
          <FlatList
            data={products.filter(p => p.available)}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {orderItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            <FlatList
              data={orderItems}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.product.id}
              scrollEnabled={false}
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total: ${getTotal().toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Pressable style={styles.createButton} onPress={handleCreateOrder}>
            <Text style={styles.createButtonText}>Create Order</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EB',
  },
  section: {
    margin: 20,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D1810',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D1810',
    backgroundColor: '#fff',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#D4A574',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#D4A574',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#6B5B73',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F1EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
  },
  removeButton: {
    padding: 4,
  },
  totalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4A574',
  },
  buttonContainer: {
    padding: 20,
  },
  createButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});