import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento (npm run dev), tudo que começa com /api vai para o backend
// rodando localmente na porta 8000, sem o prefixo /api. Assim o frontend usa sempre
// o mesmo endereço relativo, tanto no computador quanto na AWS (onde o nginx faz o mesmo).
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
