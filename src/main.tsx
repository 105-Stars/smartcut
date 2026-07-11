import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './hooks/I18nProvider'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// 仅在生产环境加载 Google AdSense，避免本地开发时外部广告域名被网络策略拦截导致控制台报错
if (!import.meta.env.DEV) {
  const ads = document.createElement('script')
  ads.async = true
  ads.crossOrigin = 'anonymous'
  ads.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2469582853563464'
  document.head.appendChild(ads)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          {/* All routes render the shared App shell (nav + footer). */}
          {/* App switches its main content based on the current path. */}
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>,
)
