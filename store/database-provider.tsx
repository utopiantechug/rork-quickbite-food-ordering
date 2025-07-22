import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Order, User, Customer } from '@/types';
import { trpcClient } from '@/lib/trpc';

type DatabaseMode = 'local' | 'supabase' | 'firebase';

interface DatabaseContextType {
  mode: DatabaseMode;
  setMode: (mode: DatabaseMode) => void;
  isOnline: boolean;
  
  // Products
  products: Product[];
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Orders
  orders: Order[];
  loadOrders: () => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  
  // Customers
  customers: Customer[];
  loadCustomers: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<DatabaseMode>('local');
  const [isOnline, setIsOnline] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load database mode from storage
  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('database-mode');
        if (savedMode && ['local', 'supabase', 'firebase'].includes(savedMode)) {
          setMode(savedMode as DatabaseMode);
        }
      } catch (error) {
        console.error('Failed to load database mode:', error);
      }
    };
    loadMode();
  }, []);

  // Save database mode to storage
  const handleSetMode = async (newMode: DatabaseMode) => {
    try {
      await AsyncStorage.setItem('database-mode', newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Failed to save database mode:', error);
    }
  };

  // Products
  const loadProducts = async () => {
    try {
      if (mode === 'local') {
        // Load from local storage via your existing store
        const { useBakeryStore } = await import('./bakery-store');
        const store = useBakeryStore.getState();
        setProducts(store.products);
      } else {
        // Load from cloud database via tRPC
        const cloudProducts = await trpcClient.products.getAll.query();
        setProducts(cloudProducts);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setIsOnline(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      if (mode === 'local') {
        const { useBakeryStore } = await import('./bakery-store');
        const store = useBakeryStore.getState();
        store.addProduct(product);
        await loadProducts();
      } else {
        await trpcClient.products.add.mutate(product);
        await loadProducts();
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      if (mode === 'local') {
        const { useBakeryStore } = await import('./bakery-store');
        const store = useBakeryStore.getState();
        store.updateProduct(id, updates);
        await loadProducts();
      } else {
        // You'll need to add update procedure to tRPC
        console.log('Cloud update not implemented yet');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      if (mode === 'local') {
        const { useBakeryStore } = await import('./bakery-store');
        const store = useBakeryStore.getState();
        store.deleteProduct(id);
        await loadProducts();
      } else {
        // You'll need to add delete procedure to tRPC
        console.log('Cloud delete not implemented yet');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  // Orders
  const loadOrders = async () => {
    try {
      if (mode === 'local') {
        const { useBakeryStore } = await import('./bakery-store');
        const store = useBakeryStore.getState();
        setOrders(store.orders);
      } else {
        const cloudOrders = await trpcClient.orders.getAll.query();
        setOrders(cloudOrders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      setIsOnline(false);
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'orderDate'>) => {
    try {
      if (mode === 'local') {
        const { useBakeryStore } = await import('./bakery-store');
        const store = useBakeryStore.getState();
        await store.addOrder(order);
        await loadOrders();
      } else {
        await trpcClient.orders.add.mutate({
          ...order,
          deliveryDate: order.deliveryDate.toISOString(),
        });
        await loadOrders();
      }
    } catch (error) {
      console.error('Failed to add order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      if (mode === 'local') {
        const { useBakeryStore } = await import('./bakery-store');
        const store = useBakeryStore.getState();
        await store.updateOrderStatus(orderId, status);
        await loadOrders();
      } else {
        // You'll need to add update status procedure to tRPC
        console.log('Cloud order status update not implemented yet');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  // Customers
  const loadCustomers = async () => {
    try {
      if (mode === 'local') {
        const { useBakeryStore } = await import('./bakery-store');
        const store = useBakeryStore.getState();
        setCustomers(store.customers);
      } else {
        // Customers are derived from orders in both services
        await loadOrders();
        // You could call a separate customers endpoint if needed
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      setIsOnline(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (mode) {
      loadProducts();
      loadOrders();
      loadCustomers();
    }
  }, [mode]);

  const value: DatabaseContextType = {
    mode,
    setMode: handleSetMode,
    isOnline,
    products,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    loadOrders,
    addOrder,
    updateOrderStatus,
    customers,
    loadCustomers,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};