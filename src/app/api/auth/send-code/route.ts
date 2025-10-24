import { db } from "@/server/db/db";
import { users, actionToken } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { genSuccessData, genErrorData } from '@/app/api/utils/gen-res-data';

export async function POST(request: Request) {
  console.log('aaaaaaaaaaaaa')
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('请求体解析失败:', parseError);
      return Response.json(genErrorData('请求格式错误'), { status: 400 });
    }

    const { email } = body;

    if (!email) {
      return Response.json(genErrorData('邮箱地址不能为空'), { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(genErrorData('邮箱格式不正确'), { status: 400 });
    }

    // 检查邮箱是否已经注册
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return Response.json(genErrorData('邮箱已注册'), { status: 400 });
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("code: ", code)

    // 设置过期时间 (10分钟后)
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 10);

    // 直接操作数据库，而不是通过 tRPC 路由
    // 先尝试查找是否已有该账号的令牌
    const existingToken = await db.query.actionToken.findFirst({
      where: eq(actionToken.account, email)
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
        account: email,
        code,
        expiredAt
      });
    }

    // 发送邮件
    try {
      await sendEmail({
        toEmail: email,
        subject: 'Document AI 验证码',
        text: `您的验证码是: ${code}，10分钟内有效。如果不是您本人操作，请忽略此邮件。`,
      });

      return Response.json(genSuccessData({ message: '验证码发送成功' }));
    } catch (emailError) {
      console.error('发送邮件失败:', emailError);
      // 即使邮件发送失败，也要返回成功的响应给前端
      // 因为验证码已经在数据库中创建了，用户可以继续注册流程
      return Response.json(genSuccessData({ message: '验证码已生成，但邮件发送失败。请联系管理员获取支持。' }));
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    // 确保总是返回有效的JSON响应
    if (error instanceof Error) {
      return Response.json(genErrorData(`发送验证码失败: ${error.message}`), { status: 500 });
    }
    return Response.json(genErrorData('发送验证码失败'), { status: 500 });
  }
}

// 发送邮件的函数
async function sendEmail(opt: { subject?: string; text?: string; toEmail?: string }) {
  const { subject = '', text = '', toEmail } = opt;

  if (!subject) {
    console.error('subject required');
    throw new Error('邮件主题不能为空');
  }

  if (!toEmail) {
    console.error('toEmail required');
    throw new Error('收件人邮箱不能为空');
  }

  try {
    // 动态导入 mailer 模块以避免循环依赖
    const { sendEmail: actualSendEmail } = await import('@/lib/mailer');
    await actualSendEmail({ subject, text, toEmail });
  } catch (error) {
    console.error('发送邮件失败:', error);
    // 包装错误信息，提供更明确的错误描述
    throw new Error(`邮件发送失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}