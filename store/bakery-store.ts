import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, Product, User, AuthUser, Customer } from '@/types';
import { PRODUCTS } from '@/constants/products';

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    products: Product[];
    orders: Order[];
    customers: Customer[];
    users: User[];
    currentUser: AuthUser | null;
  };
}

interface BakeryState {
  // Authentication
  currentUser: AuthUser | null;
  users: User[];
  login: (username: string, password: string) => Promise<AuthUser | null>;
  logout: () => void;
  registerUser: (userData: Omit<User, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  initializeAdmin: (adminData: { username: string; password: string; name: string; email: string }) => void;
  isInitialized: () => boolean;

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

  // Backup & Restore
  createBackup: () => BackupData;
  restoreFromBackup: (backupData: BackupData) => Promise<void>;
  validateBackup: (data: any) => boolean;

  // Reset data (for development/testing)
  resetData: () => void;
}

// Simple password hashing (in production, use proper bcrypt)
const hashPassword = (password: string): string => {
  return btoa(password + 'oventreats_salt');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const useBakeryStore = create<BakeryState>()(
  persist(
    (set, get) => ({
      // Authentication
      currentUser: null,
      users: [],

      isInitialized: () => {
        return get().users.length > 0;
      },

      initializeAdmin: (adminData) => {
        const adminUser: User = {
          id: 'admin-' + Date.now(),
          username: adminData.username,
          password: hashPassword(adminData.password),
          name: adminData.name,
          email: adminData.email,
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
        };
        
        set({ users: [adminUser] });
      },

      login: async (username, password) => {
        const { users } = get();
        const user = users.find(u => u.username === username && u.isActive);
        
        if (user && verifyPassword(password, user.password)) {
          const authUser: AuthUser = {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
          };
          set({ currentUser: authUser });
          return authUser;
        }
        
        return null;
      },

      logout: () => {
        set({ currentUser: null });
      },

      registerUser: (userData) => {
        const { users, currentUser } = get();
        
        // Check if username already exists
        if (users.find(u => u.username === userData.username)) {
          throw new Error('Username already exists');
        }
        
        const newUser: User = {
          ...userData,
          id: 'user-' + Date.now(),
          password: hashPassword(userData.password),
          createdAt: new Date(),
          createdBy: currentUser?.id,
        };
        
        set({ users: [...users, newUser] });
      },

      updateUser: (id, userData) => {
        set({
          users: get().users.map(user => {
            if (user.id === id) {
              const updatedUser = { ...user, ...userData };
              // If password is being updated, hash it
              if (userData.password) {
                updatedUser.password = hashPassword(userData.password);
              }
              return updatedUser;
            }
            return user;
          })
        });
      },

      deleteUser: (id) => {
        const { currentUser } = get();
        // Prevent deleting yourself
        if (currentUser?.id === id) {
          throw new Error('Cannot delete your own account');
        }
        
        set({ users: get().users.filter(user => user.id !== id) });
      },

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
            users: state.users.map(user => ({
              ...user,
              createdAt: user.createdAt.toISOString(),
            })) as any,
            currentUser: state.currentUser,
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
          if (!Array.isArray(backupData.users)) return false;
          
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
          
          const users = data.users.map(user => ({
            ...user,
            createdAt: new Date(user.createdAt as any),
          }));
          
          // Update the store with restored data
          set({
            products: data.products,
            orders,
            customers,
            users,
            currentUser: data.currentUser,
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
          // Don't reset users and currentUser
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
        users: state.users.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        })),
        currentUser: state.currentUser,
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

          state.users = state.users.map(user => ({
            ...user,
            createdAt: new Date(user.createdAt),
          }));

          // Update customers after rehydration to ensure consistency
          setTimeout(() => state.updateCustomers(), 100);
        }
      },
    }
  )
);