import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import viteCompression from 'vite-plugin-compression' // ✅ 引入 Gzip 压缩

export default defineConfig({
  plugins: [
    react(),
    // ✅ 开启 Gzip 压缩
    viteCompression({
      verbose: true,       // 控制台输出压缩结果
      disable: false,      // 开启压缩
      threshold: 10240,    // 体积大于 10kb 才压缩
      algorithm: 'gzip',   // 压缩算法
      ext: '.gz',          // 文件后缀
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // 方便导入
    }
  },
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'public'),
        path.resolve(__dirname, 'node_modules')
      ]
    }
  },
  // ✅ 构建优化配置
  build: {
    minify: 'terser', // 使用 terser 混淆（更小）
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境去除 console
        drop_debugger: true // 去除 debugger
      }
    },
    rollupOptions: {
      output: {
        // ✅ 路由懒加载与代码分割 (Code Splitting)
        manualChunks(id) {
          // 将 node_modules 中的依赖单独打包
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // 也可以更细粒度地拆分，比如把 react 全家桶拆出来
          if (id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000 // 调高警告阈值
  }
})