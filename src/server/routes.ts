import { fileRoutes } from "./routes/file";
import { router } from "./trip"

export const appRouter = router({
  file: fileRoutes
})

export type AppRouter = typeof appRouter

