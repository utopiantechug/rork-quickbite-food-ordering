export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'breads' | 'pastries' | 'cakes' | 'cookies';
  image: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderDate: Date;
  deliveryDate: Date;
  estimatedTime?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
}

export interface User {
  isAdmin: boolean;
  name: string;
}