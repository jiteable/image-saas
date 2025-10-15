import { NextRequest } from "next/server"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch" // 添加此导入
import { testRouter } from "@/utils/trpc"

const handler = (request: NextRequest) => {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: request,
    router: testRouter,
    createContext: () => ({})
  })
}


export { handler as GET, handler as POST }

