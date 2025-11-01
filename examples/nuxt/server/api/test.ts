import { createApiClient } from "@image-sass/api/src";
import jwt from "jsonwebtoken";

const apiKey = process.env.APIKEY
const clientId = process.env.CLIENT_ID

export default defineEventHandler(async (event) => {

  if (!apiKey) {
    throw new Error("APIKEY environment variable is required");
  }

  const token = jwt.sign({
    filename: "屏幕截图 2024-08-19 173036.png",
    contentType: "image/png",
    size: 10378,
    appId: "b0ebb890-e95a-4e9c-9f62-69e072b79735",
    clientId
  }, apiKey)

  return token

})