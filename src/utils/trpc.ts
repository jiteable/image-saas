import { initTRPC } from "@trpc/server"
import { appRouter } from "../server/routes"

//Server Side Calls的作用
//在服务器端直接获取数据，用于服务器端渲染（SSR），从而提升首屏加载性能和SEO。
// 避免在客户端先发出一个HTTP请求，因为服务端调用是在同一个服务器进程中直接调用，减少了网络开销。
// (服务端组件发请求也会访问network,再通过network发送给服务器, 通过Server Side Calls
// 可以让服务端组件发送的请求直接传给服务器)
const t = initTRPC.create()
export const createCallerFactory = t.createCallerFactory
export const serverCaller = createCallerFactory(appRouter); 