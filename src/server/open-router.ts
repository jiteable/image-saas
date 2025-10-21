
import { fileOpenRoutes } from "./routes/file-open";
import { router } from "./trip"

export const openRouter = router({
  file: fileOpenRoutes,
})

export type OpenRouter = typeof openRouter

