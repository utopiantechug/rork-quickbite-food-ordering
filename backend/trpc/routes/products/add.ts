import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { SupabaseService } from '@/lib/supabase-service';
// import { FirebaseService } from '@/lib/firebase-service';

const addProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.enum(['breads', 'pastries', 'cakes', 'cookies']),
  image: z.string(),
  available: z.boolean().default(true),
});

export const addProductProcedure = publicProcedure
  .input(addProductSchema)
  .mutation(async ({ input }) => {
    // Choose your database service
    return await SupabaseService.addProduct(input);
    // return await FirebaseService.addProduct(input);
  });