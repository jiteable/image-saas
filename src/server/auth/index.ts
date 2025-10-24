import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/server/db/db'
import type { NextAuthOptions } from 'next-auth'
import {
  getServerSession as nextAuthGetServerSession,
} from "next-auth";
import { and, eq } from "drizzle-orm";
import { users, actionToken } from '@/server/db/schema';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 2 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login', // 重定向到 /login
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        name: {},
        password: {},
        code: {},
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        console.log("aa", credentials)

        // 查找用户
        let userResult = await db.select().from(users).where(eq(users.email, credentials.email as string));
        let user = userResult.length > 0 ? userResult[0] : null;

        // 如果提供了密码，验证密码
        if (credentials.password) {
          // 如果用户不存在，创建新用户
          if (!user) {
            // 需要同时提供验证码来创建新用户
            if (!credentials.code) {
              return null
            }

            // 验证验证码（使用actionToken表）
            const verificationTokenResult = await db.select().from(actionToken).where(and(
              eq(actionToken.account, credentials.email as string),
              eq(actionToken.code, credentials.code as string)
            ));
            const verificationToken = verificationTokenResult.length > 0 ? verificationTokenResult[0] : null;

            // 检查验证码是否存在且未过期
            if (!verificationToken || verificationToken.expiredAt < new Date()) {
              // 删除过期的验证码
              if (verificationToken) {
                await db.delete(actionToken).where(and(
                  eq(actionToken.account, credentials.email as string),
                  eq(actionToken.code, credentials.code as string)
                ));
              }
              return null
            }

            // 验证成功后删除验证码
            await db.delete(actionToken).where(and(
              eq(actionToken.account, credentials.email as string),
              eq(actionToken.code, credentials.code as string)
            ));

            // 创建新用户
            const name = credentials.name && typeof credentials.name === 'string'
              ? credentials.name.trim()
              : '';

            const newUserResult = await db.insert(users).values({
              email: credentials.email as string,
              name: name || (credentials.email as string).split('@')[0],
              password: credentials.password as string,
            }).returning();

            user = newUserResult[0];

            return {
              id: user.id,
              email: user.email,
              name: user.name,
            }
          }

          // 检查用户是否有密码
          if (!user.password) {
            return null
          }

          // 验证密码
          if (credentials.password !== user.password) {
            return null
          }

          // 密码验证成功
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        }

        // 如果提供了验证码，验证验证码（用于注册或登录场景）
        if (credentials.code) {
          // 验证验证码（使用actionToken表）
          const verificationTokenResult = await db.select().from(actionToken).where(and(
            eq(actionToken.account, credentials.email as string),
            eq(actionToken.code, credentials.code as string)
          ));
          const verificationToken = verificationTokenResult.length > 0 ? verificationTokenResult[0] : null;

          // 检查验证码是否存在且未过期
          if (!verificationToken || verificationToken.expiredAt < new Date()) {
            // 删除过期的验证码
            if (verificationToken) {
              await db.delete(actionToken).where(and(
                eq(actionToken.account, credentials.email as string),
                eq(actionToken.code, credentials.code as string)
              ));
            }
            return null
          }

          // 验证成功后删除验证码
          await db.delete(actionToken).where(and(
            eq(actionToken.account, credentials.email as string),
            eq(actionToken.code, credentials.code as string)
          ));

          // 如果用户不存在，创建新用户（仅使用验证码的情况）
          if (!user) {
            const name = credentials.name && typeof credentials.name === 'string'
              ? credentials.name.trim()
              : '';

            const newUserResult = await db.insert(users).values({
              email: credentials.email as string,
              name: name || (credentials.email as string).split('@')[0],
            }).returning();

            user = newUserResult[0];
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        }

        // 如果既没有密码也没有验证码，则验证失败
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
      }
      return session
    },
  },
}

export function getServerSession() {
  return nextAuthGetServerSession(authOptions)
}