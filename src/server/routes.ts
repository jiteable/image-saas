
import { appsRoute } from "./routes/apps";
import { fileRoutes } from "./routes/file";
import { router } from "./trip"

export const appRouter = router({
  file: fileRoutes,
  apps: appsRoute
})

export type AppRouter = typeof appRouter

