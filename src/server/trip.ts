import { initTRPC, TRPCError } from "@trpc/server"
import { getServerSession } from "./auth";
import { headers } from "next/headers";
import { db } from "./db/db";
import jwt, { JwtPayload } from "jsonwebtoken";

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

export const withAppProcedure = withLoggerProcedure.use(async ({ next }) => {
  const header = headers();

  const apiKey = (await header).get("api-key");
  const signedToken = (await header).get("signed-token");

  if (apiKey) {
    const apiKeyAndAppUser = await db.query.apiKeys.findFirst({
      where: (apiKeys, { eq, and, isNull }) =>
        and(eq(apiKeys.key, apiKey), isNull(apiKeys.deletedAt)),
      with: {
        app: {
          with: {
            user: true,
            storage: true,
          },
        },
      },
    });

    if (!apiKeyAndAppUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    return next({
      ctx: {
        app: apiKeyAndAppUser.app,
        user: apiKeyAndAppUser.app.user,
      },
    });
  } else if (signedToken) {
    const payload = jwt.decode(signedToken);

    if (!(payload as JwtPayload)?.clientId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "clientId not found",
      });
    }

    const apiKeyAndAppUser = await db.query.apiKeys.findFirst({
      where: (apiKeys, { eq, and, isNull }) =>
        and(
          eq(apiKeys.clientId, (payload as JwtPayload).clientId),
          isNull(apiKeys.deletedAt)
        ),
      with: {
        app: {
          with: {
            user: true,
            storage: true,
          },
        },
      },
    });

    if (!apiKeyAndAppUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    try {
      jwt.verify(signedToken, apiKeyAndAppUser.key);
    } catch (err) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    return next({
      ctx: {
        app: apiKeyAndAppUser.app,
        user: apiKeyAndAppUser.app.user,
      },
    });
  }

  throw new TRPCError({
    code: "FORBIDDEN",
  });
});


export { router }

