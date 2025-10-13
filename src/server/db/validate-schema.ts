import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { users } from './schema'

export const InsertUserSchema = createInsertSchema(users, {
  email: z.string().email()
})

export const updateUserSchema = InsertUserSchema.pick({ email: true })

export const queryUserSchema = createSelectSchema(users)
