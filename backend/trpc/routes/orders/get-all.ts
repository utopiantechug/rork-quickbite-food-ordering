import { publicProcedure } from '../../create-context';
import { SupabaseService } from '@/lib/supabase-service';
// import { FirebaseService } from '@/lib/firebase-service';

export const getAllOrdersProcedure = publicProcedure.query(async () => {
  // Choose your database service
  return await SupabaseService.getOrders();
  // return await FirebaseService.getOrders();
});