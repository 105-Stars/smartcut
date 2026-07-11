# SmartCut 智能抠图

一个可直接部署到 GitHub Pages 的智能抠图网站：上传图片 → 一键抠图（浏览器端本地推理，优先使用 WebGPU 加速，不支持时自动回退本地 WASM）→ 预览对比 → 下载透明背景 PNG，并支持基础背景替换预览（背景色/背景图）。

## 功能

- 支持上传 JPG / PNG / WebP（单张 ≤ 10MB）
- 一键智能抠图：自动识别主体并去除背景，输出透明背景 PNG
- 预览对比：原图/抠图结果对比滑块
- 基础编辑：替换背景色、背景图（用于二次创作预览）
- 结果下载：透明背景 PNG / 编辑后图片（PNG/JPG）
- 全响应式设计：适配桌面端、平板端及移动端

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | ^19.1.1 |
| 类型系统 | TypeScript | ~5.8.3 |
| CSS 框架 | Tailwind CSS | ^3.4.17 |
| 构建工具 | Vite | ^6.4.3 |
| 推理引擎 | ONNX Runtime Web | ^1.22.0 |
| 抠图模型 | U2NetP (ONNX) | ~4.4MB |
| 部署平台 | GitHub Pages | 免费 |

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认端口 5173）
npm run dev

# 3. 本地预览构建产物
npm run preview
```

访问 `http://localhost:5173` 即可使用。

## 构建

```bash
npm run build
```

产物在 `dist/` 目录。

## 部署到 GitHub Pages（自动化 CI/CD）

### 前置条件

- 拥有 GitHub 账号
- 本地已安装 Git（[下载地址](https://git-scm.com/)）
- 本地已安装 Node.js 18+（[下载地址](https://nodejs.org/)）

### 步骤一：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)，点击右上角 **+** → **New repository**
2. 填写仓库名称（如 `smartcut`），设为 Public，**不要**勾选 Initialize with README
3. 点击 **Create repository**，记下仓库的 HTTPS 地址（形如 `https://github.com/你的用户名/smartcut.git`）

### 步骤二：推送代码到 GitHub

```bash
# 在项目根目录初始化 git（若尚未初始化）
git init

# 配置 Git 用户信息
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub注册邮箱"

# 添加所有文件
git add .

# 首次提交
git commit -m "init: SmartCut 智能抠图项目，适配 GitHub Pages 部署"

# 绑定远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/smartcut.git

# 设置主分支名
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 步骤三：启用 GitHub Pages

1. 进入你的 GitHub 仓库页面，点击顶部 **Settings** 标签
2. 左侧导航栏找到 **Pages**（在 Security and code compliance 下方）
3. 在 **Build and deployment** 区域：
   - Source 选择 **GitHub Actions**
   - 确认 `.github/workflows/deploy.yml` 已存在
4. 点击 **Save**

### 步骤四：等待自动部署

推送代码后，GitHub Actions 会自动触发构建流程：

1. 进入仓库 **Actions** 标签页
2. 可以看到名为 **Deploy to GitHub Pages** 的工作流正在运行
3. 等待构建完成（通常 1-3 分钟）
4. 构建成功后，在仓库 **Settings → Pages** 页面可以看到部署链接

### 访问项目

部署完成后，你的项目将在以下地址访问：

```
https://你的用户名.github.io/smartcut/
```

首次访问可能需要等待 1-2 分钟 CDN 生效。

## 项目结构

```
SmartCut/
├── .github/workflows/     # GitHub Actions 工作流
│   └── deploy.yml         # 自动构建部署配置
├── public/                # 静态资源
│   ├── models/            # ONNX 抠图模型
│   │   └── u2netp.onnx    # U2NetP 轻量模型 (~4.4MB)
│   ├── ort/               # ONNX Runtime Web 运行时
│       └── *.js           # WebGPU + 本地 WASM 推理引擎（优先 WebGPU，WASM 兜底）
├── src/
│   ├── lib/               # 核心逻辑
│   │   └── removeBackground.ts  # 抠图推理实现
│   ├── App.tsx            # 主组件（UI + 交互）
│   ├── index.css          # Tailwind 样式入口
│   └── main.tsx           # React 入口
├── vite.config.ts         # Vite 构建配置
├── tailwind.config.cjs    # Tailwind 配置
├── postcss.config.cjs     # PostCSS 配置
├── package.json           # 依赖声明
└── tsconfig.json          # TypeScript 配置
```

## 模型与资源说明

- 模型文件位于：`public/models/u2netp.onnx`
- 首次点击"一键抠图"会加载模型（取决于网络与设备，可能需要数秒）；加载完成后再次处理会更快
- 本项目不调用任何付费抠图 API，推理在浏览器本地完成
- 如需更高精度，可替换 `public/models/` 下的 ONNX 模型文件

## 常见问题排查

### 部署后白屏或资源 404

- 确认 `vite.config.ts` 中 `base: './'` 已设置（使用相对路径）
- 确认 `.github/workflows/deploy.yml` 中构建路径为 `dist/`

### 抠图功能报错（WebGPU / WebAssembly 加载失败）

- 抠图优先使用 WebGPU 加速；若浏览器不支持或初始化失败，会自动回退到本地 WASM（CPU）后端
- 检查 `public/ort/` 目录下是否有 `ort.webgpu.min.js`、`ort.wasm.min.js` 及相关 wasm 文件
- 检查 `public/models/` 目录下是否有 `u2netp.onnx` 文件

### 编辑后图片无法下载

- 确认浏览器控制台无 `ERR_FILE_NOT_FOUND` 错误
- 该问题通常由 blob URL 生命周期管理不当引起，当前版本已修复

## License

MIT
