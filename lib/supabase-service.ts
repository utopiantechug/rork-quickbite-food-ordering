import { supabase } from './supabase';
import { Product, Order, User, AuthUser, Customer, CartItem } from '@/types';

export class SupabaseService {
  // Products
  static async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      available: item.available,
    }));
  }

  static async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        available: product.available,
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      available: data.available,
    };
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.price !== undefined && { price: updates.price }),
        ...(updates.category && { category: updates.category }),
        ...(updates.image && { image: updates.image }),
        ...(updates.available !== undefined && { available: updates.available }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      available: data.available,
    };
  }

  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Orders
  static async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      items: item.items as CartItem[],
      total: item.total,
      status: item.status,
      customerName: item.customer_name,
      customerPhone: item.customer_phone,
      customerEmail: item.customer_email,
      orderDate: new Date(item.order_date),
      deliveryDate: new Date(item.delivery_date),
      estimatedTime: item.estimated_time || undefined,
    }));
  }

  static async addOrder(order: Omit<Order, 'id' | 'orderDate'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        items: order.items,
        total: order.total,
        status: order.status,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_email: order.customerEmail,
        order_date: new Date().toISOString(),
        delivery_date: order.deliveryDate.toISOString(),
        estimated_time: order.estimatedTime || null,
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      items: data.items as CartItem[],
      total: data.total,
      status: data.status,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerEmail: data.customer_email,
      orderDate: new Date(data.order_date),
      deliveryDate: new Date(data.delivery_date),
      estimatedTime: data.estimated_time || undefined,
    };
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;
  }

  // Users
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      username: item.username,
      password: item.password,
      name: item.name,
      email: item.email,
      role: item.role,
      isActive: item.is_active,
      createdAt: new Date(item.created_at),
      createdBy: item.created_by || undefined,
    }));
  }

  static async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: user.username,
        password: user.password,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.isActive,
        created_by: user.createdBy || null,
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by || undefined,
    };
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        ...(updates.username && { username: updates.username }),
        ...(updates.password && { password: updates.password }),
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email }),
        ...(updates.role && { role: updates.role }),
        ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Customers (derived from orders)
  static async getCustomers(): Promise<Customer[]> {
    const orders = await this.getOrders();
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

    return Array.from(customerMap.values());
  }
}