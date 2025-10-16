import { initTRPC, TRPCError } from "@trpc/server"
import { Session } from "inspector/promises"
import { getServerSession } from "next-auth"
import { fileRoutes } from "./routes/file";

const t = initTRPC.context().create()

const { router, procedure } = t

export const withLoggerProcedure = procedure.use(async ({ ctx, next }) => {
  const start = Date.now()

  const result = await next()

  return result

})

const withSessionMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = await getServerSession()

  // if (!ctx.session?.user) {
  //   throw new TRPCError({
  //     code: "FORBIDDEN"
  //   })
  // }

  return next({
    ctx: {
      session
    }
  })
})

export const protectedProcedure = withLoggerProcedure.use(withSessionMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "FORBIDDEN"
      })
    }

    return next({
      ctx: {
        session: ctx.session!
      }
    })
  })

export { router }


export const appRouter = router({
  // 如果你有其他路由，在这里添加
  file: fileRoutes,
});

export type AppRouter = typeof appRouter;


