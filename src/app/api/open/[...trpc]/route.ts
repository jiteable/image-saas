import { NextRequest } from "next/server"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch" // 添加此导入
import { openRouter } from "@/server/open-router"
const handler = (request: NextRequest) => {
  return fetchRequestHandler({
    endpoint: "/api/open",
    req: request,
    router: openRouter,
    createContext: () => ({})
  })
}


export { handler as GET, handler as POST }

