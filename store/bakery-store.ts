import { create } from 'zustand';
import { Order, Product, User, Customer } from '@/types';
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

  // Customers
  customers: Customer[];
  updateCustomers: () => void;

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
}));