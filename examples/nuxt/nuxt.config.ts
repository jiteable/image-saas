// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: 3001
  },
  // 解决 Windows 上的路径问题
  nitro: {
    output: {
      dir: './.output'
    }
  },
  // 明确指定构建目录
  buildDir: './.nuxt',
})