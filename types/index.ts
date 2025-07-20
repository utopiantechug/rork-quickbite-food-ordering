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
  orderDate: Date;
  deliveryDate: Date;
  estimatedTime?: string;
}

export interface User {
  isAdmin: boolean;
  name: string;
}