/**
 * SmartCut - Cloudflare Worker
 * 
 * 部署步骤：
 * 1. 登录 Cloudflare Dashboard → Workers & Pages → 创建 Worker
 * 2. 将本文件内容粘贴到 Worker 编辑器中
 * 3. 保存并部署
 * 4. 在 Cloudflare DNS 设置中，为你的域名开启 "Proxied (橙色云)" 模式
 * 5. 在 Worker 的 Triggers 中添加自定义域名（或通过 Route 关联）
 *
 * 作用：
 * - 为 GitHub Pages 添加 COOP/COEP 响应头
 * - 使 SharedArrayBuffer 可用 → crossOriginIsolated = true
 * - 让 SmartCut 可以使用 WebGPU（GPU 加速）+ 多线程 WASM 兜底
 */

export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);

    // 克隆 Headers 以添加自定义响应头
    const newHeaders = new Headers(response.headers);

    // COOP: same-origin → 隔离当前页面的 window 对象
    newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

    // COEP: credentialless → 允许加载跨域资源（如 Google Fonts、广告脚本）
    // 同时仍启用 SharedArrayBuffer，比 require-corp 更兼容
    newHeaders.set('Cross-Origin-Embedder-Policy', 'credentialless');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};