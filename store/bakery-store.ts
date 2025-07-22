import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, Product, User, Customer } from '@/types';
import { PRODUCTS } from '@/constants/products';

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    products: Product[];
    orders: Order[];
    customers: Customer[];
    user: User | null;
  };
}

interface BakeryState {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Customers
  customers: Customer[];
  updateCustomers: () => void;

  // User
  user: User | null;
  login: (isAdmin: boolean, name: string) => void;
  logout: () => void;

  // Backup & Restore
  createBackup: () => BackupData;
  restoreFromBackup: (backupData: BackupData) => Promise<void>;
  validateBackup: (data: any) => boolean;

  // Reset data (for development/testing)
  resetData: () => void;
}

export const useBakeryStore = create<BakeryState>()(
  persist(
    (set, get) => ({
      // Products
      products: PRODUCTS,
      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: Date.now().toString(),
        };
        set({ products: [...get().products, newProduct] });
      },

      updateProduct: (id, productData) => {
        set({
          products: get().products.map(product =>
            product.id === id ? { ...product, ...productData } : product
          )
        });
      },

      deleteProduct: (id) => {
        set({ products: get().products.filter(product => product.id !== id) });
      },

      // Orders
      orders: [],
      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: Date.now().toString(),
          orderDate: new Date(),
        };
        set({ orders: [...get().orders, newOrder] });
        
        // Update customers after adding order
        setTimeout(() => get().updateCustomers(), 0);
      },

      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        });
      },

      // Customers
      customers: [],
      updateCustomers: () => {
        const { orders } = get();
        const customerMap = new Map<string, Customer>();

        orders.forEach(order => {
          const key = order.customerEmail;
          
          if (customerMap.has(key)) {
            const customer = customerMap.get(key)!;
            customer.totalOrders += 1;
            customer.totalSpent += order.total;
            
            if (!customer.lastOrderDate || order.orderDate > customer.lastOrderDate) {
              customer.lastOrderDate = order.orderDate;
            }
          } else {
            customerMap.set(key, {
              id: key,
              name: order.customerName,
              phone: order.customerPhone,
              email: order.customerEmail,
              totalOrders: 1,
              totalSpent: order.total,
              lastOrderDate: order.orderDate,
            });
          }
        });

        set({ customers: Array.from(customerMap.values()) });
      },

      // User
      user: null,
      login: (isAdmin, name) => {
        set({ user: { isAdmin, name } });
      },

      logout: () => {
        set({ user: null });
      },

      // Backup & Restore
      createBackup: () => {
        const state = get();
        return {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          data: {
            products: state.products,
            orders: state.orders.map(order => ({
              ...order,
              orderDate: order.orderDate.toISOString(),
              deliveryDate: order.deliveryDate.toISOString(),
            })) as any,
            customers: state.customers.map(customer => ({
              ...customer,
              lastOrderDate: customer.lastOrderDate?.toISOString(),
            })) as any,
            user: state.user,
          },
        };
      },

      validateBackup: (data: any): boolean => {
        try {
          // Check if it has the required structure
          if (!data || typeof data !== 'object') return false;
          if (!data.version || !data.timestamp || !data.data) return false;
          
          const { data: backupData } = data;
          
          // Check if required arrays exist
          if (!Array.isArray(backupData.products)) return false;
          if (!Array.isArray(backupData.orders)) return false;
          if (!Array.isArray(backupData.customers)) return false;
          
          // Basic validation of data structure
          if (backupData.products.length > 0) {
            const product = backupData.products[0];
            if (!product.id || !product.name || typeof product.price !== 'number') return false;
          }
          
          if (backupData.orders.length > 0) {
            const order = backupData.orders[0];
            if (!order.id || !order.customerName || !Array.isArray(order.items)) return false;
          }
          
          return true;
        } catch (error) {
          console.error('Backup validation error:', error);
          return false;
        }
      },

      restoreFromBackup: async (backupData: BackupData) => {
        try {
          const { data } = backupData;
          
          // Convert date strings back to Date objects
          const orders = data.orders.map(order => ({
            ...order,
            orderDate: new Date(order.orderDate as any),
            deliveryDate: new Date(order.deliveryDate as any),
          }));
          
          const customers = data.customers.map(customer => ({
            ...customer,
            lastOrderDate: customer.lastOrderDate ? new Date(customer.lastOrderDate as any) : undefined,
          }));
          
          // Update the store with restored data
          set({
            products: data.products,
            orders,
            customers,
            user: data.user,
          });
          
          // Update customers to ensure consistency
          setTimeout(() => get().updateCustomers(), 100);
        } catch (error) {
          console.error('Restore error:', error);
          throw new Error('Failed to restore backup data');
        }
      },

      // Reset data
      resetData: () => {
        set({
          products: PRODUCTS,
          orders: [],
          customers: [],
          user: null,
        });
      },
    }),
    {
      name: 'bakery-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        products: state.products,
        orders: state.orders.map(order => ({
          ...order,
          orderDate: order.orderDate.toISOString(),
          deliveryDate: order.deliveryDate.toISOString(),
        })),
        customers: state.customers.map(customer => ({
          ...customer,
          lastOrderDate: customer.lastOrderDate?.toISOString(),
        })),
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.orders = state.orders.map(order => ({
            ...order,
            orderDate: new Date(order.orderDate),
            deliveryDate: new Date(order.deliveryDate),
          }));
          
          state.customers = state.customers.map(customer => ({
            ...customer,
            lastOrderDate: customer.lastOrderDate ? new Date(customer.lastOrderDate) : undefined,
          }));

          // Update customers after rehydration to ensure consistency
          setTimeout(() => state.updateCustomers(), 100);
        }
      },
    }
  )
);