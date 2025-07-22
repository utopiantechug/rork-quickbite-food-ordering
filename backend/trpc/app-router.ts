import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { getAllProductsProcedure } from "./routes/products/get-all";
import { addProductProcedure } from "./routes/products/add";
import { getAllOrdersProcedure } from "./routes/orders/get-all";
import { addOrderProcedure } from "./routes/orders/add";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  products: createTRPCRouter({
    getAll: getAllProductsProcedure,
    add: addProductProcedure,
  }),
  orders: createTRPCRouter({
    getAll: getAllOrdersProcedure,
    add: addOrderProcedure,
  }),
});

export type AppRouter = typeof appRouter;