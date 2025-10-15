import { NextRequest } from "next/server"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch" // 添加此导入
import { testRouter } from "@/utils/trpc"
import { getServerSession } from "next-auth"
import { Session } from "next-auth"
const handler = (request: NextRequest) => {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: request,
    router: testRouter,
    createContext: async () => {
      const session = await getServerSession()

      // 如果没有 session，返回一个默认的空 session 对象
      return {
        session: session || ({} as Session)
      }
    }
  })
}


export { handler as GET, handler as POST }

