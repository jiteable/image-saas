import { initTRPC, TRPCError } from "@trpc/server"
import { Session } from "inspector/promises"
import { getServerSession } from "./auth";
import { headers } from "next/headers";
import { db } from "./db/db";
import { and, isNull } from "drizzle-orm";

const t = initTRPC.context().create()

const { router, procedure } = t

export const withLoggerProcedure = procedure.use(async ({ ctx, next }) => {
  const start = Date.now()

  const result = await next()

  return result

})

const withSessionMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = await getServerSession()

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
        session: ctx.session
      }
    })
  })


// 创建一个新的公开过程，不需要身份验证
export const publicProcedure = withLoggerProcedure.use(withSessionMiddleware);

// 创建上下文的函数
export async function createContext() {
  const session = await getServerSession();

  return {
    session
  };
}

export const withAppProcedure = withLoggerProcedure.use(
  async ({ next }) => {

    const header = headers()

    const apiKey = (await header).get("api-key")

    if (!apiKey) {
      throw new TRPCError({
        code: "FORBIDDEN"
      })
    }

    const apiKeyAndAppUser = await db.query.apiKeys.findFirst({
      where: (apiKeys, { eq, and }) =>
        and(eq(apiKeys.key, apiKey), isNull(apiKeys.deletedAt)),
      with: {
        app: {
          with: {
            user: true
          }
        }
      }
    })

    if (!apiKeyAndAppUser) {
      throw new TRPCError({
        code: 'NOT_FOUND'
      })
    }


    return next({
      ctx: {
        app: apiKeyAndAppUser.app,
        user: apiKeyAndAppUser.app.user
      }
    })
  }
)


export { router }

