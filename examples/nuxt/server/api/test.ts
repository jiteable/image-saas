import { createApiClient } from "@image-sass/api/src";

const apiKey = "3eaa0238-27b3-4ae5-9907-08b9688df07c"

export default defineEventHandler(async (event) => {
  const url = "http://localhost:3000/api/trpc/file.createPresignedUrl?batch=1"

  const apiClient = createApiClient({ apiKey });

  const response = await apiClient.file.createPresignedUrl.mutate({
    filename: "屏幕截图 2024-08-19 173036.png",
    contentType: "image/png",
    size: 10378,
    appId: "796bda6b-ff3c-4cfc-bfb4-330a0e62693d"
  })

  return response

})