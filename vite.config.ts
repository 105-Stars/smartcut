import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://starcloud.dpdns.org', // 你的域名
      dynamicRoutes: [
        '/', 
        '/blog', 
        // 如果你有具体的文章路径，可以手动加在这里，或者让插件自动扫描
      ],
      generateRobotsTxt: false, 
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    // 确保 public 下的内容原样复制
  },
  assetsInclude: ['**/*.onnx', '**/*.wasm'],
})
