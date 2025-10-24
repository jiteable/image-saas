import { genSuccessData, genErrorData } from '@/app/api/utils/gen-res-data'
import { actionTokenRoute } from "@/server/routes/actionToken";

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return Response.json(genErrorData('邮箱地址和验证码不能为空'))
    }

    // 调用 actionTokenRoute 验证验证码
    const caller = actionTokenRoute.createCaller({});
    const result = await caller.verify({
      account: email,
      code
    });

    if (!result.success) {
      return Response.json(genErrorData(result.message || '验证码错误'));
    }

    // 验证成功
    return Response.json(genSuccessData({ message: '验证码正确' }))
  } catch (error) {
    console.error('验证验证码失败:', error)
    return Response.json(genErrorData('验证失败'))
  }
}
