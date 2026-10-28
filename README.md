# seaotterms-nuxt4

> [!NOTE]
> 目前為 V2 版本。也可以前往 [V1 分支](https://github.com/peter910820/seaotterms-nuxt4/tree/v1) 查看先前版本。

## V2 主要更新:

- **框架與介面**：Nuxt 從 3 升級至 4，介面由 Materialize CSS 改用 Vuetify 3，並重新設計導覽列、表單及頁面元件。
- **主題與互動**：新增淺色與深色主題切換，並以 Cookie 記住選擇；登入改為彈出視窗，操作訊息與確認提示也改用共用元件。
- **待辦事項**：個人待辦路徑由 `/todolists` 改為 `/todos`，個人與系統待辦可在頁面內透過彈窗建立主題，不再使用原本的獨立建立主題頁面。
- **遊戲頁面範圍**：保留個人遊戲列表，但移除 V1 中的品牌與遊戲新增、編輯及操作頁面。
- **設定與部署**：新增 server 端 BFF，將 Kurohelper 上游 API 的網址與 token 留在伺服器；設定改由執行時環境變數注入，並新增建置檢查與部署工作流程。

## 架構概要

Nuxt（SSR）前端，透過 `runtimeConfig` 讀取設定；私有設定走 server 端 BFF（`server/`），公開設定以 `NUXT_PUBLIC_*` 注入。環境變數在**執行時**覆蓋，不需在 build 時寫死。

## 建置

### 需求

- Node.js 22+
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

| 變數 | 說明 |
|------|------|
| `NITRO_HOST` / `NITRO_PORT` | 監聽位址與埠 |
| `NUXT_PUBLIC_API_URL` | 前端呼叫的 API base |
| `NUXT_PUBLIC_SITE_URL` | 網站 URL（SEO 等） |
| `NUXT_PUBLIC_ROOT_DOMAIN` | Cookie domain |
| `NUXT_KUROHELPER_API_URL` | server 端上游 API |
| `NUXT_KUROHELPER_API_TOKEN` | 上游 API token |

## 注意事項:

- 目前只要有API交互，就必須處理回傳的userInfo

- SSR階段不讓他進行任何userinfo的獲取，將這部分完全交給CSR

- 如果有頁面是非公開頁面(是需要登入的)，那就讓該頁面資料的useeFetch增加lazy: true，讓資料獲取在CSR階段才執行

- 這樣可以避免SSR階段拿不到資料，CSR也不會重新發送請求的狀況

- 目前 _Profile_ 因為SSR有奇怪的行為導致使用者大頭照渲染不出來，現在是將該元件用 _ClientOnly_ 的方式禁用(反正該元件的內容也不應該被SSR)
