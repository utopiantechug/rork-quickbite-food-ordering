import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Switch } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useBakeryStore } from '@/store/bakery-store';
import { Product } from '@/types';

const CATEGORIES = [
  { id: 'breads', name: 'Breads' },
  { id: 'pastries', name: 'Pastries' },
  { id: 'cakes', name: 'Cakes' },
  { id: 'cookies', name: 'Cookies' },
] as const;

export default function ProductFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { products, addProduct, updateProduct } = useBakeryStore();
  
  const isEditing = !!id;
  const existingProduct = isEditing ? products.find(p => p.id === id) : null;

  const [name, setName] = useState(existingProduct?.name || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [price, setPrice] = useState(existingProduct?.price.toString() || '');
  const [category, setCategory] = useState<Product['category']>(existingProduct?.category || 'breads');
  const [image, setImage] = useState(existingProduct?.image || '');
  const [available, setAvailable] = useState(existingProduct?.available ?? true);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/products');
    }
  };

  const handleSave = () => {
    if (!name.trim() || !description.trim() || !price.trim() || !image.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price in UGX');
      return;
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      category,
      image: image.trim(),
      available,
    };

    if (isEditing && id) {
      updateProduct(id, productData);
      Alert.alert('Success', 'Product updated successfully', [
        { text: 'OK', onPress: handleBack }
      ]);
    } else {
      addProduct(productData);
      Alert.alert('Success', 'Product added successfully', [
        { text: 'OK', onPress: handleBack }
      ]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Product' : 'Add Product',
          headerLeft: () => (
            <Pressable onPress={handleBack}>
              <ArrowLeft size={24} color="#2D1810" />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter product name"
              placeholderTextColor="#6B5B73"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter product description"
              placeholderTextColor="#6B5B73"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Price (UGX)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor="#6B5B73"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat.id && styles.categoryButtonTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={image}
              onChangeText={setImage}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor="#6B5B73"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.inputLabel}>Available for Sale</Text>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ false: '#E8E8E8', true: '#D4A574' }}
              thumbColor={available ? '#fff' : '#f4f3f4'}
            />
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update Product' : 'Add Product'}
            </Text>
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
  content: {
    paddingBottom: 40,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  categoryButtonActive: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D1810',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});