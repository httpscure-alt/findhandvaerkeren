import path from 'path';
import type { Connect } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/** Serve marketing HTML at `/` and `/contact` in dev (skip React white-screen redirect). */
function adveroMarketingStatic(): { name: string; configureServer: (server: { middlewares: Connect.Server }) => void } {
  return {
    name: 'advero-marketing-static',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const pathname = (req.url || '').split('?')[0];
        if (pathname === '/' || pathname === '/index.html') {
          req.url = '/site/home.html';
        } else if (pathname === '/contact') {
          req.url = '/site/contact.html';
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      // Avoid 3000 (often used by other apps). Sim mode still uses 3001 via package.json.
      port: 5174,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    plugins: [adveroMarketingStatic(), react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react'],
          },
        },
      },
    }
  };
});
