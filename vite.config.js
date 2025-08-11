import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  esbuild: {
    loader: 'jsx',  // 添加这一行
    include: /src\/.*\.jsx?$/,  // 添加这一行
    exclude: [],  // 添加这一行
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',  // 添加这一行
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://www.duyueai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          // 增加代理的超时时间
          proxy.timeout = 90000; // 1.5分钟
          
          // 启用WebSocket支持
          proxy.ws = true;
          
          // 添加错误处理
          proxy.on('error', (err, req, res) => {
            console.error('代理错误:', err);
          });
          
          // 调整缓冲区大小以适应流式响应
          proxy.on('proxyReq', (proxyReq, req, res) => {
            req.on('close', function() {
              proxyReq.abort();
            });
          });
        }
      }
    }
  },
  build: {
    target: 'es2020',
  }
});