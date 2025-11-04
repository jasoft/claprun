import { defineConfig } from "vite"

export default defineConfig({
    base: "/",
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
})
