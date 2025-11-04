import { defineConfig } from "vite"

// 根据环境动态设置 base 路径
const isProduction = process.env.NODE_ENV === "production"
const base = isProduction ? "/claprun/" : "/"

export default defineConfig({
    base: base,
    server: {
        port: 5173,
        open: true,
        host: "localhost",
    },
    build: {
        outDir: "dist",
        sourcemap: false,
        minify: "esbuild",
    },
    publicDir: 'public', // 将 public 目录复制到构建输出
})
