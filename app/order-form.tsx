import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Plus, Minus, Trash2, User, Search } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import { useBakeryStore } from '@/store/bakery-store';
import { Product, CartItem, Customer } from '@/types';
import { DatePicker } from '@/components/DatePicker';
import { formatCurrency } from '@/utils/currency';

export default function OrderFormScreen() {
  const { products, addOrder, customers } = useBakeryStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Filter customers based on input
  useEffect(() => {
    if (customerEmail.length > 0 || customerPhone.length > 0 || customerName.length > 0) {
      const query = customerEmail.toLowerCase() || customerPhone || customerName.toLowerCase();
      const filtered = customers.filter(customer =>
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.name.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
      setShowCustomerSuggestions(filtered.length > 0 && query.length > 2);
    } else {
      setShowCustomerSuggestions(false);
      setFilteredCustomers([]);
    }
  }, [customerEmail, customerPhone, customerName, customers]);

  // Filter products based on search query
  useEffect(() => {
    const availableProducts = products.filter(p => p.available);
    if (productSearchQuery.trim().length > 0) {
      const query = productSearchQuery.toLowerCase().trim();
      const filtered = availableProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(availableProducts);
    }
  }, [productSearchQuery, products]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/admin');
    }
  };

  const selectCustomer = (customer: Customer) => {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerEmail(customer.email);
    setShowCustomerSuggestions(false);
  };

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
      [{ text: 'OK', onPress: handleBack }]
    );
  };

  const renderCustomerSuggestion = ({ item: customer }: { item: Customer }) => (
    <Pressable style={styles.suggestionItem} onPress={() => selectCustomer(customer)}>
      <View style={styles.suggestionIcon}>
        <User size={16} color="#D4A574" />
      </View>
      <View style={styles.suggestionInfo}>
        <Text style={styles.suggestionName}>{customer.name}</Text>
        <Text style={styles.suggestionDetails}>{customer.email} • {customer.phone}</Text>
        <Text style={styles.suggestionStats}>
          {customer.totalOrders} orders • {formatCurrency(customer.totalSpent)} spent
        </Text>
      </View>
    </Pressable>
  );

  const renderProductItem = ({ item: product }: { item: Product }) => {
    const orderItem = orderItems.find(item => item.product.id === product.id);
    
    return (
      <View style={styles.productItem}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
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
        <Text style={styles.orderItemPrice}>{formatCurrency(item.product.price)}</Text>
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
            <Pressable onPress={handleBack}>
              <ArrowLeft size={24} color="#2D1810" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          {customers.length > 0 && (
            <View style={styles.customerSearchHint}>
              <Search size={16} color="#6B5B73" />
              <Text style={styles.hintText}>
                Start typing to search existing customers
              </Text>
            </View>
          )}

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

          {showCustomerSuggestions && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Existing Customers:</Text>
              <FlatList
                data={filteredCustomers.slice(0, 3)} // Show max 3 suggestions
                renderItem={renderCustomerSuggestion}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

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
          
          <View style={styles.productSearchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#6B5B73" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={productSearchQuery}
                onChangeText={setProductSearchQuery}
                placeholder="Search products..."
                placeholderTextColor="#6B5B73"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {productSearchQuery.length > 0 && (
                <Pressable
                  style={styles.clearSearchButton}
                  onPress={() => setProductSearchQuery('')}
                >
                  <Text style={styles.clearSearchText}>×</Text>
                </Pressable>
              )}
            </View>
            {productSearchQuery.length > 0 && (
              <Text style={styles.searchResultsText}>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </Text>
            )}
          </View>

          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : productSearchQuery.length > 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No products found matching "{productSearchQuery}"</Text>
              <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
            </View>
          ) : null}
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
              <Text style={styles.totalLabel}>Total: {formatCurrency(getTotal())}</Text>
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
  customerSearchHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#3498DB',
    fontStyle: 'italic',
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
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F5F1EB',
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 2,
  },
  suggestionDetails: {
    fontSize: 14,
    color: '#6B5B73',
    marginBottom: 2,
  },
  suggestionStats: {
    fontSize: 12,
    color: '#D4A574',
    fontWeight: '500',
  },
  productSearchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D1810',
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearSearchText: {
    fontSize: 18,
    color: '#6B5B73',
    fontWeight: '600',
  },
  searchResultsText: {
    fontSize: 14,
    color: '#6B5B73',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  noResultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B5B73',
    textAlign: 'center',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9B9B9B',
    textAlign: 'center',
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