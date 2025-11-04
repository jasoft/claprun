import { defineConfig } from "vite"

export default defineConfig({
    // 使用相对路径，本地和部署环境都兼容
    base: "./",
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
