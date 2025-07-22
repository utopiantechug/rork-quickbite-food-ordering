import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { useBakeryStore } from '@/store/bakery-store';
import { Product } from '@/types';

export default function ProductsScreen() {
  const { products, deleteProduct } = useBakeryStore();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteProduct(product.id)
        }
      ]
    );
  };

  const renderProductCard = ({ item: product }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
        <View style={styles.productStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: product.available ? '#27AE60' : '#E74C3C' }
          ]}>
            <Text style={styles.statusText}>
              {product.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.productActions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push(`/product-form?id=${product.id}`)}
        >
          <Edit size={18} color="#3498DB" />
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => handleDeleteProduct(product)}
        >
          <Trash2 size={18} color="#E74C3C" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Product Management',
          headerLeft: () => (
            <Pressable onPress={handleBack}>
              <ArrowLeft size={24} color="#2D1810" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => router.push('/product-form')}>
              <Plus size={24} color="#D4A574" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {products.filter(p => p.available).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {products.filter(p => !p.available).length}
            </Text>
            <Text style={styles.statLabel}>Unavailable</Text>
          </View>
        </View>

        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
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
  productDescription: {
    fontSize: 14,
    color: '#6B5B73',
    marginBottom: 8,
    lineHeight: 18,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A574',
  },
  productCategory: {
    fontSize: 12,
    color: '#6B5B73',
    textTransform: 'capitalize',
    backgroundColor: '#F5F1EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productStatus: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productActions: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F1EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});