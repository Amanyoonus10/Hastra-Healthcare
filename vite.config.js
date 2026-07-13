import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blueprints: resolve(__dirname, 'blueprints.html'),
        product_portfolio: resolve(__dirname, 'product-portfolio.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});
