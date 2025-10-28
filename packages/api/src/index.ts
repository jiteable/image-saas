import { httpBatchLink, createTRPCClient } from "@trpc/client";
import { type OpenRouter } from "./open-router-dts";



export const apiClient = createTRPCClient<OpenRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/open",
    }),
  ],
});

export const createApiClient = (
  { apiKey, signedToken }: { apiKey: string, signedToken?: string }
) => {
  return createTRPCClient<OpenRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/api/open",
        headers: {
          "api-key": apiKey,
          "signed-token": signedToken
        }
      }),
    ],
  });
}

export { OpenRouter }