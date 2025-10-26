import { protectedProcedure, publicProcedure, router } from "../trip";
import { db } from "../db/db";
import z from "zod"
import { actionToken, apiKeys } from "../db/schema";
import { v4 as uuid } from "uuid";
import { and, eq, gte, lt } from "drizzle-orm";

export const actionTokenRoute = router({
  // 创建或更新操作令牌
  createOrUpdate: publicProcedure
    .input(z.object({
      account: z.email(),
      code: z.string().length(6),
      expiredAt: z.date()
    }))
    .mutation(async ({ input }) => {
      const { account, code, expiredAt } = input;

      // 先尝试查找是否已有该账号的令牌
      const existingToken = await db.query.actionToken.findFirst({
        where: eq(actionToken.account, account)
      });

      if (existingToken) {
        // 更新现有记录
        await db.update(actionToken)
          .set({
            code,
            expiredAt,
            createdAt: new Date()
          })
          .where(eq(actionToken.id, existingToken.id));
      } else {
        // 插入新记录
        await db.insert(actionToken).values({
          account,
          code,
          expiredAt
        });
      }

      return { success: true };
    }),

  // 验证令牌
  verify: publicProcedure
    .input(z.object({
      account: z.email(),
      code: z.string().length(6)
    }))
    .mutation(async ({ input }) => {
      const { account, code } = input;

      // 查找匹配的令牌
      const token = await db.query.actionToken.findFirst({
        where: and(
          eq(actionToken.account, account),
          eq(actionToken.code, code)
        )
      });

      // 如果找不到令牌
      if (!token) {
        return { success: false, message: "无效的验证码" };
      }

      // 如果令牌已过期
      if (token.expiredAt < new Date()) {
        // 删除过期令牌
        await db.delete(actionToken)
          .where(eq(actionToken.id, token.id));

        return { success: false, message: "验证码已过期" };
      }

      // 验证成功后删除令牌
      await db.delete(actionToken)
        .where(eq(actionToken.id, token.id));

      return { success: true };
    }),

});