import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    root: "client",
    publicDir: "../public",

    server: {
        open: true
    },

    build: {
        outDir: "../dist",
        emptyOutDir: true,

        rollupOptions: {
            input: {
                index: resolve(__dirname, "client/index.html"),
                login: resolve(__dirname, "client/login.html"),
                signup: resolve(__dirname, "client/signup.html"),
                profile: resolve(__dirname, "client/profile.html"),
                "profile-setup": resolve(__dirname, "client/profile-setup.html"),
                "creator-application": resolve(__dirname, "client/creator-application.html"),
                "creator-dashboard": resolve(__dirname, "client/creator-dashboard.html"),
                "creator-status": resolve(__dirname, "client/creator-status.html"),
                dashboard: resolve(__dirname, "client/dashboard.html"),
                "creator-review": resolve(__dirname, "client/creator-review.html"),
                "game-review": resolve(__dirname, "client/game-review.html"),
                upload: resolve(__dirname, "client/upload.html"),
                game: resolve(__dirname, "client/game.html")
            }
        }
    }
});