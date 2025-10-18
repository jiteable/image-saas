import { httpBatchLink, createTRPCClient } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/trip"; // 更新导入路径

// 使用正确的 AppRouter 类型
export const trpcClientReact = createTRPCReact<AppRouter>({});

export const trpcClient = trpcClientReact.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
    }),
  ],
});

export const trpcPureClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
    }),
  ],
});

export { AppRouter }