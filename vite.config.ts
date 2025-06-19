
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force single React instance to prevent hook errors
      "react": path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom")
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    // Exclude PDF.js from optimization to prevent worker issues
    exclude: ['pdfjs-dist']
  },
  define: {
    // Ensure proper PDF.js worker loading
    global: 'globalThis',
  }
}));
