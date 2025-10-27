import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  date,
  varchar,
  uuid,
  unique,
  serial,
  json
} from "drizzle-orm/pg-core"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import type { AdapterAccount } from "next-auth/adapters"
import { relations } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  plan: text("plan", { enum: ["free", "payed"] }),
  image: text("image"),
  createAt: date("create_at").defaultNow(),
  // 添加认证所需的字段
  password: text("password"),
})

export const userSRelation = relations(users, ({ many }) => ({
  files: many(files),
  app: many(apps),
  storages: many(storageConfiguration)
}))

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
)

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
)

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
  path: varchar("path", { length: 1024 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  userId: text("user_id").notNull(),
  contentType: varchar("content_type", { length: 100 }).notNull(),
  appId: uuid("app_id").notNull()
}, (table) => ({
  cursorIdx: index('cursor_idx').on(table.id, table.createdAt)
}))

export const filesRelations = relations(files, ({ one }) => ({
  files: one(users, { fields: [files.userId], references: [users.id] }),
  app: one(apps, { fields: [files.appId], references: [apps.id] })
}))

export const apps = pgTable("apps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  userId: text("user_id").notNull(),
  storageId: integer("storage_id"),
});


export const appRelation = relations(apps, ({ one, many }) => ({
  user: one(users, { fields: [apps.userId], references: [users.id] }),
  storage: one(storageConfiguration, { fields: [apps.storageId], references: [storageConfiguration.id] }),
  files: many(files),
  apiKeys: many(apiKeys)
}))

export type S3StorageConfiguration = {
  bucket: string;
  region: string;
  assessKeyId: string;
  secretAccessKey: string;
  apiEndpoint?: string
}

export type StorageConfiguration = S3StorageConfiguration

export const storageConfiguration = pgTable("storageConfiguration", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  userId: uuid("user_id").notNull(), // 将 uuid 改为 text 以匹配 users 表的 id 类型
  configuration: json("configuration").$type<S3StorageConfiguration>().notNull(),
  createAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  deletedAt: timestamp("deleted_at", { mode: "date" })
})


export const storageConfigurationRelation = relations(storageConfiguration, ({ one }) => ({
  user: one(users, { fields: [storageConfiguration.userId], references: [users.id] })
}))


export const apiKeys = pgTable('apiKeys', {
  id: serial('id').primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  clientId: varchar("clientId", { length: 100 }).notNull().unique(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  appId: uuid('appId').notNull(),
  createAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  deletedAt: timestamp("deleted_at", { mode: "date" })
})

export const apiKeysRelation = relations(apiKeys, ({ one }) => ({
  app: one(apps, {
    fields: [apiKeys.appId], references: [apps.id]
  })
}))

// 添加验证码表
export const actionToken = pgTable("actionToken", {
  id: serial("id").primaryKey(),
  account: text("account").notNull(), // 存储邮箱
  code: text("code").notNull(), // 验证码
  expiredAt: timestamp("expired_at", { mode: "date" }).notNull(), // 过期时间
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

export const actionTokenRelations = relations(actionToken, ({ one }) => ({
  user: one(users, {
    fields: [actionToken.account],
    references: [users.email]
  })
}))