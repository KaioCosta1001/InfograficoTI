import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // As capturas de tela e os arquivos de teste não devem reiniciar o dev server.
      ignored: ["**/tmp/**", "**/dist/**", "**/scripts/**"],
    },
  },
});
