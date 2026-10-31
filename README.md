# seaotterms-nuxt4

> [!NOTE]
> 目前為 V3 版本。也可以前往 [V2 分支](https://github.com/peter910820/seaotterms-nuxt4/tree/v2) 或 [V1 分支](https://github.com/peter910820/seaotterms-nuxt4/tree/v1) 查看先前版本。

## V3 重要改動

- **Nuxt 升級**：從 Nuxt 4.2.1 升級至 4.6.3，並更新相關套件。
- **Node.js 升級**：建置與部署工作流程從 Node.js 22 改用 24.22.1。
- **版面與主題**：重新設計共用版型、網站導覽與個人資料側欄，新增深色與淺色主題，並保留 V1、V2 主題。

## 架構概要

Nuxt（SSR）前端，透過 `runtimeConfig` 讀取設定；私有設定走 server 端 BFF（`server/`），公開設定以 `NUXT_PUBLIC_*` 注入。環境變數在**執行時**覆蓋，不需在 build 時寫死。

## 建置

### 需求

- Node.js `^22.22.3`、`^24.15.0` 或 `>=26.0.0`（CI 使用 24.22.1）
- Yarn

### 開發

```bash

yarn install

cp .env.example .env   # 填入本地值

yarn dev

```

### 正式建置

建置**不依賴** `.env`，CI / 本機直接打包即可：

```bash

yarn install --frozen-lockfile
yarn build
```

產物在 `.output/`。將整個 `.output` 目錄送到目標伺服器即可。

### 目標伺服器啟動

在 `.output` 目錄旁（或與啟動腳本約定的路徑）放置 `.env`，再啟動 Nitro server。

```bash

set -a && source .env && set +a

node server/index.mjs

```

### 環境變數

對應 `.env.example`，啟動前注入即可（build 時不必帶）：

| 變數                        | 說明                |
| --------------------------- | ------------------- |
| `NITRO_HOST` / `NITRO_PORT` | 監聽位址與埠        |
| `NUXT_PUBLIC_API_URL`       | 前端呼叫的 API base |
| `NUXT_PUBLIC_SITE_URL`      | 網站 URL（SEO 等）  |
| `NUXT_PUBLIC_ROOT_DOMAIN`   | Cookie domain       |
| `NUXT_KUROHELPER_API_URL`   | server 端上游 API   |
| `NUXT_KUROHELPER_API_TOKEN` | 上游 API token      |

## 注意事項:

- 目前只要有API交互，就必須處理回傳的userInfo

- SSR階段不讓他進行任何userinfo的獲取，將這部分完全交給CSR

- 如果有頁面是非公開頁面(是需要登入的)，那就讓該頁面資料的useeFetch增加lazy: true，讓資料獲取在CSR階段才執行

- 這樣可以避免SSR階段拿不到資料，CSR也不會重新發送請求的狀況

- 目前 _Profile_ 因為SSR有奇怪的行為導致使用者大頭照渲染不出來，現在是將該元件用 _ClientOnly_ 的方式禁用(該元件的內容也不應該被SSR)
