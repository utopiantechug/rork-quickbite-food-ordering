import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order, User, AuthUser, Customer, CartItem } from '@/types';

export class FirebaseService {
  // Helper function to convert Firestore document to typed object
  private static docToData<T>(doc: QueryDocumentSnapshot<DocumentData>): T & { id: string } {
    return { id: doc.id, ...doc.data() } as T & { id: string };
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = this.docToData<Omit<Product, 'id'>>(doc);
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: data.image,
        available: data.available,
      };
    });
  }

  static async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const docRef = await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return { id: docRef.id, ...product };
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  static async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  }

  // Orders
  static async getOrders(): Promise<Order[]> {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = this.docToData<any>(doc);
      return {
        id: doc.id,
        items: data.items as CartItem[],
        total: data.total,
        status: data.status,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        orderDate: data.orderDate.toDate(),
        deliveryDate: data.deliveryDate.toDate(),
        estimatedTime: data.estimatedTime || undefined,
      };
    });
  }

  static async addOrder(order: Omit<Order, 'id' | 'orderDate'>): Promise<Order> {
    const orderData = {
      items: order.items,
      total: order.total,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      orderDate: Timestamp.now(),
      deliveryDate: Timestamp.fromDate(order.deliveryDate),
      estimatedTime: order.estimatedTime || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    return {
      id: docRef.id,
      items: order.items,
      total: order.total,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      orderDate: new Date(),
      deliveryDate: order.deliveryDate,
      estimatedTime: order.estimatedTime,
    };
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  }

  // Users
  static async getUsers(): Promise<User[]> {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = this.docToData<any>(doc);
      return {
        id: doc.id,
        username: data.username,
        password: data.password,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        createdAt: data.createdAt.toDate(),
        createdBy: data.createdBy || undefined,
      };
    });
  }

  static async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const userData = {
      username: user.username,
      password: user.password,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: Timestamp.now(),
      createdBy: user.createdBy || null,
    };

    const docRef = await addDoc(collection(db, 'users'), userData);
    
    return {
      id: docRef.id,
      username: user.username,
      password: user.password,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: new Date(),
      createdBy: user.createdBy,
    };
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  static async deleteUser(id: string): Promise<void> {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
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