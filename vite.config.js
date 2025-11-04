import { defineConfig } from "vite"

export default defineConfig({
    base: "/claprun/",
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
