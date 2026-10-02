import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import frames from './src/data/frames.json' with { type: 'json' }

export default defineConfig(({ mode }) => {
  const deploymentBase = loadEnv(mode, '.', 'DEPLOY_').DEPLOY_BASE ?? '/'
  return {
  plugins: [react(), {
    name: 'preload-first-portrait',
    transformIndexHtml: (_html, context) => {
      // The same build base feeds both preload and runtime image URLs.
      const base = context.server?.config.base ?? deploymentBase
      return [{ tag: 'link', attrs: { rel: 'preload', as: 'image',
        href: `${base}year-frames/${frames.frames[0].file}`, fetchpriority: 'high' }, injectTo: 'head' }]
    },
  }],
  base: deploymentBase,
  server: {
    host: '127.0.0.1',
    port: 4173,
  },
  }
})
