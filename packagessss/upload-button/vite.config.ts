import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'
import pkg from "./package.json"

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "UploadButton",
      formats: ["cjs", "es"]
    },
    minify: false,
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies), "preact/hooks"]
    }
  }
})
