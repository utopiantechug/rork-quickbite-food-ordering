import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ProductCard } from '@/components/ProductCard';
import { NetworkStatus } from '@/components/NetworkStatus';
import { CATEGORIES } from '@/constants/products';
import { useBakeryStore } from '@/store/bakery-store';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { products, user } = useBakeryStore();
  
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <View style={styles.container}>
      <NetworkStatus />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>OvenTreats UG</Text>
          <Text style={styles.subtitle}>Premium Bakery</Text>
        </View>
        {user?.isAdmin && (
          <Pressable style={styles.adminButton} onPress={() => router.push('/admin')}>
            <Settings size={24} color="#D4A574" />
          </Pressable>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryEmoji}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D1810',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5B73',
    marginTop: 2,
  },
  adminButton: {
    padding: 8,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  categoryButtonActive: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D1810',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});