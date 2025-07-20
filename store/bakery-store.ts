import { create } from 'zustand';
import { Order, Product, User } from '@/types';
import { PRODUCTS } from '@/constants/products';

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

  // User
  user: User | null;
  login: (isAdmin: boolean, name: string) => void;
  logout: () => void;
}

export const useBakeryStore = create<BakeryState>((set, get) => ({
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
  },

  updateOrderStatus: (orderId, status) => {
    set({
      orders: get().orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    });
  },

  // User
  user: null,
  login: (isAdmin, name) => {
    set({ user: { isAdmin, name } });
  },

  logout: () => {
    set({ user: null });
  },
}));