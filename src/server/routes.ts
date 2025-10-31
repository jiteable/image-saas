import { apiKeysRoute } from "./routes/apiKeys";
import { appsRoute } from "./routes/apps";
import { fileRoutes } from "./routes/file";
import { storagesRoute } from "./routes/storages";
import { router } from "./trip"
import { userRoute } from './routes/user'

export const appRouter = router({
  file: fileRoutes,
  apps: appsRoute,
  storages: storagesRoute,
  apiKeys: apiKeysRoute,
  user: userRoute
})

export type AppRouter = typeof appRouter

