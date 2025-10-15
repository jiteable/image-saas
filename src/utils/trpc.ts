import { initTRPC, TRPCError } from "@trpc/server"
import { Session } from "inspector/promises"
import { getServerSession } from "next-auth"

export async function createTRPCContext() {
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

const t = initTRPC.context<typeof createTRPCContext>().create()

const { router, procedure, createCallerFactory } = t

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

//Server Side Calls的作用
//在服务器端直接获取数据，用于服务器端渲染（SSR），从而提升首屏加载性能和SEO。
// 避免在客户端先发出一个HTTP请求，因为服务端调用是在同一个服务器进程中直接调用，减少了网络开销。
// (服务端组件发请求也会访问network,再通过network发送给服务器, 通过Server Side Calls
// 可以让服务端组件发送的请求直接传给服务器)
export const serverCaller = createCallerFactory(testRouter); 