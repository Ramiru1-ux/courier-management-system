import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

const jsxInJsPlugin = () => ({
  name: 'jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!/\/src\/.*\.js$/.test(id)) return null;
    return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [jsxInJsPlugin(), react()],
  server: {
    port: mode === 'driver' ? 5174 : mode === 'customer' ? 5175 : 5173,
    host: '127.0.0.1',
    strictPort: true,
    // Every /api request is forwarded to the Express backend, so the browser
    // only ever talks to one origin and there is no CORS setup to get wrong.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.VITE_API_PROXY || 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  // Several context files (src/context/*.js) contain JSX but use a .js
  // extension (per the project's folder structure). Tell esbuild to treat
  // .js files under src/ as JSX so they transform correctly instead of
  // failing with "invalid JS syntax".
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}));
