import { createApiClient } from "@image-sass/api"
import jwt from 'jsonwebtoken'

const apiKey = '52c92979-41e3-4456-a8a5-4fcf969111ab'
const clientId = '45437b85-5a8d-40b1-b7a9-7c25a04ef4a9'

export default defineEventHandler(async (event) => {
  const url = 'http://localhost:3000/api/open/file.createPresignedUrl?batch=1'

  const token = jwt.sign({
    "filename": "屏幕截图 2024-08-19 173036.png",
    "contentType": "image/png",
    "size": 10378,
    "appId": "9b122530-f22a-4a42-8a11-63f845e39f20",
    "clientId": clientId
  }, apiKey)

  return token

  // const apiClient = createApiClient({ apiKey })

  // const response = await apiClient.file.createPresignedUrl.mutate({
  //   "filename": "屏幕截图 2024-08-19 173036.png",
  //   "contentType": "image/png",
  //   "size": 10378,
  //   "appId": "9b122530-f22a-4a42-8a11-63f845e39f20"
  // })

  // return response

})