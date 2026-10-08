import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const API_TARGET = process.env.VITE_PROXY_TARGET ?? "http://127.0.0.1:8000";

const API_PREFIXES = ["/auth", "/sessions", "/scenarios", "/health", "/ready", "/ai"];

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy: Object.fromEntries(
      API_PREFIXES.map((prefix) => [
        prefix,
        { target: API_TARGET, changeOrigin: true },
      ]),
    ),
  },
});
