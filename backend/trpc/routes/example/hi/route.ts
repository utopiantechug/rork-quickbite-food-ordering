import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(z.object({ name: z.string().min(1, "Name is required") }))
  .mutation(({ input }) => {
    try {
      return {
        hello: input.name,
        date: new Date(),
        status: 'success',
      };
    } catch (error) {
      console.error('Hi route error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process request',
      });
    }
  });