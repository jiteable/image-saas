import { createApiClient } from "@image-sass/api/src";
import jwt from "jsonwebtoken";

const apiKey = "3eaa0238-27b3-4ae5-9907-08b9688df07c"
const clientId = "246"

export default defineEventHandler(async (event) => {

  const token = jwt.sign({
    filename: "屏幕截图 2024-08-19 173036.png",
    contentType: "image/png",
    size: 10378,
    appId: "796bda6b-ff3c-4cfc-bfb4-330a0e62693d",
    clientId
  }, apiKey)

  // const apiClient = createApiClient({ apiKey });

  // const response = await apiClient.file.createPresignedUrl.mutate({
  //   filename: "屏幕截图 2024-08-19 173036.png",
  //   contentType: "image/png",
  //   size: 10378,
  //   appId: "796bda6b-ff3c-4cfc-bfb4-330a0e62693d"
  // })

  // return response

  return token

})