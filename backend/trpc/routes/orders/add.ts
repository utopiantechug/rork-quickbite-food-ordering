import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { SupabaseService } from '@/lib/supabase-service';
// import { FirebaseService } from '@/lib/firebase-service';

const cartItemSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.enum(['breads', 'pastries', 'cakes', 'cookies']),
    image: z.string(),
    available: z.boolean(),
  }),
  quantity: z.number(),
});

const addOrderSchema = z.object({
  items: z.array(cartItemSchema),
  total: z.number(),
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).default('pending'),
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string(),
  deliveryDate: z.string().transform(str => new Date(str)),
  estimatedTime: z.string().optional(),
});

export const addOrderProcedure = publicProcedure
  .input(addOrderSchema)
  .mutation(async ({ input }) => {
    // Choose your database service
    return await SupabaseService.addOrder(input);
    // return await FirebaseService.addOrder(input);
  });