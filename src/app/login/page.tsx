'use client'

import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// 定义自己的 SignInResponse 类型
interface SignInResponse {
  error: string | null;
  status: number;
  ok: boolean;
  url: string | null;
}

export default function LoginPage() {
  const router = useRouter()

  // 表单状态
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 处理邮箱登录
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result: any = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('登录失败：邮箱或密码错误')
      } else {
        toast.success('登录成功')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('登录过程中发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录到您的账户
          </h2>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 邮箱登录表单 */}
          <form className="space-y-6" onSubmit={handleEmailLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md shadow-sm block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="请输入邮箱地址"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md shadow-sm block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="请输入密码"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  忘记密码?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm text-center text-gray-500">
            还没有账户？{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}