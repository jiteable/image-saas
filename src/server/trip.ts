import { initTRPC, TRPCError } from "@trpc/server"
import { Session } from "inspector/promises"
import { getServerSession } from "next-auth"

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


