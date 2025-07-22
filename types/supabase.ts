export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category: 'breads' | 'pastries' | 'cakes' | 'cookies'
          image: string
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category: 'breads' | 'pastries' | 'cakes' | 'cookies'
          image: string
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          category?: 'breads' | 'pastries' | 'cakes' | 'cookies'
          image?: string
          available?: boolean
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          items: Json
          total: number
          status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          customer_name: string
          customer_phone: string
          customer_email: string
          order_date: string
          delivery_date: string
          estimated_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          items: Json
          total: number
          status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          customer_name: string
          customer_phone: string
          customer_email: string
          order_date: string
          delivery_date: string
          estimated_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          items?: Json
          total?: number
          status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          customer_name?: string
          customer_phone?: string
          customer_email?: string
          order_date?: string
          delivery_date?: string
          estimated_time?: string | null
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string
          password: string
          name: string
          email: string
          role: 'admin' | 'staff'
          is_active: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          username: string
          password: string
          name: string
          email: string
          role: 'admin' | 'staff'
          is_active?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          username?: string
          password?: string
          name?: string
          email?: string
          role?: 'admin' | 'staff'
          is_active?: boolean
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}