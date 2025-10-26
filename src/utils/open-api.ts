import { httpBatchLink, createTRPCClient } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

import { type OpenRouter } from "@/server/open-router";



export const apiClient = createTRPCClient<OpenRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
    }),
  ],
});

export { OpenRouter }