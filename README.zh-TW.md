# 專案管理（Next.js）

以 **[Next.js](https://nextjs.org)** 建置的**自架式**應用，主要給**專案經理（PM）**與**小型產品／開發團隊**使用：把與專案相關的資料集中在一處，例如 **Markdown** 需求與會議紀錄、**PDF**（合約、一頁式摘要、架構圖 PDF），以及放在各專案 `docs/` 下的**其他檔案**（圖片、HTML 等，由文件檢視器處理）。每個專案有固定網址、方便上傳的**儀表板**、可選的**自訂首頁**（HTML 或 TSX，適合團隊入口頁），以及需要對外分享時的**選用公開連結**（免登入檢視特定文件或首頁）。

登入為選用：若設定驗證相關環境變數，介面與 API 會透過 **電子郵件 OTP**（[Resend](https://resend.com)）保護；未設定時則完全開放，適合本機或內部試用。

**英文完整說明（含技術細節對照）：** [README.md](./README.md)

---

## 適用對象

- **專案經理**：依專案／倡議整理需求、會議紀錄與 PDF 交付物。
- **小型開發團隊**（或設計＋工程小組）：共用 Markdown 說明、Runbook 與二進位／設計資產，以檔案系統為後端，不必另外架設完整 wiki 或雜亂的雲端資料夾結構。

---

## 功能概覽

- **專案列表** `/`：建立專案（名稱會轉成網址安全的 slug）、進入首頁或儀表板。
- **專案首頁** `/{slug}`：預設歡迎頁，或 `home/custom.html`（以 iframe 沙箱顯示整頁 HTML），或 `home/custom.tsx`（透過 `react-live`、Sucrase 即時預覽 React）。
- **儀表板** `/{slug}/dashboard`：自訂首頁／TSX 與 `docs/` 檔案樹分頁；上傳、重新命名、刪除等。
- **文件總覽** `/docs`：瀏覽所有專案的 `docs/`；可用 `?project={slug}` 篩選單一專案。
- **Markdown 與文件路由**：`/{slug}/md/...` 檢視 Markdown；`/{slug}/doc/...` 檢視 **PDF**、圖片、HTML 等由路由提供的檔案（另有對應的 **`/public/...`** 公開路由）。
- **介面語系**：**英文**與**繁體中文**（`zh-TW`），依 Cookie 與 `Accept-Language`（見 `src/lib/i18n/`）。
- **主題**：淺色／深色。

`src/app/layout.tsx` 的 metadata 將產品描述為：具穩定網址路徑的每專案首頁與文件。

---

## 架構摘要

| 層級 | 說明 |
|------|------|
| **Next.js App Router** | 伺服端讀取資料；編輯器、對話框、預覽等為客戶端元件。 |
| **檔案系統** | 資料來源：`data/projects/{slug}/`（可用 `PROJECT_DATA_ROOT` 覆寫）。 |
| **`src/middleware.ts`** | 選用登入導向、公開檢視路徑略過、若設定 `DOMAIN` 則協助 `/api/*` CORS。 |
| **`src/lib/projects.ts`** | `project.json`、`docs/`、`home/` 的讀寫；安全路徑解析（含 NFC／空白容錯的文件路徑）。 |
| **`src/lib/public-share.ts`** | `public-share.json`：哪些 `home`／`md/…`／`doc/…` 可在 `/{slug}/public/...` 匿名存取。 |

**沒有內建資料庫**；備份即為複製資料目錄。

---

## 磁碟目錄結構

預設根目錄：**`data/projects/`**（或環境變數 `PROJECT_DATA_ROOT`）。

```text
data/projects/
  {slug}/
    project.json          # { name, slug, createdAt }
    public-share.json     # 選用：{ "paths": ["home", "md/README.md", ...] }
    docs/                 # 由 doc／md 路由提供的檔案
    home/
      custom.html         # 選用：整頁 iframe 首頁
      custom.tsx          # 選用：即時 React 片段首頁
```

由本 app 建立的 slug 為小寫 `[a-z0-9-]+`。

---

## 網址對照

| 路徑 | 用途 |
|------|------|
| `/` | 專案列表、建立專案 |
| `/docs` | 跨專案文件瀏覽（`?project=` 篩選） |
| `/login` | 已設定驗證時的 OTP 登入 |
| `/{slug}` | 專案首頁 |
| `/{slug}/dashboard` | 管理 `home/*` 與 `docs/*` |
| `/{slug}/md/[[...path]]` | Markdown 檢視（開啟驗證時需登入） |
| `/{slug}/doc/[[...path]]` | 文件檢視（例如 **PDF**、圖片、HTML） |
| `/{slug}/public`、… | **公開**檢視（須列於 `public-share.json`） |

**API**（代表性子路徑）：

- `GET`／`POST /api/projects` — 列表／建立
- `DELETE /api/projects/{slug}` — 刪除整個專案目錄
- 其餘 `…/api/projects/{slug}/…` — 見 `src/app/api/projects/`
- `POST /api/auth/send-otp`、`verify-otp`、`logout` — 工作階段流程

---

## 驗證行為

僅在 **`getAuthEnvConfig()`** 成功時啟用（`src/lib/auth/config.ts`）：需 **`AUTH_SECRET`**（至少 16 字元）、非空的 **`AUTH_ALLOWED_EMAILS`**、**`RESEND_API_KEY`**、**`RESEND_FROM`**（或 **`AUTH_RESEND_FROM`**）。

啟用後：

- 未登入使用者會被導向 **`/login`**（可帶 `next=` 返回路徑），例外為：
  - **`/{slug}/public/...`**（slug 不可為保留字 `api`、`login`、`docs`），
  - **`/api/auth/send-otp`** 與 **`/api/auth/verify-otp`**。
- 其餘 **`/api/*`** 若無有效 session Cookie 則回 **401**。

**未**設定完整驗證時，不強制登入（利於本機沙盒）。

---

## 公開分享

透過應用內分享 UI 維護 **`public-share.json`**，可讓下列鍵在**不登入**情況下由 **`/public/...`** 提供：

- 例如 **`home`**、**`md/{相對於 docs 的路徑}`**、**`doc/{…}`**（詳見 `src/lib/public-share.ts`）。

僅 manifest 列出的鍵會在公開路由上提供。

---

## 本地開發

```bash
npm install
cp .env.example .env.local
# 編輯 .env.local — 見下表「環境變數」
npm run dev
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000)。

```bash
npm run build
npm run start
```

---

## 環境變數

將 **`.env.example`** 複製為 **`.env.local`**。請勿將 `.env.local` 提交版本庫。

| 變數 | 驗證是否必填 | 說明 |
|------|----------------|------|
| `AUTH_SECRET` | 是 | 工作階段簽章密鑰，**至少 16 字元**。 |
| `AUTH_ALLOWED_EMAILS` | 是 | 允許登入的信箱（逗號、`;` 或換行分隔）。 |
| `RESEND_API_KEY` | 是 | Resend API 金鑰，用於寄送 OTP。 |
| `RESEND_FROM` 或 `AUTH_RESEND_FROM` | 是 | 寄件者（須符合 Resend 已驗證網域；測試環境請遵守 Resend 測試寄件限制）。 |
| `DOMAIN` | 否 | 若設定，須與瀏覽器 **`Origin`** **完全一致**（含 `https://`、無結尾斜線），供 **`/api/*` CORS**（`src/lib/cors.ts`）。並納入 `next.config.ts` 的 `allowedDevOrigins` 解析。 |
| `PROJECT_DATA_ROOT` | 否 | 專案資料根目錄；預設 `./data/projects`。 |
| `AUTH_ALLOWLIST_MAX` | 否 | 僅信任允許清單前 N 筆信箱。 |
| `NEXT_ALLOWED_DEV_ORIGINS` | 否 | 開發時額外允許的來源（逗號分隔）。 |

---

## 指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發伺服器 |
| `npm run build` | 正式建置 |
| `npm run start` | 正式伺服器 |
| `npm run lint` | ESLint |

---

## 本倉庫的 Next.js

專案使用 **Next.js 16** 等版本，行為可能與舊教學不同。修改框架相關行為前，建議閱讀 `node_modules/next/dist/docs/` 內說明與棄用提示（見倉庫根目錄 **`AGENTS.md`**／**`CLAUDE.md`**）。

---

## 部署注意

- 正式環境設定與本機相同的驗證與 Resend 變數。
- **`DOMAIN`** 與實際網站 `Origin` 一致，以便依 Cookie／CORS 呼叫 API 的客戶端運作。
- 使用持久化磁碟或設定 **`PROJECT_DATA_ROOT`**，避免重啟後資料遺失。
- 平台細節可參考 [Next.js 部署說明](https://nextjs.org/docs/app/building-your-application/deploying)。

---

## 授權

`package.json` 中 `private: true` — 預設為個人或內部專案；若對外發布請自行新增授權條款檔案。
