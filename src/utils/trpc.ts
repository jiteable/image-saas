import { initTRPC, TRPCError } from "@trpc/server"
import { Session } from "inspector/promises"
import { getServerSession } from "next-auth"

export async function createTRPContest() {
  const session = await getServerSession()

  if (!session?.user) {
    throw new TRPCError({
      code: 'FORBIDDEN'
    })
  }

  return {
    session
  }
}

const t = initTRPC.context<typeof createTRPContest>().create()

const { router, procedure } = t

const middleware = t.middleware(async ({ ctx, next }) => {
  const start = Date.now()

  const result = await next()

  console.log('---> api time: ', Date.now() - start)

  return result
})

const checkLoginMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "FORBIDDEN"
    })
  }

  return next()
})

const loggedProduce = procedure.use(middleware)

const protestedProcedure = procedure.use(checkLoginMiddleware)

export const testRouter = router({
  hello: loggedProduce.query(async ({ ctx }) => {

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null)
      }, 1000)
    })

    return {
      hello: 'world'
    }
  })
})

export type TestRouter = typeof testRouter
