import { defineConfig } from "vite";

export default defineConfig({
    root: "client",
    publicDir: "../public",
    server: {
        open: true
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true
    }
});