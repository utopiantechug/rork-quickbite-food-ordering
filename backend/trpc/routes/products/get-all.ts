import { publicProcedure } from '../../create-context';
import { SupabaseService } from '@/lib/supabase-service';
// import { FirebaseService } from '@/lib/firebase-service';

export const getAllProductsProcedure = publicProcedure.query(async () => {
  // Choose your database service
  return await SupabaseService.getProducts();
  // return await FirebaseService.getProducts();
});