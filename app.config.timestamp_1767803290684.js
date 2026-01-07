// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
var app_config_default = defineConfig({
  server: {
    preset: "node-server"
  },
  vite: {
    plugins: [
      TanStackRouterVite({
        autoCodeSplitting: true,
        routesDirectory: "./src/routes",
        generatedRouteTree: "./src/routeTree.gen.ts"
      }),
      react()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/public": path.resolve(__dirname, "./public")
      }
    },
    ssr: {
      noExternal: [
        "@radix-ui/*",
        "cmdk",
        "lucide-react",
        "boring-avatars",
        "react-colorful",
        "embla-carousel-react"
      ]
    }
  }
});
export {
  app_config_default as default
};
