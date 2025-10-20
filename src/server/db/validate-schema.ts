import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { apps, files, storageConfiguration, users } from './schema'

export const InsertUserSchema = createInsertSchema(users, {
  email: z.string().email()
})

export const updateUserSchema = InsertUserSchema.pick({ email: true })

export const queryUserSchema = createSelectSchema(users)

export const fileSchema = createSelectSchema(files)

export const filesCanOrderByColumns = fileSchema.pick({
  createdAt: true,
  deletedAt: true
})

export const createAppSchema = createInsertSchema(apps, {
  name: (schema) => schema.min(3)
})

export const createStorageSchema = createInsertSchema(storageConfiguration)