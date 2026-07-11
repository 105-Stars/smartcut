export type BlogLocale = 'zh-CN' | 'en' | 'ja' | 'ko' | 'zh-TW'
export type BlogCategory = 'product' | 'tech' | 'privacy' | 'tutorial' | 'usecase' | 'format'
export interface BlogSection {
  heading: string
  body?: string
  list?: string[]
  quote?: string
}
export interface BlogLocalized { title: string; excerpt: string; sections: BlogSection[] }
export interface BlogArticle {
  id: string; slug: string; category: BlogCategory; date: string; readingMinutes: number;
  accent: 'brand' | 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber'; emoji: string;
  t: Record<BlogLocale, BlogLocalized>
}
export const blogCategoryLabels: Record<BlogCategory, Record<BlogLocale, string>> = {
  product: { 'zh-CN': '产品动态', en: 'Product News', ja: '製品情報', ko: '제품 소식', 'zh-TW': '產品動態' },
  tech: { 'zh-CN': '技术解析', en: 'Tech Deep Dive', ja: '技術解説', ko: '기술 분석', 'zh-TW': '技術解析' },
  privacy: { 'zh-CN': '隐私安全', en: 'Privacy & Security', ja: 'プライバシー', ko: '개인정보 보호', 'zh-TW': '隱私安全' },
  tutorial: { 'zh-CN': '使用教程', en: 'Tutorials', ja: '使い方', ko: '사용 방법', 'zh-TW': '使用教學' },
  usecase: { 'zh-CN': '场景应用', en: 'Use Cases', ja: '活用事例', ko: '활용 사례', 'zh-TW': '場景應用' },
  format: { 'zh-CN': '格式转换', en: 'Format Convert', ja: 'フォーマット', ko: '포맷 변환', 'zh-TW': '格式轉換' },
}

export const blogArticles: BlogArticle[] = [
  // a1 — SmartCut launch
  {
    id: 'a1', slug: 'smartcut-launch', category: 'product', accent: 'brand', emoji: '🚀', date: '2026-06-18', readingMinutes: 8,
    t: {
      'zh-CN': {
        title: 'SmartCut 正式发布：把抠图这件事，搬回你的设备里',
        excerpt: '为什么我们要做一款完全免费、无需登录、全程本地的 AI 抠图工具？这篇文章讲清楚我们的初衷与不同之处。',
        sections: [
          {
            heading: '我们为什么做 SmartCut',
            body: '市面上的智能抠图工具大多依赖云端：上传原图、排队等待、再下载结果。每一次上传，都意味着你的照片离开了你的设备。\n\nSmartCut 的出发点很简单——把这件事搬回本地，让模型直接在浏览器里运行，图不出本机，体验却一点不打折。',
            quote: '最好的抠图，是你的图片从没离开过你。',
          },
          {
            heading: 'SmartCut 到底哪里不一样',
            body: '三个关键词：免费、无需登录、全程本地。你不必注册账号，不必绑定邮箱，也不必为高清导出付费。',
            list: [
              '完全免费：所有功能（抠图、去背景、换背景、格式转换）零门槛使用。',
              '无需注册：打开网页即可使用，不收集任何账号信息。',
              '全程本地：图像只在你的浏览器内处理，从不上传到任何服务器。',
              '即时响应：模型在设备端推理，无需排队等待云端算力。',
            ],
          },
          {
            heading: '三行就能上手的极简流程',
            body: '我们刻意把交互压到最短，哪怕从不接触过设计软件的人也能一分钟内得到结果。',
            list: [
              '第一步：把图片拖进网页，或点击上传。',
              '第二步：点击「一键抠图」，模型自动分离主体与背景。',
              '第三步：下载透明 PNG，或直接在网页里换背景、加滤镜。',
            ],
            quote: '上传即抠图，抠图即下载——没有第四步。',
          },
          {
            heading: '本地 AI 也能这么聪明',
            body: 'SmartCut 内置 U2NetP 轻量模型，通过 ONNX Runtime Web 在浏览器中运行。它在保证精度的同时，把体积压到极致，让中低端笔记本也能流畅推理。',
            list: [
              '浏览器内推理：WebGL 与本地 WASM 双后端自动适配。',
              '320px 输入尺寸：速度与质量的平衡点在工程上经过反复打磨。',
              '持续迭代：模型与算法会随版本更新悄悄变好。',
            ],
          },
          {
            heading: '我们的路线图',
            body: 'SmartCut 才刚刚起步。接下来几个月，我们会围绕「更准、更快、更顺手」三件事持续投入。',
            list: [
              '批量处理：一次拖入多张图，统一导出。',
              '更细的边缘优化：发丝、半透明材质的处理再进一步。',
              '移动端适配：手机浏览器也能流畅抠图。',
              '更多导出选项：WebP、带阴影的 PNG 等。',
            ],
            quote: '免费只是开始，好用才是我们真正想做到的事。',
          },
        ],
      },
      en: {
        title: 'Introducing SmartCut: Bringing Background Removal Back to Your Device',
        excerpt: 'Why we built a fully free, no-signup, 100% local AI cutout tool. This post explains our motivation and what makes it different.',
        sections: [
          {
            heading: 'Why we built SmartCut',
            body: 'Most AI cutout tools today rely on the cloud: you upload a photo, wait in a queue, then download the result. Every upload means your image left your device.\n\nSmartCut started from a simple idea — bring that process back home, running the model right inside the browser so the image never leaves your machine, without compromising on quality.',
            quote: 'The best cutout is the one where your photo never left you.',
          },
          {
            heading: 'What actually makes SmartCut different',
            body: 'Three keywords: free, no signup, fully local. You never register an account, never bind an email, and never pay for HD exports.',
            list: [
              'Completely free: every feature (cutout, background removal, swap, format conversion) is zero-friction.',
              'No registration: open the page and use it; we collect no account info.',
              'Fully local: images are processed only in your browser, never uploaded anywhere.',
              'Instant response: on-device inference means no waiting on cloud compute.',
            ],
          },
          {
            heading: 'A three-line quick start',
            body: 'We deliberately kept the interaction as short as possible, so even someone who has never touched design software gets a result within a minute.',
            list: [
              'Step 1: drag an image into the page, or click to upload.',
              'Step 2: click "One-click cutout" and the model separates subject from background.',
              'Step 3: download a transparent PNG, or swap a background and add filters right there.',
            ],
            quote: 'Upload means cutout, cutout means download — there is no step four.',
          },
          {
            heading: 'Local AI can be this smart',
            body: 'SmartCut ships the lightweight U2NetP model, running in the browser via ONNX Runtime Web. It keeps size to a minimum while preserving accuracy, so even mid-range laptops run inference smoothly.',
            list: [
              'In-browser inference: WebGL and local WASM backends auto-adapt.',
              '320px input: a speed/quality balance refined through real engineering.',
              'Continuous iteration: model and algorithm quietly improve with updates.',
            ],
          },
          {
            heading: 'Our roadmap',
            body: 'SmartCut is just getting started. Over the next few months we will invest in three things: more accurate, faster, and more intuitive.',
            list: [
              'Batch processing: drop many images at once and export them together.',
              'Finer edge refinement: hair, translucent materials get even better.',
              'Mobile support: smooth cutout right in phone browsers.',
              'More export options: WebP, PNG with shadows, and more.',
            ],
            quote: 'Free is just the beginning; being genuinely useful is what we actually aim for.',
          },
        ],
      },
      ja: {
        title: 'SmartCut 公開：切り抜きを、あなたのデバイスの中へ',
        excerpt: 'なぜ私たちが、完全無料・登録不要・すべてローカルな AI 切り抜きツールを作ったのか。その理由と違いをお話しします。',
        sections: [
          {
            heading: 'なぜ SmartCut を作ったのか',
            body: '世の AI 切り抜きツールの多くはクラウドに依存しています。画像をアップロードし、待ち行列に並び、結果をダウンロードする。アップロードのたびに、あなたの写真はデバイスを離れるのです。\n\nSmartCut の出発点は単純です。この作業をローカルに戻し、モデルをブラウザ内で直接動かすこと。画像は端末を出ず、体験は一切妥協しない。',
            quote: '最高の切り抜きとは、写真があなたを離れなかったものです。',
          },
          {
            heading: 'SmartCut の「違い」はどこか',
            body: '三つのキーワード：無料、登録不要、完全ローカル。アカウント登録もメール連携も、高画質エクスポートの有料化も必要ありません。',
            list: [
              '完全無料：すべての機能（切り抜き、背景除去、背景入れ替え、形式変換）が無料。',
              '登録不要：ページを開くだけで使え、アカウント情報は収集しません。',
              '完全ローカル：画像はブラウザ内だけで処理され、どこにも送信されません。',
              '即時応答：端末内推論でクラウドの待ち時間は発生しません。',
            ],
          },
          {
            heading: '3 行でわかる簡単手順',
            body: '操作は最短になるよう意図的に設計し、デザインソフトを触ったことのない人でも 1 分で結果を得られます。',
            list: [
              'ステップ 1：画像をページにドラッグ、またはクリックしてアップロード。',
              'ステップ 2：「ワンクリック切り抜き」で、モデルが主体と背景を自動分離。',
              'ステップ 3：透過 PNG をダウンロード、またはその場で背景入れ替えやフィルタ追加。',
            ],
            quote: 'アップロードすれば切り抜き、切り抜けばダウンロード——ステップ 4 はありません。',
          },
          {
            heading: 'ローカル AI でも、ここまで賢く',
            body: 'SmartCut は軽量モデル U2NetP を内蔵し、ONNX Runtime Web 経由でブラウザ内で動きます。精度を保ちつつサイズを極限まで削り、ミドルレンジのノート PC でも滑らかに推論します。',
            list: [
              'ブラウザ内推論：WebGL とローカル WASM の両バックエンドへ自動対応。',
              '320px 入力：速度と品質のバランスを丁寧に仕上げました。',
              '継続改善：モデルとアルゴリズムはアップデートで静かに良くなります。',
            ],
          },
          {
            heading: '今後のロードマップ',
            body: 'SmartCut はまだ始まったばかり。今後数ヶ月は「より正確に、より速く、より使いやすく」の三つに注力します。',
            list: [
              'バッチ処理：複数画像を一度に入れ、まとめて書き出し。',
              'より細かい縁の最適化：髪の毛や半透明な素材の処理をさらに改善。',
              'モバイル対応：スマホのブラウザでも滑らかな切り抜き。',
              'より多くの書き出し形式：WebP、影付き PNG など。',
            ],
            quote: '無料は始まりにすぎません。本当に役立つことが、私たちの目指す姿です。',
          },
        ],
      },
      ko: {
        title: 'SmartCut 출시: 배경 제거를 다시 내 기기로',
        excerpt: '왜 우리가 완전 무료·가입 불필요·100% 로컬 AI 컷아웃 도구를 만들었는지, 그 이유와 차이점을 설명합니다.',
        sections: [
          {
            heading: '우리가 SmartCut을 만든 이유',
            body: '대부분의 AI 컷아웃 도구는 클라우드에 의존합니다. 사진을 올리고, 대기열에서 기다린 뒤, 결과를 받습니다. 올릴 때마다 내 사진은 기기를 떠납니다.\n\nSmartCut은 단순한 아이디어에서 시작했습니다. 이 작업을 다시 로컬로 가져와, 모델을 브라우저 안에서 직접 돌리는 것. 사진은 기기를 떠나지 않고 품질은 양보하지 않습니다.',
            quote: '가장 좋은 컷아웃은 사진이 당신을 떠나지 않은 것입니다.',
          },
          {
            heading: 'SmartCut만의 차이점',
            body: '세 가지 키워드: 무료, 가입 불필요, 완전 로컬. 계정 가입도 이메일 연동도, 고화질 내보내기 유료화도 필요 없습니다.',
            list: [
              '완전 무료: 모든 기능(컷아웃, 배경 제거, 배경 교체, 형식 변환)이 그대로 무료.',
              '가입 불필요: 페이지를 열면 바로 사용, 계정 정보 수집 안 함.',
              '완전 로컬: 이미지는 브라우저 내에서만 처리되어 어디에도 전송되지 않음.',
              '즉시 반응: 기기 내 추론으로 클라우드 대기 시간 없음.',
            ],
          },
          {
            heading: '세 줄이면 충분한 빠른 시작',
            body: '우리는 조작을 가능한 한 짧게 유지해, 디자인 툴을 한 번도 써본 적 없는 사람도 1분 안에 결과를 얻을 수 있게 했습니다.',
            list: [
              '1단계: 이미지를 페이지로 끌어다 놓거나 클릭해 업로드.',
              '2단계: "원클릭 컷아웃"을 누르면 모델이 피사체와 배경을 자동 분리.',
              '3단계: 투명 PNG를 받거나, 그 자리에서 배경 교체와 필터 적용.',
            ],
            quote: '업로드하면 컷아웃, 컷아웃하면 다운로드—4단계는 없습니다.',
          },
          {
            heading: '로컬 AI도 이렇게 똑똑할 수 있다',
            body: 'SmartCut은 가벼운 U2NetP 모델을 내장하고 ONNX Runtime Web으로 브라우저에서 돌아갑니다. 정확도를 지키면서 크기를 극한으로 줄여 중급 노트북에서도 부드럽게 추론합니다.',
            list: [
              '브라우저 내 추론: WebGL과 로컬 WASM 백엔드에 자동 대응.',
              '320px 입력: 속도와 품질의 균형을 정성껏 다듬음.',
              '지속 개선: 모델과 알고리즘은 업데이트로 조용히 좋아집니다.',
            ],
          },
          {
            heading: '우리의 로드맵',
            body: 'SmartCut은 이제 막 시작했습니다. 앞으로 몇 달간 "더 정확하게, 더 빠르게, 더 편하게" 세 가지에 집중합니다.',
            list: [
              '일괄 처리: 여러 이미지를 한 번에 넣어 한꺼번에 내보내기.',
              '더 세밀한 가장자리: 머리카락, 반투명 소재 처리 개선.',
              '모바일 지원: 휴대폰 브라우저에서도 부드러운 컷아웃.',
              '더 많은 내보내기: WebP, 그림자 포함 PNG 등.',
            ],
            quote: '무료는 시작일 뿐, 진짜 쓸모 있어지는 것이 우리가 목표입니다.',
          },
        ],
      },
      'zh-TW': {
        title: 'SmartCut 正式發布：把摳圖這件事，搬回你的裝置裡',
        excerpt: '為什麼我們要做一款完全免費、無需登入、全程本地的 AI 摳圖工具？這篇文章講清楚我們的初衷與不同之處。',
        sections: [
          {
            heading: '我們為什麼做 SmartCut',
            body: '市面上的智慧摳圖工具大多依賴雲端：上傳原圖、排隊等待、再下載結果。每一次上傳，都意味著你的照片離開了你的裝置。\n\nSmartCut 的出發點很簡單——把這件事搬回本地，讓模型直接在瀏覽器裡運行，圖不出本機，體驗卻一點不打折。',
            quote: '最好的摳圖，是你的圖片從沒離開過你。',
          },
          {
            heading: 'SmartCut 到底哪裡不一樣',
            body: '三個關鍵字：免費、無需登入、全程本地。你不必註冊帳號，不必綁定信箱，也不必為高清匯出付費。',
            list: [
              '完全免費：所有功能（摳圖、去背景、換背景、格式轉換）零門檻使用。',
              '無需註冊：打開網頁即可使用，不收集任何帳號資訊。',
              '全程本地：影像只在你的瀏覽器內處理，從不上傳到任何伺服器。',
              '即時回應：模型在裝置端推理，無需排隊等待雲端算力。',
            ],
          },
          {
            heading: '三行就能上手的極簡流程',
            body: '我們刻意把互動壓到最短，哪怕從不接觸過設計軟體的人也能一分鐘內得到結果。',
            list: [
              '第一步：把圖片拖進網頁，或點擊上傳。',
              '第二步：點擊「一鍵摳圖」，模型自動分離主體與背景。',
              '第三步：下載透明 PNG，或直接在網頁裡換背景、加濾鏡。',
            ],
            quote: '上傳即摳圖，摳圖即下載——沒有第四步。',
          },
          {
            heading: '本地 AI 也能這麼聰明',
            body: 'SmartCut 內建 U2NetP 輕量模型，透過 ONNX Runtime Web 在瀏覽器中運行。它在保證精度的同時，把體積壓到極致，讓中低階筆電也能流暢推理。',
            list: [
              '瀏覽器內推理：WebGL 與本地 WASM 雙後端自動適配。',
              '320px 輸入尺寸：速度與品質的平衡點在工程中經過反覆打磨。',
              '持續迭代：模型與演算法會隨版本更新悄悄變好。',
            ],
          },
          {
            heading: '我們的路线图',
            body: 'SmartCut 才剛剛起步。接下來幾個月，我們會圍繞「更準、更快、更順手」三件事持續投入。',
            list: [
              '批次處理：一次拖入多張圖，統一匯出。',
              '更細的邊緣優化：髮絲、半透明材質的處理再進一步。',
              '行動端適配：手機瀏覽器也能流暢摳圖。',
              '更多匯出選項：WebP、帶陰影的 PNG 等。',
            ],
            quote: '免費只是開始，好用才是我們真正想做到的事。',
          },
        ],
      },
    },
  },

  // a2 — U2NetP explained
  {
    id: 'a2', slug: 'u2netp-explained', category: 'tech', accent: 'violet', emoji: '🧠', date: '2026-05-27', readingMinutes: 9,
    t: {
      'zh-CN': {
        title: '一文读懂 U2NetP：把「抠图大脑」塞进浏览器的秘密',
        excerpt: '它是什么？为什么这么轻？又是如何在浏览器里实现端侧推理的？这篇技术解析给你答案。',
        sections: [
          {
            heading: 'U2NetP 到底是什么',
            body: 'U2NetP 是 U2Net 系列的轻量化变体，专门为显著性目标检测（Salient Object Detection）设计。它的任务很明确：判断图中每个像素是否属于「主体」，从而输出一张遮罩。\n\n相比原版 U2Net，U2NetP 通过缩减通道数与层数，把参数量压到极小，却依然保留了两级嵌套的「U 形」结构，因此得名。',
            quote: '它不是更大的模型，而是更聪明的模型。',
          },
          {
            heading: '为什么一定要「轻」',
            body: '因为我们要把它塞进浏览器里实时运行，而不是扔到 GPU 集群上。模型越大，下载越慢、内存越吃紧、推理越卡顿。',
            list: [
              '体积门槛：完整模型动辄上百 MB，用户根本等不起加载。',
              '内存限制：浏览器标签页能用的内存有限，模型必须够小。',
              '低端友好：让 4GB 内存的老笔记本也能跑得动。',
              '冷启动体验：模型越小，首帧出图越快。',
            ],
            quote: '轻，不是为了省事，是为了让更多人用得上。',
          },
          {
            heading: '浏览器里的端侧推理',
            body: 'SmartCut 通过 ONNX Runtime Web 加载 U2NetP 的 ONNX 格式权重。它会根据设备能力，在 WebGL 与本地 WASM 两个后端之间自动选择。',
            list: [
              'ONNX Runtime Web：跨平台推理引擎，免安装、纯前端。',
              'WASM 后端：兼容一切浏览器，CPU 上也能跑，稳。',
              'WebGL 后端：在支持的浏览器上调用显卡，速度大幅提升。',
              '320px 输入：原图缩放到 320 边长再推理，兼顾速度与边缘精度。',
            ],
            quote: '模型没动，动的是它跑在哪块芯片上。',
          },
          {
            heading: '提升抠图质量的 4 个技巧',
            body: '同样是 U2NetP，参数调得好不好，成品天差地别。下面四个旋钮最值得你动手。',
            list: [
              '边缘模糊（Blur）：对遮罩做 1–2px 高斯模糊，可消除锯齿状的硬边。',
              '阈值（Threshold）：把遮罩二值化，0.5 是常规值，发丝场景可降到 0.4。',
              '伽马校正（Gamma）：提亮中间调，让半透明婚纱、玻璃更自然。',
              '前处理对比度：主体与背景对比越强，分割越干净。',
            ],
            quote: '算法给的是 80 分，剩下 20 分在你手里。',
          },
          {
            heading: '它有什么局限',
            body: '诚实地说，U2NetP 并非万能。理解它的边界，才能用得其所。',
            list: [
              '细密发丝：极细的单根发丝仍可能断裂，建议配合手动修复。',
              '复杂透明体：大面积玻璃、烟雾的透明度还原有限。',
              '320px 上限：超大图上采样后边缘略软，属正常损耗。',
              '依赖原图对比：主体与背景同色时，分割会吃力。',
            ],
          },
          {
            heading: '小结',
            body: 'U2NetP 的价值不在于「最大」，而在于「刚刚好」：够小以塞进浏览器，够准以胜任日常抠图。它正是 SmartCut 能既免费又本地的技术底座。',
            quote: '最好的工程，是让用户感觉不到工程的存在。',
          },
        ],
      },
      en: {
        title: 'Understanding U2NetP: The Secret Behind Squeezing a "Cutout Brain" Into the Browser',
        excerpt: 'What is it, why is it so light, and how does on-device inference work in the browser? This tech deep dive has the answers.',
        sections: [
          {
            heading: 'What exactly is U2NetP',
            body: 'U2NetP is a lightweight variant of the U2Net family, built specifically for Salient Object Detection. Its job is clear: decide whether each pixel belongs to the "subject" and output a mask.\n\nCompared with the original U2Net, U2NetP shrinks channel count and depth to minimize parameters, while keeping the two-level nested "U-shaped" structure — hence the name.',
            quote: 'It is not a bigger model, but a smarter one.',
          },
          {
            heading: 'Why "light" matters so much',
            body: 'Because we run it live inside the browser, not on a GPU cluster. The bigger the model, the slower the download, the tighter the memory, the more it stutters.',
            list: [
              'Size budget: full models are hundreds of MB; users will not wait to load them.',
              'Memory limits: browser tabs have limited memory, so the model must be small.',
              'Low-end friendly: even a 4GB old laptop should run it.',
              'Cold start: smaller models show the first frame faster.',
            ],
            quote: 'Light is not for convenience; it is so more people can actually use it.',
          },
          {
            heading: 'On-device inference in the browser',
            body: 'SmartCut loads U2NetP weights in ONNX format via ONNX Runtime Web. It auto-selects between the WebGL and local WASM backends based on device capability.',
            list: [
              'ONNX Runtime Web: a cross-platform inference engine, install-free and pure frontend.',
              'WASM backend: works in every browser, runs on CPU, rock solid.',
              'WebGL backend: taps the GPU on supported browsers, greatly boosting speed.',
              '320px input: the image is scaled to 320px per side before inference, balancing speed and edge precision.',
            ],
            quote: 'The model did not move; what moved is which chip it runs on.',
          },
          {
            heading: '4 tips to boost cutout quality',
            body: 'Same U2NetP, wildly different results depending on tuning. These four knobs are the most worth your time.',
            list: [
              'Edge Blur: a 1–2px Gaussian blur on the mask removes jagged hard edges.',
              'Threshold: binarize the mask; 0.5 is standard, drop to 0.4 for hair scenes.',
              'Gamma: lift midtones so translucent veils and glass look natural.',
              'Preprocess contrast: stronger subject-background contrast yields cleaner cuts.',
            ],
            quote: 'The algorithm gives you 80; the other 20 is in your hands.',
          },
          {
            heading: 'Where it has limits',
            body: 'Honestly, U2NetP is not magic. Knowing its boundaries is how you use it well.',
            list: [
              'Fine hair: single ultra-thin strands may break; pair with manual touch-up.',
              'Complex transparency: large glass or smoke transparency is limited.',
              '320px ceiling: upscaling very large images softens edges slightly — expected.',
              'Depends on contrast: same-color subject and background are hard to separate.',
            ],
          },
          {
            heading: 'Wrapping up',
            body: 'U2NetP is valuable not because it is "biggest" but because it is "just right": small enough to fit the browser, accurate enough for daily cutouts. It is the technical foundation that lets SmartCut be both free and local.',
            quote: 'The best engineering is the kind users never notice.',
          },
        ],
      },
      ja: {
        title: 'U2NetP を読み解く：切り抜き「頭脳」をブラウザに収める秘密',
        excerpt: 'それは何か、なぜこれほど軽いのか、ブラウザでの端末内推論はどう実現されているのか。技術解説で答えます。',
        sections: [
          {
            heading: 'U2NetP とは何か',
            body: 'U2NetP は U2Net ファミリーの軽量版で、顕著性物体検出（Salient Object Detection）のために作られました。役割は明確です。各ピクセルが「主体」に属するかを判定し、マスクを出力します。\n\nオリジナルの U2Net と比べ、チャンネル数と層を減らしてパラメータを最小にしつつ、2 段ネストの「U 字型」構造は残しています。そこから名付けられました。',
            quote: 'それはより大きなモデルではなく、より賢いモデルです。',
          },
          {
            heading: 'なぜ「軽い」ことが重要なのか',
            body: 'ブラウザ内でリアルタイムに動かすからです。GPU クラスタに投げるのではありません。モデルが大きいほど、ダウンロードは遅く、メモリは厳しく、処理はカクつきます。',
            list: [
              'サイズ予算：フルモデルは数百 MB、読み込みを待てません。',
              'メモリ制限：ブラウザタブのメモリは限られ、モデルは小さく必須。',
              '低スペック対応：4GB の古いノート PC でも動くように。',
              'コールドスタート：小さいほど最初のフレームが早い。',
            ],
            quote: '軽いのは楽だからではなく、より多くの人が使えるからです。',
          },
          {
            heading: 'ブラウザでの端末内推論',
            body: 'SmartCut は ONNX Runtime Web 経由で U2NetP の ONNX 重みを読み込みます。デバイス能力に応じ、WebGL とローカル WASM の両バックエンドから自動選択します。',
            list: [
              'ONNX Runtime Web：クロスプラットフォーム推論エンジン、導入不要で純前端。',
              'WASM バックエンド：すべてのブラウザで動作、CPU でも安定。',
              'WebGL バックエンド：対応ブラウザで GPU を呼び、高速化。',
              '320px 入力：推論前に 320px 辺へ縮小し、速度と縁精度を両立。',
            ],
            quote: 'モデルは動いていない、動いたのはどのチップかだけだ。',
          },
          {
            heading: '品質を上げる 4 つのコツ',
            body: '同じ U2NetP でも、調整次第で結果は雲泥の差です。以下の 4 つのつまみが最も価値あります。',
            list: [
              'エッジぼかし：マスクに 1–2px のガウスぼかしでギザギザの硬い縁を消す。',
              'しきい値：マスクを二値化、0.5 が標準、髪の毛なら 0.4 へ。',
              'ガンマ補正：中間調を持ち上げ、半透明のベールやガラスを自然に。',
              '前処理コントラスト：主体と背景の差が強いほど綺麗に分離。',
            ],
            quote: 'アルゴリズムは 80 点、残り 20 点はあなたの手の中に。',
          },
          {
            heading: '限界はどこにあるか',
            body: '正直に言えば、U2NetP は万能ではありません。境界を知ることが、うまく使うコツです。',
            list: [
              '細い髪の毛：極細の一本一本は切れることがあり、手動補修と併用を。',
              '複雑な透明：大きなガラスや煙の透明度は限定的。',
              '320px 上限：超大画像の拡大は縁がやや柔らかくなる、これは正常。',
              'コントラスト依存：主体と背景が同色だと分離が厳しい。',
            ],
          },
          {
            heading: 'まとめ',
            body: 'U2NetP の価値は「最大」ではなく「ちょうど良い」にあります。ブラウザに収まるほど小さく、日常の切り抜きに十分な精度を持つ。それこそが SmartCut を無料かつローカルにする技術的な土台です。',
            quote: '最高の工学とは、ユーザーがその存在に気づかないものです。',
          },
        ],
      },
      ko: {
        title: 'U2NetP 이해하기: "컷아웃 두뇌"를 브라우저에 넣는 비결',
        excerpt: '무엇이고, 왜 이렇게 가벼우며, 브라우저에서 기기 내 추론은 어떻게 이루어질까요? 기술 심층 분석이 답합니다.',
        sections: [
          {
            heading: 'U2NetP는 정확히 무엇인가',
            body: 'U2NetP는 U2Net 계열의 경량 변형으로, 현저 객체 검출(Salient Object Detection)을 위해 만들어졌습니다. 임무는 명확합니다. 각 픽셀이 "피사체"에 속하는지 판단하고 마스크를 출력하는 것.\n\n원본 U2Net과 비교해 채널 수와 층을 줄여 파라미터를 최소화하면서도 2단 중첩 "U자형" 구조는 남겼기에 이런 이름이 붙었습니다.',
            quote: '더 큰 모델이 아니라, 더 똑똑한 모델입니다.',
          },
          {
            heading: '왜 "가볍습니다"가 중요한가',
            body: 'GPU 클러스터가 아니라 브라우저 안에서 실시간으로 돌리기 때문입니다. 모델이 클수록 다운로드는 느리고, 메모리는 빡빡해지고, 처리는 버벅입니다.',
            list: [
              '크기 예산: 풀 모델은 수백 MB, 로딩을 기다리지 않습니다.',
              '메모리 한계: 브라우저 탭 메모리는 한정되어 모델은 작아야 함.',
              '저사양 친화: 4GB 구형 노트북에서도 돌아가도록.',
              '콜드 스타트: 작을수록 첫 프레임이 빨라집니다.',
            ],
            quote: '가벼움은 편해서가 아니라, 더 많은 사람이 쓰게 해서입니다.',
          },
          {
            heading: '브라우저에서의 기기 내 추론',
            body: 'SmartCut은 ONNX Runtime Web으로 U2NetP의 ONNX 가중치를 불러옵니다. 장치 능력에 따라 WebGL과 로컬 WASM 백엔드 중 자동 선택합니다.',
            list: [
              'ONNX Runtime Web: 크로스 플랫폼 추론 엔진, 설치 없이 순수 프론트엔드.',
              'WASM 백엔드: 모든 브라우저에서 동작, CPU에서도 안정적.',
              'WebGL 백엔드: 지원 브라우저에서 GPU 호출, 속도 대폭 향상.',
              '320px 입력: 추론 전 320px 변으로 축소해 속도와 가장자리 정밀도 균형.',
            ],
            quote: '모델은 안 움직였고, 움직인 건 어떤 칩에서 도느냐뿐입니다.',
          },
          {
            heading: '품질을 높이는 4가지 팁',
            body: '같은 U2NetP라도 튜닝에 따라 결과는 천지차입니다. 다음 네 개의 손잡이가 가장 값집니다.',
            list: [
              '엣지 블러: 마스크에 1–2px 가우시안 블러로 톱니 hard edge 제거.',
              '임계값: 마스크 이진화, 0.5가 표준, 머리카락은 0.4로.',
              '감마 보정: 중간조를 올려 반투명 베일과 유리를 자연스럽게.',
              '전처리 대비: 피사체-배경 대비가 클수록 깔끔하게 분리.',
            ],
            quote: '알고리즘은 80점, 나머지 20점은 당신 손에 있습니다.',
          },
          {
            heading: '한계는 어디에 있는가',
            body: '솔직히 U2NetP는 만능이 아닙니다. 경계를 아는 것이 잘 쓰는 법입니다.',
            list: [
              '가는 머리카락: 아주 가는 한올은 끊길 수 있어 수동 보정과 병행.',
              '복잡한 투명: 큰 유리나 연기의 투명도는 제한적.',
              '320px 천장: 초대형 이미지 확대 시 가장자리 약간 부드러움은 정상.',
              '대비 의존: 피사체와 배경이 같은 색이면 분리 어려움.',
            ],
          },
          {
            heading: '요약',
            body: 'U2NetP의 가치는 "가장 크다"가 아니라 "딱 좋다"에 있습니다. 브라우저에 들어갈 만큼 작고, 일상 컷아웃에 충분한 정확도를 가집니다. 그것이 SmartCut을 무료이자 로컬로 만드는 기술적 토대입니다.',
            quote: '최고의 공학은 사용자가 그 존재를 눈치채지 못하는 것입니다.',
          },
        ],
      },
      'zh-TW': {
        title: '一文讀懂 U2NetP：把「摳圖大腦」塞進瀏覽器的秘密',
        excerpt: '它是什麼？為什麼這麼輕？又是如何在瀏覽器裡實現端側推理的？這篇技術解析給你答案。',
        sections: [
          {
            heading: 'U2NetP 到底是什麼',
            body: 'U2NetP 是 U2Net 系列的輕量化變體，專門為顯著性目標檢測（Salient Object Detection）設計。它的任務很明確：判斷圖中每個像素是否屬於「主體」，從而輸出一張遮罩。\n\n相比原版 U2Net，U2NetP 透過縮減通道數與層數，把參數量壓到極小，卻依然保留了兩級嵌套的「U 形」結構，因此得名。',
            quote: '它不是更大的模型，而是更聰明的模型。',
          },
          {
            heading: '為什麼一定要「輕」',
            body: '因為我們要把它塞進瀏覽器裡即時運行，而不是扔到 GPU 叢集上。模型越大，下載越慢、記憶體越吃緊、推理越卡頓。',
            list: [
              '體積門檻：完整模型動輒上百 MB，使用者根本等不起載入。',
              '記憶體限制：瀏覽器分頁能用的記憶體有限，模型必須夠小。',
              '低階友好：讓 4GB 記憶體的老筆電也能跑得動。',
              '冷啟動體驗：模型越小，首幀出圖越快。',
            ],
            quote: '輕，不是為了省事，是為了讓更多人用得上。',
          },
          {
            heading: '瀏覽器裡的端側推理',
            body: 'SmartCut 透過 ONNX Runtime Web 載入 U2NetP 的 ONNX 格式權重。它會根據裝置能力，在 WebGL 與本地 WASM 兩個後端之間自動選擇。',
            list: [
              'ONNX Runtime Web：跨平台推理引擎，免安裝、純前端。',
              'WASM 後端：相容一切瀏覽器，CPU 上也能跑，穩。',
              'WebGL 後端：在支援的瀏覽器上呼叫顯卡，速度大幅提升。',
              '320px 輸入：原圖縮放到 320 邊長再推理，兼顧速度與邊緣精度。',
            ],
            quote: '模型沒動，動的是它跑在哪塊晶片上。',
          },
          {
            heading: '提升摳圖品質的 4 個技巧',
            body: '同樣是 U2NetP，參數調得好不好，成品天差地別。下面四個旋鈕最值得你動手。',
            list: [
              '邊緣模糊（Blur）：對遮罩做 1–2px 高斯模糊，可消除鋸齒狀的硬邊。',
              '閾值（Threshold）：把遮罩二值化，0.5 是常規值，髮絲場景可降到 0.4。',
              '伽馬校正（Gamma）：提亮中間調，讓半透明婚紗、玻璃更自然。',
              '前處理對比度：主體與背景對比越強，分割越乾淨。',
            ],
            quote: '演算法給的是 80 分，剩下 20 分在你手裡。',
          },
          {
            heading: '它有什麼侷限',
            body: '誠實地說，U2NetP 並非萬能。理解它的邊界，才能用得其所。',
            list: [
              '細密髮絲：極細的單根髮絲仍可能斷裂，建議配合手動修復。',
              '複雜透明體：大面積玻璃、煙霧的透明度還原有限。',
              '320px 上限：超大圖上取樣後邊緣略軟，屬正常損耗。',
              '依賴原圖對比：主體與背景同色時，分割會吃力。',
            ],
          },
          {
            heading: '小結',
            body: 'U2NetP 的價值不在於「最大」，而在於「剛剛好」：夠小以塞進瀏覽器，夠準以勝任日常摳圖。它正是 SmartCut 能既免費又本地的技術底座。',
            quote: '最好的工程，是讓使用者感覺不到工程的存在。',
          },
        ],
      },
    },
  },

  // a3 — Local privacy
  {
    id: 'a3', slug: 'local-privacy', category: 'privacy', accent: 'emerald', emoji: '🔒', date: '2026-05-09', readingMinutes: 7,
    t: {
      'zh-CN': {
        title: '本地优先：你的照片为什么不该上传到云端',
        excerpt: '一次云端上传，究竟把多少隐私交了出去？SmartCut 如何用「全程本地」把控制权还给你。',
        sections: [
          {
            heading: '云端上传的隐形代价',
            body: '当一张私人照片被上传到在线抠图工具，它经历的远不止一次处理。图片会被存储、可能被用于模型训练、也可能在传输途中被截取。\n\n更隐蔽的是：你往往不会被告知图片会被保存多久、谁有权访问。',
            quote: '上传的那一秒，你就已经把解释权交了出去。',
          },
          {
            heading: '本地处理如何保护你',
            body: 'SmartCut 的所有推理都在你的浏览器内完成，图片从生成到导出，始终停留在你的设备里。',
            list: [
              '零上传：图片字节从不离开本机网络。',
              '零留存：关闭页面后，内存与缓存中的图像随之清空。',
              '零第三方：不调用任何外部 API 或广告追踪。',
              '可离线：断网也能照样抠图。',
            ],
            quote: '保护隐私最好的方式，是让它根本没有机会离开。',
          },
          {
            heading: '断网也能用的底气',
            body: '因为模型权重在首次访问时已经下载到本地，之后的每一次抠图都不需要网络。这既是隐私优势，也是可靠性优势。',
            list: [
              '地铁、飞机、电梯里照常工作。',
              '无需担心服务器宕机或限流。',
              '没有上传带宽，处理不受网络波动影响。',
            ],
          },
          {
            heading: '谁最该用本地工具',
            body: '并非所有人都对隐私极其敏感，但有几类人尤其应该把图片留在本地。',
            list: [
              '电商卖家：未上架的商品图属于商业机密。',
              '摄影师与客户：肖像与私拍绝不该外流。',
              '企业法务/HR：证件、合同扫描件高度敏感。',
              '普通用户：随手拍的生活照也值得被尊重。',
            ],
            quote: '敏感不是一种标签，而是一种常态。',
          },
          {
            heading: '我们的「不记录」承诺',
            body: 'SmartCut 不要求登录，因此服务端没有任何与你绑定的画像。我们没有账号体系，也就没有可供泄露的账号数据。',
            list: [
              '不收集邮箱、手机号等身份信息。',
              '不在服务端保存任何上传内容。',
              '分析数据默认匿名、聚合，无法回溯到个人。',
            ],
            quote: '不收集，就无从泄露。',
          },
        ],
      },
      en: {
        title: 'Local-First: Why Your Photos Should Never Hit the Cloud',
        excerpt: 'What does a single cloud upload really hand over? How SmartCut uses "fully local" processing to give control back to you.',
        sections: [
          {
            heading: 'The hidden cost of cloud uploads',
            body: 'When a private photo is uploaded to an online cutout tool, it goes through far more than one pass. The image gets stored, may be used for model training, and can be intercepted in transit.\n\nMore subtly: you are often not told how long it is kept or who can access it.',
            quote: 'The moment you upload, you have already handed over the right to explain.',
          },
          {
            heading: 'How local processing protects you',
            body: 'Every SmartCut inference runs inside your browser. From generation to export, the image never leaves your device.',
            list: [
              'Zero upload: image bytes never leave your local network.',
              'Zero retention: closing the page clears the image from memory and cache.',
              'Zero third party: no external API or ad tracker is ever called.',
              'Offline capable: cutouts work even without a connection.',
            ],
            quote: 'The best way to protect privacy is to never give it a chance to leave.',
          },
          {
            heading: 'The confidence of working offline',
            body: 'Because model weights are downloaded locally on first visit, every later cutout needs no network. That is both a privacy and a reliability win.',
            list: [
              'Works on the subway, a plane, or inside an elevator.',
              'No worry about server downtime or rate limits.',
              'No upload bandwidth, so processing is unaffected by network jitter.',
            ],
          },
          {
            heading: 'Who should use local tools most',
            body: 'Not everyone is ultra privacy-sensitive, but some groups especially should keep images local.',
            list: [
              'E-commerce sellers: unreleased product shots are trade secrets.',
              'Photographers and clients: portraits and private shoots must not leak.',
              'Corporate legal/HR: IDs and contract scans are highly sensitive.',
              'Everyday users: casual life photos deserve respect too.',
            ],
            quote: 'Sensitive is not a label; it is the default state.',
          },
          {
            heading: 'Our "no-log" promise',
            body: 'SmartCut asks for no login, so the server holds no profile tied to you. With no account system, there is no account data to leak.',
            list: [
              'We collect no identity info like email or phone number.',
              'We store no uploaded content on the server side.',
              'Analytics are anonymous and aggregated by default, never traceable to you.',
            ],
            quote: 'If you do not collect it, there is nothing to leak.',
          },
        ],
      },
      ja: {
        title: 'ローカル最優先：あなたの写真はクラウドに上げるべきではない',
        excerpt: '一度のクラウドアップロードで、どれほどのプライバシーを手渡しているか。SmartCut が「完全ローカル」でどう制御権を戻すか。',
        sections: [
          {
            heading: 'クラウドアップロードの見えない代償',
            body: 'プライベートな写真をオンライン切り抜きツールに上げると、それは一度の処理以上のことを経ます。画像は保存され、モデル学習に使われ、通信中に傍受されることもあります。\n\nさらに隠れた問題は、どれだけ保持され、誰がアクセスできるかを知らされないことです。',
            quote: 'アップロードした瞬間、あなたは説明する権利を手渡しています。',
          },
          {
            heading: 'ローカル処理がどう守るか',
            body: 'SmartCut のすべての推論はブラウザ内で完結します。生成から書き出しまで、画像は端末を出ません。',
            list: [
              'アップロードゼロ：画像バイトはローカルネットワークを出ない。',
              '保持ゼロ：ページを閉じればメモリやキャッシュから画像は消える。',
              '第三者ゼロ：外部 API や広告トラッカーは一切呼ばない。',
              'オフライン可：通信がなくても切り抜き可能。',
            ],
            quote: 'プライバシーを守る最良の方法は、そもそも出る機会を作らないことです。',
          },
          {
            heading: 'オフラインで動く安心',
            body: 'モデル重みは初回アクセス時にローカルへダウンロードされるため、その後の切り抜きは通信不要です。これはプライバシーと信頼性の両取りです。',
            list: [
              '地下鉄や飛行機、エレベーターの中でも動く。',
              'サーバーの停止や制限を気にしなくて済む。',
              'アップロード帯域がないため、ネット揺れの影響を受けない。',
            ],
          },
          {
            heading: '誰が最もローカルを使うべきか',
            body: '皆が極端にプライバシーを気にするわけではありませんが、いくつかの層は特に画像をローカルに留めるべきです。',
            list: [
              'EC 出品者：未公開の商品画像は営業秘密。',
              '写真家と顧客：肖像や私的撮影は外に出してはならない。',
              '企業法務・人事：身分証や契約のスキャンは極めて敏感。',
              '一般ユーザー：何気ない日常写真も尊重に値する。',
            ],
            quote: '敏感であることはラベルではなく、デフォルトの状態です。',
          },
          {
            heading: '私たちの「非記録」宣言',
            body: 'SmartCut はログインを求めないため、サーバー側にあなたに紐づくプロフィールはありません。アカウント体系がないので、漏れるアカウントデータもありません。',
            list: [
              'メールや電話番号などの身元情報は収集しない。',
              'サーバー側にアップロード内容を保存しない。',
              '分析は既定で匿名・集計され、個人には遡れない。',
            ],
            quote: '集めなければ、漏らすものは何もない。',
          },
        ],
      },
      ko: {
        title: '로컬 우선: 당신의 사진은 클라우드로 가선 안 됩니다',
        excerpt: '한 번의 클라우드 업로드가 정녕 얼마나 많은 프라이버시를 넘기는지. SmartCut이 "완전 로컬"로 어떻게 통제권을 돌려주는지.',
        sections: [
          {
            heading: '클라우드 업로드의 보이지 않는 대가',
            body: '사적인 사진을 온라인 컷아웃 도구에 올리면, 그것은 단 한 번의 처리 이상을 겪습니다. 이미지는 저장되고, 모델 학습에 쓰일 수 있으며, 전송 중 가로챌 수도 있습니다.\n\n더 은밀한 것은, 얼마나 오래 보관되고 누가 접근하는지 알려받지 못한다는 점입니다.',
            quote: '업로드하는 순간, 당신은 설명할 권리를 이미 넘겼습니다.',
          },
          {
            heading: '로컬 처리가 어떻게 보호하는가',
            body: 'SmartCut의 모든 추론은 브라우저 내에서 끝납니다. 생성부터 내보내기까지 이미지는 기기를 떠나지 않습니다.',
            list: [
              '업로드 제로: 이미지 바이트는 로컬 네트워크를 떠나지 않음.',
              '보관 제로: 페이지를 닫으면 메모리와 캐시에서 이미지 소멸.',
              '제3자 제로: 외부 API나 광고 추적은 일절 호출 안 함.',
              '오프라인 가능: 연결 없이도 컷아웃 작동.',
            ],
            quote: '프라이버시를 지키는 최선은, 떠날 기회 자체를 주지 않는 것입니다.',
          },
          {
            heading: '오프라인으로 써도 든든한 이유',
            body: '모델 가중치는 첫 방문 때 로컬에 받아지므로, 이후 컷아웃은 네트워크가 필요 없습니다. 이는 프라이버시이자 신뢰성 승리입니다.',
            list: [
              '지하철, 비행기, 엘리베이터 안에서도 작동.',
              '서버 다운이나 제한을 걱정할 필요 없음.',
              '업로드 대역이 없어 네트워크 요동 영향 안 받음.',
            ],
          },
          {
            heading: '누가 가장 로컬 도구를 써야 하는가',
            body: '모두가 극도로 프라이버시를 신경 쓰는 건 아니지만, 몇 부류는 특히 이미지를 로컬에 두어야 합니다.',
            list: [
              '이커머스 판매자: 미공개 상품 사진은 영업 비밀.',
              '사진작가와 고객: 초상과 사적 촬영은 유출되면 안 됨.',
              '기업 법무·HR: 신분증·계약 스캔은 매우 민감.',
              '일반 사용자: 일상 스냅도 존중받아 마땅함.',
            ],
            quote: '민감함은 라벨이 아니라 기본 상태입니다.',
          },
          {
            heading: '우리의 "기록 안 함" 약속',
            body: 'SmartCut은 로그인을 요구하지 않으므로 서버에 당신에 묶인 프로필이 없습니다. 계정 체계가 없으니 새어나갈 계정 데이터도 없습니다.',
            list: [
              '이메일·전화번호 같은 신원 정보를 수집하지 않음.',
              '서버 측에 업로드 내용을 저장하지 않음.',
              '분석은 기본 익명·집계되어 개인에 되추적 불가.',
            ],
            quote: '수집하지 않으면, 새어나갈 것도 없습니다.',
          },
        ],
      },
      'zh-TW': {
        title: '本地優先：你的照片為什麼不該上傳到雲端',
        excerpt: '一次雲端上傳，究竟把多少隱私交了出去？SmartCut 如何用「全程本地」把控制權還給你。',
        sections: [
          {
            heading: '雲端上傳的隱形代價',
            body: '當一張私人照片被上傳到線上摳圖工具，它經歷的遠不止一次處理。圖片會被儲存、可能被用於模型訓練、也可能在傳輸途中被截取。\n\n更隱蔽的是：你往往不會被告知圖片會被保存多久、誰有權存取。',
            quote: '上傳的那一秒，你已經把解釋權交了出去。',
          },
          {
            heading: '本地處理如何保護你',
            body: 'SmartCut 的所有推理都在你的瀏覽器內完成，圖片從生成到匯出，始終停留在你的裝置裡。',
            list: [
              '零上傳：圖片位元組從不離開本機網路。',
              '零留存：關閉頁面後，記憶體與快取中的影像隨之清空。',
              '零第三方：不呼叫任何外部 API 或廣告追蹤。',
              '可離線：斷網也能照樣摳圖。',
            ],
            quote: '保護隱私最好的方式，是讓它根本沒有機會離開。',
          },
          {
            heading: '斷網也能用的底氣',
            body: '因為模型權重在首次造訪時已經下載到本地，之後的每一次摳圖都不需要網路。這既是隱私優勢，也是可靠性優勢。',
            list: [
              '捷運、飛機、電梯裡照常工作。',
              '無需擔心伺服器當機或限流。',
              '沒有上傳頻寬，處理不受網路波動影響。',
            ],
          },
          {
            heading: '誰最該用本地工具',
            body: '並非所有人都對隱私極其敏感，但有幾類人尤其應該把圖片留在本地。',
            list: [
              '電商賣家：未上架的商品圖屬於商業機密。',
              '攝影師與客戶：肖像與私拍絕不該外流。',
              '企業法務/HR：證件、合約掃描檔高度敏感。',
              '普通使用者：隨手拍的生活照也值得被尊重。',
            ],
            quote: '敏感不是一種標籤，而是一種常態。',
          },
          {
            heading: '我們的「不記錄」承諾',
            body: 'SmartCut 不要求登入，因此服務端沒有任何與你綁定的畫像。我們沒有帳號體系，也就沒有可供外洩的帳號資料。',
            list: [
              '不收集信箱、手機號等身分資訊。',
              '不在服務端儲存任何上傳內容。',
              '分析資料預設匿名、聚合，無法回溯到個人。',
            ],
            quote: '不收集，就無從洩露。',
          },
        ],
      },
    },
  },

  // a4 — Quick start
  {
    id: 'a4', slug: 'quick-start', category: 'tutorial', accent: 'cyan', emoji: '✂️', date: '2026-04-22', readingMinutes: 6,
    t: {
      'zh-CN': {
        title: 'SmartCut 新手教程：1 分钟拿到透明 PNG',
        excerpt: '从上传到导出，手把手带你跑通第一次抠图，并附上背景替换、魔法橡皮擦与预设裁切的实用技巧。',
        sections: [
          {
            heading: '第一步：上传图片',
            body: '打开 SmartCut 网页后，直接把图片拖进虚线框，或点击框内按钮从本地选择。支持常见格式，文件会自动读入内存，不会上传。',
            list: [
              '拖拽上传：从文件管理器直接拖入。',
              '点击上传：从系统文件选择器中挑选。',
              '即时预览：读入后立刻看到原图缩略。',
            ],
          },
          {
            heading: '第二步：一键抠图',
            body: '点击「一键抠图」，模型会在本地自动分离主体与背景。通常 1–3 秒即可看到结果，复杂大图稍慢也属正常。',
            quote: '你点的不是按钮，是开关。',
          },
          {
            heading: '第三步：下载透明 PNG',
            body: '确认效果后，点击「下载」即可获得背景透明的 PNG。透明区域在任何设计软件里都会显示为棋盘格。',
            list: [
              '默认导出透明 PNG，保留发丝级边缘。',
              '也可选择导出带背景的合成图。',
              '右键预览图可快速「另存为」。',
            ],
          },
          {
            heading: '进阶：背景替换、魔法橡皮擦、预设裁切',
            body: '拿到透明主体后，乐趣才刚开始。SmartCut 提供三件趁手工具，让成品直接进入可用状态。',
            list: [
              '背景替换：内置纯色、渐变与模板，一键套用。',
              '魔法橡皮擦：手动擦除残留背景，处理边缘杂色。',
              '预设裁切：按电商、头像、海报等比例一键裁切。',
            ],
            quote: '抠图是手段，好用才是目的。',
          },
          {
            heading: '常见问题（FAQ）',
            body: '关于格式与尺寸的疑问，这里先给出标准答案，省得你来回试。',
            list: [
              '支持格式：PNG、JPG、WebP 均可作为导入源。',
              '文件大小：单张建议不超过 20MB，过大请先压缩。',
              '导出格式：透明背景用 PNG，体积优先用 WebP。',
              '尺寸限制：输出分辨率与原图一致，不强制缩放。',
            ],
          },
        ],
      },
      en: {
        title: 'SmartCut Quick Start: Get a Transparent PNG in 1 Minute',
        excerpt: 'From upload to export, we walk you through your first cutout by hand, plus practical tips for background swap, magic eraser, and preset crops.',
        sections: [
          {
            heading: 'Step 1: Upload your image',
            body: 'After opening SmartCut, just drag a photo into the dashed box, or click the button to pick one locally. Common formats are supported; the file loads into memory and is never uploaded.',
            list: [
              'Drag upload: drop straight from your file manager.',
              'Click upload: choose from the system file picker.',
              'Instant preview: the original thumbnail appears right away.',
            ],
          },
          {
            heading: 'Step 2: One-click cutout',
            body: 'Click "One-click cutout" and the model separates subject from background locally. You usually see a result in 1–3 seconds; slower on complex large images is normal.',
            quote: 'You are not pressing a button; you are flipping a switch.',
          },
          {
            heading: 'Step 3: Download the transparent PNG',
            body: 'Once satisfied, click "Download" to get a transparency-background PNG. The transparent area shows as a checkerboard in any design app.',
            list: [
              'Exports a transparent PNG by default, keeping hair-level edges.',
              'You can also export a composited image with a background.',
              'Right-click the preview to "Save as" quickly.',
            ],
          },
          {
            heading: 'Beyond basics: background swap, magic eraser, preset crop',
            body: 'Once you have the transparent subject, the fun begins. SmartCut ships three handy tools that bring results straight to usable state.',
            list: [
              'Background swap: built-in solid colors, gradients, and templates, one click.',
              'Magic eraser: manually wipe leftover background and fix edge noise.',
              'Preset crop: one-click crop to e-commerce, avatar, or poster ratios.',
            ],
            quote: 'Cutout is the means; being usable is the end.',
          },
          {
            heading: 'FAQ',
            body: 'For questions about formats and sizes, here are the standard answers so you do not have to trial and error.',
            list: [
              'Formats: PNG, JPG, and WebP all work as import sources.',
              'File size: keep a single image under 20MB; compress first if larger.',
              'Export format: use PNG for transparency, WebP when size matters.',
              'Size limits: output resolution matches the original, no forced scaling.',
            ],
          },
        ],
      },
      ja: {
        title: 'SmartCut 使い方：1 分で透過 PNG をゲット',
        excerpt: 'アップロードから書き出しまで、初めての切り抜きを一緒に走破。背景入れ替え、マジック消しゴム、プリセット切り抜きの実用 tips 付き。',
        sections: [
          {
            heading: 'ステップ 1：画像をアップロード',
            body: 'SmartCut を開いたら、写真を破線枠へそのままドラッグ、または枠内のボタンでローカルから選択します。主要な形式に対応し、ファイルはメモリへ読み込まれ、送信されません。',
            list: [
              'ドラッグ投稿：ファイルマネージャから直接放り込む。',
              'クリック投稿：システムのファイル選択から選ぶ。',
              '即時プレビュー：読み込み直後に元画像のサムネイル表示。',
            ],
          },
          {
            heading: 'ステップ 2：ワンクリック切り抜き',
            body: '「ワンクリック切り抜き」を押すと、モデルが端末内で主体と背景を自動分離します。通常 1–3 秒で結果が出ます。複雑な大画像は少し遅くても正常です。',
            quote: 'あなたが押しているのはボタンではなく、スイッチです。',
          },
          {
            heading: 'ステップ 3：透過 PNG をダウンロード',
            body: '仕上がりを確認して「ダウンロード」を押せば、背景透過の PNG を取得できます。透過部分はどのデザインアプリでもチェック柄で表示されます。',
            list: [
              '既定で透過 PNG を書き出し、髪の毛レベルの縁を保持。',
              '背景付きの合成画像として書き出すことも可。',
              'プレビューを右クリックで「名前を付けて保存」も可。',
            ],
          },
          {
            heading: '基本の先：背景入れ替え、マジック消しゴム、プリセット裁ち',
            body: '透過した主体を手に入れたら、面白さの始まりです。SmartCut には、そのまま使える状態へ連れて行く 3 つの道具が備わっています。',
            list: [
              '背景入れ替え：単色・グラデーション・テンプレートを一発適用。',
              'マジック消しゴム：残った背景を手動消去し、縁のノイズを補正。',
              'プリセット裁ち：EC・アイコン・ポスターの比率へ一発裁断。',
            ],
            quote: '切り抜きは手段、使えることが目的です。',
          },
          {
            heading: 'よくある質問',
            body: '形式やサイズの疑問には、ここで先に標準回答を示し、試行錯誤を省きます。',
            list: [
              '対応形式：PNG・JPG・WebP はすべて読み込み元に。',
              'ファイルサイズ：1 枚は 20MB 以下を推奨、それ以上は先に圧縮を。',
              '書き出し形式：透過なら PNG、容量優先なら WebP。',
              'サイズ制限：出力解像度は原画像と同じ、強制縮小なし。',
            ],
          },
        ],
      },
      ko: {
        title: 'SmartCut 빠른 시작: 1분 만에 투명 PNG 받기',
        excerpt: '업로드부터 내보내기까지, 첫 컷아웃을 손에 잡고 안내합니다. 배경 교체, 매직 지우개, 프리셋 자르기 실용 팁 포함.',
        sections: [
          {
            heading: '1단계: 이미지 업로드',
            body: 'SmartCut을 열면 사진을 점선 상자로 그대로 끌어다 놓거나, 상자 안 버튼으로 로컬에서 고르면 됩니다. 주요 형식을 지원하며 파일은 메모리에만 읽히고 전송되지 않습니다.',
            list: [
              '드래그 업로드: 파일 관리자에서 바로 넣기.',
              '클릭 업로드: 시스템 파일 선택에서 고르기.',
              '즉시 미리보기: 읽자마자 원본 썸네일 표시.',
            ],
          },
          {
            heading: '2단계: 원클릭 컷아웃',
            body: '"원클릭 컷아웃"을 누르면 모델이 기기 내에서 피사체와 배경을 자동 분리합니다. 보통 1–3초면 결과가 나오고, 복잡한 대형 이미지는 조금 느려도 정상입니다.',
            quote: '당신이 누르는 건 버튼이 아니라 스위치입니다.',
          },
          {
            heading: '3단계: 투명 PNG 받기',
            body: '결과를 확인하고 "다운로드"를 누르면 배경 투명 PNG를 얻습니다. 투명 영역은 어떤 디자인 앱에서도 체커보드로 표시됩니다.',
            list: [
              '기본값으로 투명 PNG 내보내기, 머리카락 수준 가장자리 유지.',
              '배경 포함 합성 이미지로 내보내기도 가능.',
              '미리보기를 우클릭해 "다른 이름으로 저장"도 가능.',
            ],
          },
          {
            heading: '기본 넘어서: 배경 교체, 매직 지우개, 프리셋 자르기',
            body: '투명 피사체를 손에 넣으면 재미가 시작됩니다. SmartCut에는 바로 쓸 수 있는 상태로 이끄는 세 도구가 있습니다.',
            list: [
              '배경 교체: 단색·그라데이션·템플릿을 한 번에 적용.',
              '매직 지우개: 남은 배경을 수동 제거하고 가장자리 노이즈 보정.',
              '프리셋 자르기: 이커머스·아이콘·포스터 비율로 한 번에 절단.',
            ],
            quote: '컷아웃은 수단, 쓸모 있어지는 것이 목적입니다.',
          },
          {
            heading: '자주 묻는 질문',
            body: '형식과 크기에 대한 의문에는 여기서 먼저 표준 답을 알려드려 시행착오를 덜어둡니다.',
            list: [
              '지원 형식: PNG·JPG·WebP 모두 가져오기 원본으로 가능.',
              '파일 크기: 한 장은 20MB 이하 권장, 그 이상이면 먼저 압축.',
              '내보내기 형식: 투명은 PNG, 용량 우선은 WebP.',
              '크기 제한: 출력 해상도는 원본과 동일, 강제 축소 없음.',
            ],
          },
        ],
      },
      'zh-TW': {
        title: 'SmartCut 新手教學：1 分鐘拿到透明 PNG',
        excerpt: '從上傳到匯出，手把手帶你跑通第一次摳圖，並附上背景替換、魔法橡皮擦與預設裁切的實用技巧。',
        sections: [
          {
            heading: '第一步：上傳圖片',
            body: '打開 SmartCut 網頁後，直接把圖片拖進虛線框，或點擊框內按鈕從本地選擇。支援常見格式，檔案會自動讀入記憶體，不會上傳。',
            list: [
              '拖曳上傳：從檔案管理器直接拖入。',
              '點擊上傳：從系統檔案選擇器中挑選。',
              '即時預覽：讀入後立刻看到原圖縮圖。',
            ],
          },
          {
            heading: '第二步：一鍵摳圖',
            body: '點擊「一鍵摳圖」，模型會在本地自動分離主體與背景。通常 1–3 秒即可看到結果，複雜大圖稍慢也屬正常。',
            quote: '你點的不是按鈕，是開關。',
          },
          {
            heading: '第三步：下載透明 PNG',
            body: '確認效果後，點擊「下載」即可獲得背景透明的 PNG。透明區域在任何設計軟體裡都會顯示為棋盤格。',
            list: [
              '預設匯出透明 PNG，保留髮絲級邊緣。',
              '也可選擇匯出帶背景的合成圖。',
              '右鍵預覽圖可快速「另存為」。',
            ],
          },
          {
            heading: '進階：背景替換、魔法橡皮擦、預設裁切',
            body: '拿到透明主體後，樂趣才剛開始。SmartCut 提供三件趁手工具，讓成品直接進入可用狀態。',
            list: [
              '背景替換：內建純色、漸層與模板，一鍵套用。',
              '魔法橡皮擦：手動擦除殘留背景，處理邊緣雜色。',
              '預設裁切：按電商、頭像、海報等比例一鍵裁切。',
            ],
            quote: '摳圖是手段，好用才是目的。',
          },
          {
            heading: '常見問題（FAQ）',
            body: '關於格式與尺寸的疑問，這裡先給出標準答案，省得你來回試。',
            list: [
              '支援格式：PNG、JPG、WebP 均可作為匯入來源。',
              '檔案大小：單張建議不超過 20MB，過大請先壓縮。',
              '匯出格式：透明背景用 PNG，體積優先用 WebP。',
              '尺寸限制：輸出解析度與原圖一致，不強制縮放。',
            ],
          },
        ],
      },
    },
  },

  // a5 — Use cases
  {
    id: 'a5', slug: 'use-cases', category: 'usecase', accent: 'rose', emoji: '🛍️', date: '2026-03-30', readingMinutes: 8,
    t: {
      'zh-CN': {
        title: 'SmartCut 的 5 个真实使用场景',
        excerpt: '电商白底图、头像、海报、贴纸、PPT——每个场景的抠图要点与推荐导出格式，一篇讲清。',
        sections: [
          {
            heading: '场景一：电商白底图',
            body: '商品上架最稳妥的背景是纯白。把主体抠出后铺一张纯白底，既统一又符合平台规范。',
            list: [
              '前景与背景留 10% 边距，避免裁切主体。',
              '导出 2000px 以上长边，保证放大不糊。',
              '推荐导出：白底 PNG（也可存为 JPG 省空间）。',
            ],
            quote: '白底不是审美，是转化率。',
          },
          {
            heading: '场景二：社交头像',
            body: '头像讲究干净聚焦。抠出人像后换上柔和的纯色或渐变，辨识度立刻提升。',
            list: [
              '用预设裁切的 1:1 比例，避免被平台再裁。',
              '肩部以上取景，留出头顶空间。',
              '推荐导出：透明 PNG，方便二次合成。',
            ],
          },
          {
            heading: '场景三：活动海报',
            body: '海报里的主体往往是抠出来再拼贴的。保留透明边缘，叠加文字与色块才自然。',
            list: [
              '主体与底色对比拉开，文字才读得清。',
              '边缘模糊 1px，融合更顺。',
              '推荐导出：透明 PNG，最后在排版软件里合成。',
            ],
          },
          {
            heading: '场景四：趣味贴纸',
            body: '贴纸要的就是能到处贴。透明 PNG 让它黏在任何背景上都像原生。',
            list: [
              '加一圈白描边，深色背景上也跳得出来。',
              '导出分辨率别太低，印刷才不糊。',
              '推荐导出：带描边的透明 PNG。',
            ],
            quote: '贴纸的快乐，在于无处不在。',
          },
          {
            heading: '场景五：PPT 配图',
            body: 'PPT 里最忌讳灰白方块底。换成透明主体，页面立刻高级起来。',
            list: [
              '透明 PNG 直接拖进幻灯片，背景随母版走。',
              '阴影用页面自带效果，别烧进图里。',
              '推荐导出：透明 PNG，体积用 WebP 兜底。',
            ],
          },
        ],
      },
      en: {
        title: '5 Real-World Use Cases for SmartCut',
        excerpt: 'E-commerce white background, avatars, posters, stickers, PPT — the cutout tips and recommended export format for each, all in one post.',
        sections: [
          {
            heading: 'Use case 1: E-commerce white background',
            body: 'The safest background for listings is pure white. Cut out the subject and drop it on white for a uniform, platform-compliant look.',
            list: [
              'Keep a 10% margin around the subject so nothing gets cropped.',
              'Export at 2000px+ on the long edge to stay sharp when zoomed.',
              'Recommended export: white-background PNG (or JPG to save space).',
            ],
            quote: 'White background is not aesthetics; it is conversion.',
          },
          {
            heading: 'Use case 2: Social avatars',
            body: 'Avatars want clean focus. Cut the person out and swap in a soft solid or gradient, and recognizability jumps.',
            list: [
              'Use the 1:1 preset crop so platforms do not re-crop you.',
              'Frame from the shoulders up, leaving headroom.',
              'Recommended export: transparent PNG for easy reuse.',
            ],
          },
          {
            heading: 'Use case 3: Event posters',
            body: 'Poster subjects are usually cut out then composited. Keep the transparent edge so text and color blocks blend naturally.',
            list: [
              'Push subject-to-background contrast so text stays legible.',
              'Blur the edge 1px for a smoother merge.',
              'Recommended export: transparent PNG, composited in layout software.',
            ],
          },
          {
            heading: 'Use case 4: Fun stickers',
            body: 'Stickers are meant to be stuck everywhere. A transparent PNG makes them look native on any background.',
            list: [
              'Add a white outline so they pop even on dark backgrounds.',
              'Do not export too small, or print gets blurry.',
              'Recommended export: transparent PNG with outline.',
            ],
            quote: 'The joy of stickers is being everywhere.',
          },
          {
            heading: 'Use case 5: PPT visuals',
            body: 'Nothing kills a slide like a gray-white box behind the subject. Swap in a transparent subject and the page instantly looks premium.',
            list: [
              'Drop the transparent PNG straight into the slide; background follows the master.',
              "Use the page's own shadow effect, do not bake it into the image.",
              'Recommended export: transparent PNG, with WebP as the size fallback.',
            ],
          },
        ],
      },
      ja: {
        title: 'SmartCut の 5 つの実際の使い方',
        excerpt: 'EC 白背景、アイコン、ポスター、ステッカー、PPT——各シーンの切り抜きのコツと推奨書き出し形式を一挙に。',
        sections: [
          {
            heading: '活用例 1：EC の白背景',
            body: '出品で最も安全な背景は純白です。主体を切り抜き白に置くと、統一感とプラットフォーム準拠を両立できます。',
            list: [
              '主体の周りに 10% の余白を取り、切れないように。',
              '長辺 2000px 以上で書き出し、拡大してもくっきり。',
              '推奨書き出し：白背景 PNG（容量稼ぎは JPG も可）。',
            ],
            quote: '白背景は美学ではなく、転換率です。',
          },
          {
            heading: '活用例 2：SNS アイコン',
            body: 'アイコンには clean なフォーカスが要ります。人物を切り抜き、柔らかな単色かグラデーションに替えると認識しやすさが上がります。',
            list: [
              '1:1 のプリセット裁ちで、プラットフォームに再裁断されない。',
              '肩から上を写し、頭上の余裕を残す。',
              '推奨書き出し：二次利用しやすい透過 PNG。',
            ],
          },
          {
            heading: '活用例 3：イベントポスター',
            body: 'ポスターの主体は切り抜いてから貼るのが常道。透過縁を残せば、文字や色塊が自然に馴染みます。',
            list: [
              '主体と地の対比を開き、文字を読めるように。',
              '縁を 1px ぼかし、なじませる。',
              '推奨書き出し：透過 PNG、DTP ソフトで合成。',
            ],
          },
          {
            heading: '活用例 4：楽しいステッカー',
            body: 'ステッカーはあちこちへ貼るためのもの。透過 PNG ならどの背景にも原生のように見えます。',
            list: [
              '白い輪郭を加え、暗い背景でも浮かぶように。',
              '小さすぎる書き出しは禁物、印刷でにじむ。',
              '推奨書き出し：輪郭付きの透過 PNG。',
            ],
            quote: 'ステッカーの楽しさは、どこにでもあることです。',
          },
          {
            heading: '活用例 5：PPT の図版',
            body: 'PPT で一番良くないのは、主体の後ろの白灰の箱。透過主体に替えれば、ページが一瞬で上質になります。',
            list: [
              '透過 PNG をそのままスライドへ、背景はマスターに従う。',
              '影はページの効果を使い、画像に焼き込まない。',
              '推奨書き出し：透過 PNG、容量は WebP でフォールバック。',
            ],
          },
        ],
      },
      ko: {
        title: 'SmartCut 활용 5가지 실제 사례',
        excerpt: '이커머스 흰 배경, 프로필, 포스터, 스티커, PPT—각 상황의 컷아웃 요령과 추천 내보내기 형식 한 번에.',
        sections: [
          {
            heading: '활용 1: 이커머스 흰 배경',
            body: '상품 등록에 가장 안전한 배경은 순백입니다. 피사체를 잘라 흰색에 두면 통일감과 플랫폼 규격을 모두 잡습니다.',
            list: [
              '피사체 주위 여백 10% 유지, 잘리지 않게.',
              '긴 변 2000px 이상으로 내보내 확대해도 선명하게.',
              '추천 내보내기: 흰 배경 PNG (공간 절약은 JPG도 가능).',
            ],
            quote: '흰 배경은 미학이 아니라 전환율입니다.',
          },
          {
            heading: '활용 2: SNS 프로필',
            body: '프로필에는 깔끔한 초점이 필요합니다. 인물을 잘라 부드러운 단색이나 그라데이션으로 바꾸면 알아보기 쉬워집니다.',
            list: [
              '1:1 프리셋 자르기로 플랫폼 재자르기 방지.',
              '어깨 위로 프레이밍, 머리 위 여유 둠.',
              '추천 내보내기: 재사용 쉬운 투명 PNG.',
            ],
          },
          {
            heading: '활용 3: 행사 포스터',
            body: '포스터 피사체는 보통 잘라낸 뒤 합성합니다. 투명 가장자리를 남기면 글자와 색 블록이 자연스레 녹아듭니다.',
            list: [
              '피사체-배경 대비를 벌려 글자가 읽히게.',
              '가장자리 1px 블러로 부드럽게 merge.',
              '추천 내보내기: 투명 PNG, DTP에서 합성.',
            ],
          },
          {
            heading: '활용 4: 재미있는 스티커',
            body: '스티커는 여기저기 붙이려는 것입니다. 투명 PNG면 어떤 배경에도 네이티브처럼 보입니다.',
            list: [
              '흰 외곽선을 더해 어두운 배경에서도 튀게.',
              '너무 작게 내보내지 말 것, 인쇄에서 번짐.',
              '추천 내보내기: 외곽선 포함 투명 PNG.',
            ],
            quote: '스티커의 즐거움은 어디에든 있다는 것입니다.',
          },
          {
            heading: '활용 5: PPT 그림',
            body: 'PPT에서 가장 나쁜 건 피사체 뒤 흰 회색 상자. 투명 피사체로 바꾸면 페이지가 단번에 프리미엄해집니다.',
            list: [
              '투명 PNG를 그대로 슬라이드에, 배경은 마스터 따름.',
              '그림자 효과는 페이지 것을 쓰고 이미지에 굽지 말 것.',
              '추천 내보내기: 투명 PNG, 용량은 WebP로 fallback.',
            ],
          },
        ],
      },
      'zh-TW': {
        title: 'SmartCut 的 5 個真實使用場景',
        excerpt: '電商白底圖、頭像、海報、貼紙、PPT——每個場景的摳圖要點與推薦匯出格式，一篇講清。',
        sections: [
          {
            heading: '場景一：電商白底圖',
            body: '商品上架最穩妥的背景是純白。把主體摳出後鋪一張純白底，既統一又符合平台規範。',
            list: [
              '前景與背景留 10% 邊距，避免裁切主體。',
              '匯出 2000px 以上長邊，保證放大不糊。',
              '推薦匯出：白底 PNG（也可存為 JPG 省空間）。',
            ],
            quote: '白底不是審美，是轉化率。',
          },
          {
            heading: '場景二：社群頭像',
            body: '頭像講究乾淨聚焦。摳出人像後換上柔和的純色或漸層，辨識度立刻提升。',
            list: [
              '用預設裁切的 1:1 比例，避免被平台再裁。',
              '肩部以上取景，留出頭頂空間。',
              '推薦匯出：透明 PNG，方便二次合成。',
            ],
          },
          {
            heading: '場景三：活動海報',
            body: '海報裡的主體往往是摳出來再拼貼的。保留透明邊緣，疊加文字與色塊才自然。',
            list: [
              '主體與底色對比拉開，文字才讀得清。',
              '邊緣模糊 1px，融合更順。',
              '推薦匯出：透明 PNG，最後在排版軟體裡合成。',
            ],
          },
          {
            heading: '場景四：趣味貼紙',
            body: '貼紙要的就是能到處貼。透明 PNG 讓它黏在任何背景上都像原生。',
            list: [
              '加一圈白描邊，深色背景上也跳得出來。',
              '匯出解析度別太低，印刷才不糊。',
              '推薦匯出：帶描邊的透明 PNG。',
            ],
            quote: '貼紙的快樂，在於無處不在。',
          },
          {
            heading: '場景五：PPT 配圖',
            body: 'PPT 裡最忌諱灰白方塊底。換成透明主體，頁面立刻高級起來。',
            list: [
              '透明 PNG 直接拖進投影片，背景隨母片走。',
              '陰影用頁面自帶效果，別燒進圖裡。',
              '推薦匯出：透明 PNG，體積用 WebP 兜底。',
            ],
          },
        ],
      },
    },
  },

  // a6 — Format convert
  {
    id: 'a6', slug: 'format-convert', category: 'format', accent: 'amber', emoji: '🖼️', date: '2026-03-12', readingMinutes: 7,
    t: {
      'zh-CN': {
        title: 'PNG、JPG、WebP 到底怎么选？',
        excerpt: '一张图三种格式，质量、透明、体积各有权衡。这篇讲清取舍，并告诉你 SmartCut 转换器怎么用最顺。',
        sections: [
          {
            heading: 'PNG：无损与透明之王',
            body: 'PNG 采用无损压缩，且原生支持 Alpha 透明通道。只要你需要抠图后的透明边缘，它几乎是无可替代的选择。',
            list: [
              '优点：无损、支持透明、所有软件都认。',
              '缺点：体积偏大，照片类内容不划算。',
              '适用：Logo、贴纸、需要二次合成的图。',
            ],
            quote: '要透明，先想到 PNG。',
          },
          {
            heading: 'JPG：照片的体积杀手',
            body: 'JPG 是有损压缩，专吃颜色和渐变，对照片极其友好，但一旦有透明区域会被强行填白。',
            list: [
              '优点：体积小，照片压得狠又不显糊。',
              '缺点：有损、不支持透明、反复存会劣化。',
              '适用：摄影作品、社媒大图、不需要透明的照片。',
            ],
          },
          {
            heading: 'WebP：新一代的均衡选手',
            body: 'WebP 同时支持有损/无损与透明，体积往往比 JPG 还小。它是现代网页的默认推荐，只是老系统兼容性要留意。',
            list: [
              '优点：体积小、支持透明、质量可调。',
              '缺点：个别老旧软件打不开。',
              '适用：网页配图、需要透明又想省流量的场景。',
            ],
            quote: '又要小又要透明，WebP 兜底。',
          },
          {
            heading: '什么时候该用哪种',
            body: '一句话判断法：要透明选 PNG/WebP，纯照片上架选 JPG，网页又要透明又省流量选 WebP。',
            list: [
              '透明 + 通用：PNG。',
              '透明 + 省流量：WebP。',
              '纯照片 + 最小体积：JPG。',
            ],
          },
          {
            heading: '用 SmartCut 转换器走通批量',
            body: 'SmartCut 不只抠图，也内置格式转换。配合批量思路，你可以一次性产出多份不同格式的成品。',
            list: [
              '先抠图得到透明 PNG，再按需转 JPG/WebP。',
              '网页配图统一转 WebP，省下一半流量。',
              '导出前先预览，确认透明与清晰度再下载。',
            ],
            quote: '转换器不是附属品，是工作流的一环。',
          },
        ],
      },
      en: {
        title: 'PNG, JPG, or WebP — Which Should You Pick?',
        excerpt: 'One image, three formats, each trading off quality, transparency, and size. This post breaks down the trade-offs and how to use SmartCut\'s converter best.',
        sections: [
          {
            heading: 'PNG: king of lossless and transparency',
            body: 'PNG uses lossless compression and natively supports an Alpha transparency channel. Whenever you need a transparent edge after cutout, it is nearly irreplaceable.',
            list: [
              'Pros: lossless, transparent, recognized by every app.',
              'Cons: larger size, wasteful for photos.',
              'Use for: logos, stickers, images needing recompositing.',
            ],
            quote: 'Need transparency? Think PNG first.',
          },
          {
            heading: 'JPG: the photo size killer',
            body: 'JPG is lossy compression built for color and gradients; it is great for photos but forces any transparent area to white.',
            list: [
              'Pros: small, crushes photos without looking blurry.',
              'Cons: lossy, no transparency, degrades on re-save.',
              'Use for: photography, big social images, opaque photos.',
            ],
          },
          {
            heading: 'WebP: the balanced modern pick',
            body: 'WebP supports both lossy/lossless and transparency, and is often smaller than JPG. It is the default recommendation for modern web, though watch legacy compatibility.',
            list: [
              'Pros: small, transparent, adjustable quality.',
              'Cons: a few legacy apps cannot open it.',
              'Use for: web imagery, transparent yet lightweight needs.',
            ],
            quote: 'Small and transparent? WebP has your back.',
          },
          {
            heading: 'When to use which',
            body: 'A one-liner: pick PNG/WebP for transparency, JPG for plain photos, WebP for web when you want both transparent and light.',
            list: [
              'Transparent + universal: PNG.',
              'Transparent + light: WebP.',
              'Plain photo + smallest: JPG.',
            ],
          },
          {
            heading: 'Batch workflow with SmartCut\'s converter',
            body: 'SmartCut does more than cutout; it ships a format converter. With a batch mindset, you can produce several format variants in one go.',
            list: [
              'Cut out to a transparent PNG first, then convert to JPG/WebP as needed.',
              'Convert web images to WebP uniformly to halve traffic.',
              'Preview before export to confirm transparency and sharpness.',
            ],
            quote: 'The converter is not an add-on; it is part of the workflow.',
          },
        ],
      },
      ja: {
        title: 'PNG・JPG・WebP、どう選ぶ？',
        excerpt: '1 枚の画像、3 つの形式、品質・透過・容量がそれぞれトレードオフ。その秤と SmartCut 変換の最善の使い方を解説。',
        sections: [
          {
            heading: 'PNG：無劣化と透過の王',
            body: 'PNG は無劣化圧縮で、Alpha 透過チャンネルをそのまま支えます。切り抜き後の透過縁が要るなら、ほぼ代えがたい選択です。',
            list: [
              '長所：無劣化、透過可、すべてのソフトが認識。',
              '短所：容量がやや大きく、写真には不経済。',
              '向き：ロゴ、ステッカー、再合成が要る図。',
            ],
            quote: '透過が要るなら、まず PNG を。',
          },
          {
            heading: 'JPG：写真の容量殺し',
            body: 'JPG は色とグラデーション向けの劣化圧縮。写真には極めて強い反面、透過領域は白で埋められます。',
            list: [
              '長所：容量小、写真を荒さなく圧縮。',
              '短所：劣化、透過不可、再保存で劣化。',
              '向き：写真、SNS 大図、透過不要の写真。',
            ],
          },
          {
            heading: 'WebP：新世代のバランサー',
            body: 'WebP は劣化/無劣化と透過を両立し、容量は JPG より小さいことも。近代ウェブの既定推奨ですが、古い環境の互換に注意。',
            list: [
              '長所：容量小、透過可、品質可调。',
              '短所：古い一部ソフトは開けない。',
              '向き：ウェブ図版、透過かつ軽量な要望。',
            ],
            quote: '小さくて透過も？ WebP が受け持ちます。',
          },
          {
            heading: 'いつどれを使うか',
            body: '一言で：透過なら PNG/WebP、純写真は JPG、ウェブで透過かつ軽いなら WebP。',
            list: [
              '透過＋汎用：PNG。',
              '透過＋軽量：WebP。',
              '純写真＋最小：JPG。',
            ],
          },
          {
            heading: 'SmartCut 変換でバッチを通す',
            body: 'SmartCut は切り抜きだけでなく変換も内蔵。バッチの考え方と合わせれば、一度に複数形式の成果を生めます。',
            list: [
              'まず透過 PNG を切り抜き、必要に応じ JPG/WebP へ。',
              'ウェブ図版は一括で WebP に、トラフィック半減。',
              '書き出し前にプレビューし、透過と鮮明さを確認。',
            ],
            quote: '変換はおまけではなく、ワークフローの一部です。',
          },
        ],
      },
      ko: {
        title: 'PNG·JPG·WebP, 무엇을 골라야 할까?',
        excerpt: '이미지 하나에 형식 셋, 각각 품질·투명·용량을 저울질합니다. 그 trade-off와 SmartCut 변환기 최선의 쓰임을 정리합니다.',
        sections: [
          {
            heading: 'PNG: 무손실과 투명의 왕',
            body: 'PNG는 무손실 압축이며 Alpha 투명 채널을 그대로 지원합니다. 컷아웃 후 투명 가장자리가 필요하면 거의 대체 불가입니다.',
            list: [
              '장점: 무손실, 투명, 모든 앱 인식.',
              '단점: 용량 큼, 사진엔 비경제적.',
              '용도: 로고, 스티커, 재합성 필요 이미지.',
            ],
            quote: '투명이 필요하면, 먼저 PNG를.',
          },
          {
            heading: 'JPG: 사진 용량 킬러',
            body: 'JPG는 색과 그라데이션용 손실 압축입니다. 사진엔 아주 강하지만 투명 영역은 흰색으로 강제 채워집니다.',
            list: [
              '장점: 용량 작음, 사진을 흐리지 않게 압축.',
              '단점: 손실, 투명 없음, 재저장 시 열화.',
              '용도: 사진, SNS 대형, 불투명 사진.',
            ],
          },
          {
            heading: 'WebP: 새 시대의 밸런서',
            body: 'WebP는 손실/무손실과 투명을 모두 지원하며 용량은 JPG보다 작을 때도 많습니다. 현대 웹의 기본 추천이지만 오래된 호환에 주의.',
            list: [
              '장점: 용량 작음, 투명, 품질 조절 가능.',
              '단점: 일부 구형 앱은 열지 못함.',
              '용도: 웹 도해, 투명하면서 가벼운 needs.',
            ],
            quote: '작고 투명까지? WebP가 받쳐줍니다.',
          },
          {
            heading: '언제 무엇을 쓸까',
            body: '한 줄 판별: 투명은 PNG/WebP, 순수 사진은 JPG, 웹에서 투명+가벼움은 WebP.',
            list: [
              '투명＋범용: PNG.',
              '투명＋가벼움: WebP.',
              '순수 사진＋최소: JPG.',
            ],
          },
          {
            heading: 'SmartCut 변환기로 일괄 처리',
            body: 'SmartCut은 컷아웃만 하는 게 아니라 변환도 내장입니다. 배치 사고와 섞으면 한 번에 여러 형식 결과를 냅니다.',
            list: [
              '먼저 투명 PNG로 컷아웃, 필요하면 JPG/WebP로 변환.',
              '웹 도해는 일괄 WebP로, 트래픽 절반 감축.',
              '내보내기 전 미리보기로 투명과 선명함 확인.',
            ],
            quote: '변환기는 부속품이 아니라 워크플로의 한 부분입니다.',
          },
        ],
      },
      'zh-TW': {
        title: 'PNG、JPG、WebP 到底怎麼選？',
        excerpt: '一張圖三種格式，品質、透明、體積各有權衡。這篇講清取捨，並告訴你 SmartCut 轉換器怎麼用最順。',
        sections: [
          {
            heading: 'PNG：無損與透明之王',
            body: 'PNG 採用無損壓縮，且原生支援 Alpha 透明通道。只要你需要摳圖後的透明邊緣，它幾乎是無可替代的選擇。',
            list: [
              '優點：無損、支援透明、所有軟體都認。',
              '缺點：體積偏大，照片類內容不划算。',
              '適用：Logo、貼紙、需要二次合成的圖。',
            ],
            quote: '要透明，先想到 PNG。',
          },
          {
            heading: 'JPG：照片的體積殺手',
            body: 'JPG 是有損壓縮，專吃顏色和漸層，對照片極其友好，但一旦有透明區域會被強行填白。',
            list: [
              '優點：體積小，照片壓得狠又不顯糊。',
              '缺點：有損、不支援透明、反覆存會劣化。',
              '適用：攝影作品、社群大圖、不需要透明的照片。',
            ],
          },
          {
            heading: 'WebP：新世代的均衡選手',
            body: 'WebP 同時支援有損/無損與透明，體積往往比 JPG 還小。它是現代網頁的預設推薦，只是老系統相容性要留意。',
            list: [
              '優點：體積小、支援透明、品質可調。',
              '缺點：個別老舊軟體打不開。',
              '適用：網頁配圖、需要透明又想省流量的場景。',
            ],
            quote: '又要小又要透明，WebP 兜底。',
          },
          {
            heading: '什麼時候該用哪種',
            body: '一句話判斷法：要透明選 PNG/WebP，純照片上架選 JPG，網頁又要透明又省流量選 WebP。',
            list: [
              '透明 + 通用：PNG。',
              '透明 + 省流量：WebP。',
              '純照片 + 最小體積：JPG。',
            ],
          },
          {
            heading: '用 SmartCut 轉換器走通批次',
            body: 'SmartCut 不只摳圖，也內建格式轉換。配合批次思路，你可以一次性產出多份不同格式的成品。',
            list: [
              '先摳圖得到透明 PNG，再依需轉 JPG/WebP。',
              '網頁配圖統一轉 WebP，省下一半流量。',
              '匯出前先預覽，確認透明與清晰度再下載。',
            ],
            quote: '轉換器不是附屬品，是工作流的一環。',
          },
        ],
      },
    },
  },
]
