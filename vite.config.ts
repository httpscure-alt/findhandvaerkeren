import path from 'path';
import type { Connect } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleWhitelabelAuth } from './lib/wlAuth/core.js';

/** Runs the same white-label auth as the Vercel middleware, and builds public/wl-data, in dev. */
function whitelabelAuthDev(env: Record<string, string>) {
  return {
    name: 'whitelabel-auth-dev',
    async configureServer(server: import('vite').ViteDevServer) {
      await server.ssrLoadModule('/scripts/build-wl-data.ts');
      server.middlewares.use(async (req, res, next) => {
        try {
          const chunks: Buffer[] = [];
          if (req.method === 'POST') for await (const c of req) chunks.push(c as Buffer);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          });
          const response = await handleWhitelabelAuth(request, env);
          if (!response) return next();
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          console.error('white-label auth failed', error);
          res.statusCode = 500;
          res.setHeader('content-type', 'text/html; charset=utf-8');
          req.url = '/wl/status.html';
          next();
        }
      });
    },
  };
}

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
        } else if (pathname === '/brand-v2/commercial/loi' || pathname === '/brand-v2/commercial/loi/') {
          req.url = '/brand-v2/commercial/loi/index.html';
        } else if (
          pathname === '/commercial' ||
          pathname === '/brand-v2/commercial' ||
          pathname === '/brand-v2/commercial/'
        ) {
          req.url = '/brand-v2/commercial/index.html';
        } else if (pathname === '/brand-v2/whitelabel' || pathname === '/brand-v2/whitelabel/') {
          req.url = '/brand-v2/whitelabel/index.html';
        } else if (pathname === '/enterprise-kit' || pathname === '/enterprise-kit/') {
          req.url = '/enterprise-kit/index.html';
        } else if (pathname === '/enterprise-kit/legal' || pathname === '/enterprise-kit/legal/') {
          req.url = '/enterprise-kit/legal/index.html';
        } else if (pathname === '/aldy' || pathname === '/aldy/') {
          req.url = '/aldy/index.html';
        } else if (pathname === '/aws' || pathname === '/aws/') {
          req.url = '/aws/index.html';
        } else if (pathname === '/demo' || pathname === '/demo/') {
          req.url = '/demo/index.html';
        } else if (pathname === '/exhibition' || pathname === '/exhibition/') {
          req.url = '/exhibition/index.html';
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
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    plugins: [whitelabelAuthDev(env), adveroMarketingStatic(), react()],
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
