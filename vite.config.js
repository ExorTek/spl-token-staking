import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        global: true,
        Buffer: true,
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@src': '/src',
      '@components': '/src/components',
      '@providers': '/src/providers',
      '@lib': '/src/lib',
      '@hooks': '/src/hooks',
      '@helpers': '/src/helpers',
    },
  },
});
