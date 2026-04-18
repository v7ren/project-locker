export type AppLocale = "en" | "zh-TW";

export const defaultLocale: AppLocale = "zh-TW";

export const localeStorageKey = "projectmanagement-locale";

/** Flat message keys — both locales must define every key. */
export type MessageKey =
  | "common.projects"
  | "common.dashboard"
  | "common.docs"
  | "common.home"
  | "common.documents"
  | "common.allProjects"
  | "common.browseDocs"
  | "common.createProject"
  | "common.cancel"
  | "common.create"
  | "common.creating"
  | "common.raw"
  | "common.saved"
  | "common.saveShortcut"
  | "common.unsavedChanges"
  | "common.saving"
  | "common.langEn"
  | "common.langZhTw"
  | "common.more"
  | "mdViewer.view"
  | "mdViewer.split"
  | "mdViewer.edit"
  | "mdViewer.layoutAria"
  | "mdViewer.docCardAria"
  | "mdViewer.saveFailed"
  | "theme.system"
  | "theme.light"
  | "theme.dark"
  | "theme.cycleTitle"
  | "home.title"
  | "home.subtitle"
  | "home.empty"
  | "home.dashboard"
  | "createProject.cta"
  | "createProject.title"
  | "createProject.subtitle"
  | "createProject.nameLabel"
  | "createProject.placeholder"
  | "createProject.error"
  | "projectHome.subtitle"
  | "projectHome.openDashboard"
  | "projectHome.docs"
  | "projectHome.iframeTitle"
  | "dash.title"
  | "dash.subtitleIntro"
  | "dash.publicHomeLabel"
  | "dash.tabHome"
  | "dash.tabDocs"
  | "dash.homeFilesTitle"
  | "dash.homeFilesDesc"
  | "dash.customOnDisk"
  | "dash.customOnDiskLink"
  | "dash.customOnDiskSuffix"
  | "dash.docsSectionTitle"
  | "dash.docsSectionDesc"
  | "dash.deleteSectionTitle"
  | "dash.deleteSectionDesc"
  | "dash.deleteProject"
  | "dash.deleteProjectConfirm"
  | "dash.deletingProject"
  | "dash.deleteProjectFailed"
  | "docsPage.title"
  | "docsPage.subtitleLead"
  | "docsPage.subtitleTrail"
  | "docsPage.filterBanner"
  | "docsPage.showAll"
  | "explorer.noMatch"
  | "explorer.noProjects"
  | "explorer.manageDashboard"
  | "explorer.noDocs"
  | "kind.markdown"
  | "kind.pdf"
  | "kind.image"
  | "kind.html"
  | "kind.code"
  | "kind.other"
  | "upload.replaceTitle"
  | "upload.replaceDesc"
  | "upload.choose"
  | "upload.uploading"
  | "upload.failed"
  | "upload.savedAs"
  | "docPage.embedNote"
  | "docViewer.pdfHint"
  | "docViewer.htmlHint"
  | "docViewer.mdHint"
  | "docViewer.codeHint"
  | "docViewer.otherHint"
  | "docViewer.openFile"
  | "docsWs.pasteTitle"
  | "docsWs.pathLabel"
  | "docsWs.pathPlaceholder"
  | "docsWs.contentLabel"
  | "docsWs.saveMd"
  | "docsWs.saving"
  | "docsWs.uploadTitle"
  | "docsWs.uploadDesc"
  | "docsWs.chooseFile"
  | "docsWs.working"
  | "docsWs.reloadList"
  | "docsWs.publishedTitle"
  | "docsWs.publishedHelp"
  | "docsWs.noFiles"
  | "docsWs.pathUnderDocs"
  | "docsWs.save"
  | "docsWs.rawMd"
  | "docsWs.editPath"
  | "docsWs.delete"
  | "docsWs.openMd"
  | "docsWs.openViewer"
  | "docsWs.uploadFailed"
  | "docsWs.saveFailed"
  | "docsWs.deleteFailed"
  | "docsWs.renameFailed"
  | "docsWs.pathEmpty"
  | "docsWs.confirmDelete"
  | "docsWs.statusUploaded"
  | "docsWs.statusDeleted"
  | "docsWs.statusRenamed"
  | "docsWs.statusSavedMd"
  | "login.title"
  | "login.subtitle"
  | "login.emailLabel"
  | "login.emailPlaceholder"
  | "login.sendCode"
  | "login.sending"
  | "login.codeLabel"
  | "login.codePlaceholder"
  | "login.verify"
  | "login.verifying"
  | "login.sentHint"
  | "login.genericError"
  | "login.rateLimited"
  | "login.backToEmail"
  | "login.notConfigured"
  | "login.devChecklist"
  | "login.backHome"
  | "login.resendHintTesting"
  | "login.resendHintFrom"
  | "login.resendHintUnknown"
  | "auth.logout"
  | "publicShare.shareButton"
  | "publicShare.dialogTitle"
  | "publicShare.dialogDescription"
  | "publicShare.enableHint"
  | "publicShare.enableButton"
  | "publicShare.revokeButton"
  | "publicShare.closeButton"
  | "publicShare.copyLink"
  | "publicShare.copied"
  | "publicShare.copyFailed"
  | "publicShare.toggleFailed"
  | "publicShare.nowPublic"
  | "publicShare.nowPrivate"
  | "publicShare.loading"
  | "publicShare.readOnlyBadge"
  | "publicShare.publicBadge"
  | "viewerUi.hideAll"
  | "viewerUi.showAll"
  | "viewerUi.viewModeToolbar"
  | "viewerUi.standardLayout"
  | "viewerUi.focusLayout";

const en: Record<MessageKey, string> = {
  "common.projects": "Projects",
  "common.dashboard": "Dashboard",
  "common.docs": "Docs",
  "common.home": "Home",
  "common.documents": "Documents",
  "common.allProjects": "All projects",
  "common.browseDocs": "Browse docs",
  "common.createProject": "Create project",
  "common.cancel": "Cancel",
  "common.create": "Create",
  "common.creating": "Creating…",
  "common.raw": "Raw",
  "common.saved": "Saved",
  "common.saveShortcut": "⌘S / Ctrl+S to save",
  "common.unsavedChanges": "Unsaved changes",
  "common.saving": "Saving…",
  "common.langEn": "EN",
  "common.langZhTw": "繁中",
  "common.more": "More",
  "mdViewer.view": "View",
  "mdViewer.split": "Split",
  "mdViewer.edit": "Edit",
  "mdViewer.layoutAria": "Editor layout",
  "mdViewer.docCardAria": "Document",
  "mdViewer.saveFailed": "Save failed",
  "theme.system": "System",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.cycleTitle": "Theme: {{label}}. Click to cycle system → light → dark.",
  "home.title": "Projects",
  "home.subtitle":
    "Each project has a public home, docs URLs, and a {{dash}} hub to manage uploads. Files are served like {{docExample}}.",
  "home.empty":
    "No projects yet. Use {{create}} to add your first one.",
  "home.dashboard": "Dashboard",
  "createProject.cta": "Create project",
  "createProject.title": "New project",
  "createProject.subtitle":
    "Choose a display name. The URL uses a slug derived from it (for example {{example}}).",
  "createProject.nameLabel": "Project name",
  "createProject.placeholder": "e.g. Acme roadmap",
  "createProject.error": "Could not create project",
  "projectHome.subtitle":
    "Add {{html}} or {{tsx}} from the dashboard for a full-page site here, or publish docs under {{docs}}.",
  "projectHome.openDashboard": "Open dashboard",
  "projectHome.docs": "Docs",
  "projectHome.iframeTitle": "Custom project home",
  "dash.title": "Dashboard",
  "dash.subtitleIntro":
    "Manage the public home page and docs for {{name}}.",
  "dash.publicHomeLabel": "Public home:",
  "dash.tabHome": "Home page",
  "dash.tabDocs": "Docs",
  "dash.homeFilesTitle": "Home page files",
  "dash.homeFilesDesc":
    "Upload HTML (sandboxed full-page iframe) or TSX (full-page live preview on the project home URL). The home route is a full-bleed replacement when a file is present.",
  "dash.customOnDisk": "{{file}} is on disk — open",
  "dash.customOnDiskLink": "public home",
  "dash.customOnDiskSuffix": "to see it.",
  "dash.docsSectionTitle": "Docs",
  "dash.docsSectionDesc": "Files are served at {{path}}.",
  "dash.deleteSectionTitle": "Delete project",
  "dash.deleteSectionDesc":
    "Remove this project from disk, including all docs and home uploads. This cannot be undone.",
  "dash.deleteProject": "Delete project",
  "dash.deleteProjectConfirm":
    "Delete “{{name}}” (/{{slug}}) and all of its files? This cannot be undone.",
  "dash.deletingProject": "Deleting…",
  "dash.deleteProjectFailed": "Could not delete project",
  "docsPage.title": "Documents",
  "docsPage.subtitleLead":
    "Browse files across projects. Each tile opens the public doc URL. Add or remove files from each project’s",
  "docsPage.subtitleTrail": ".",
  "docsPage.filterBanner": "Showing documents for {{name}}",
  "docsPage.showAll": "Show all projects",
  "explorer.noMatch": "No project matches that filter, or it has no files yet.",
  "explorer.noProjects":
    "No projects yet. Create one from the home page, then add files from its dashboard.",
  "explorer.manageDashboard": "Manage in dashboard",
  "explorer.noDocs": "No documents in this project yet.",
  "kind.markdown": "Markdown",
  "kind.pdf": "PDF",
  "kind.image": "Image",
  "kind.html": "HTML",
  "kind.code": "Code",
  "kind.other": "Other",
  "upload.replaceTitle": "Replace home page",
  "upload.replaceDesc":
    "Upload HTML for a sandboxed iframe preview, or TSX/JSX for an in-browser live preview (react-live: React + lucide-react only; not executed on the server).",
  "upload.choose": "Choose .html or .tsx file",
  "upload.uploading": "Uploading…",
  "upload.failed": "Upload failed",
  "upload.savedAs": "Saved as {{name}}.",
  "docPage.embedNote": "(embeds that URL below)",
  "docViewer.pdfHint":
    "Preview loads from the published docs URL (same origin). If your browser console shows failed requests to another host or port (for example an old dev server), those usually come from link annotations inside the PDF, not from this app.",
  "docViewer.htmlHint": "Sandboxed preview of uploaded HTML.",
  "docViewer.mdHint": "Markdown should open in the editor workspace.",
  "docViewer.codeHint": "Text preview in a sandboxed frame. Use Raw for download.",
  "docViewer.otherHint":
    "No built-in preview for this file type. Open the raw URL or download.",
  "docViewer.openFile": "Open file",
  "docsWs.pasteTitle": "Paste Markdown",
  "docsWs.pathLabel": "File path (under docs)",
  "docsWs.pathPlaceholder": "summary.md or notes/q1.md",
  "docsWs.contentLabel": "Content",
  "docsWs.saveMd": "Save Markdown",
  "docsWs.saving": "Saving…",
  "docsWs.uploadTitle": "Upload files",
  "docsWs.uploadDesc":
    "PDFs, images, or any other assets. Filenames keep their path under {{path}}",
  "docsWs.chooseFile": "Choose file",
  "docsWs.working": "Working…",
  "docsWs.reloadList": "Reload list from disk",
  "docsWs.publishedTitle": "Published paths",
  "docsWs.publishedHelp":
    "Names use your Unicode filenames. Click a title to open: Markdown in the split editor with live preview, other types in the in-app viewer (breadcrumbs + nav). Append {{raw}} on the {{docs}} URL for raw text. Use {{edit}} to move or rename under {{docsFolder}}.",
  "docsWs.noFiles": "No files yet — upload or paste Markdown above.",
  "docsWs.pathUnderDocs": "Path under docs",
  "docsWs.save": "Save",
  "docsWs.rawMd": "Raw .md",
  "docsWs.editPath": "Edit path",
  "docsWs.delete": "Delete",
  "docsWs.openMd": "Open in Markdown editor",
  "docsWs.openViewer": "Open in viewer",
  "docsWs.uploadFailed": "Upload failed",
  "docsWs.saveFailed": "Save failed",
  "docsWs.deleteFailed": "Delete failed",
  "docsWs.renameFailed": "Rename failed",
  "docsWs.pathEmpty": "Path cannot be empty",
  "docsWs.confirmDelete":
    "Delete “{{path}}” from this project? This cannot be undone.",
  "docsWs.statusUploaded": "Uploaded {{path}}.",
  "docsWs.statusDeleted": "Deleted {{path}}.",
  "docsWs.statusRenamed": "Renamed to {{path}}.",
  "docsWs.statusSavedMd": "Saved {{path}}.",
  "login.title": "Sign in",
  "login.subtitle": "We will email you a one-time code.",
  "login.emailLabel": "Email",
  "login.emailPlaceholder": "you@example.com",
  "login.sendCode": "Email me a code",
  "login.sending": "Sending…",
  "login.codeLabel": "6-digit code",
  "login.codePlaceholder": "000000",
  "login.verify": "Verify and continue",
  "login.verifying": "Verifying…",
  "login.sentHint": "Check your inbox for {{email}}.",
  "login.genericError": "Something went wrong. Try again.",
  "login.rateLimited": "Please wait {{sec}} seconds before requesting another code.",
  "login.backToEmail": "Use a different email",
  "login.notConfigured":
    "Sign-in is not configured on this deployment (missing server environment variables).",
  "login.devChecklist": "Local dev — fix these in `.env.local`, then restart `npm run dev`:",
  "login.backHome": "Back to projects",
  "login.resendHintTesting":
    "Resend test sender (e.g. onboarding@resend.dev) can only deliver OTP to your Resend-account email. To let other allowlisted addresses receive mail: verify your domain in Resend, set RESEND_FROM to an address on that domain, then try again.",
  "login.resendHintFrom":
    "The From address is not accepted by Resend. Use an address on a domain you have verified in the Resend dashboard (RESEND_FROM).",
  "login.resendHintUnknown":
    "The email provider rejected this send. Check server logs, RESEND_API_KEY, and RESEND_FROM; with a verified domain you can deliver to any allowlisted address.",
  "auth.logout": "Log out",
  "publicShare.shareButton": "Share",
  "publicShare.dialogTitle": "Public link",
  "publicShare.dialogDescription":
    "Anyone with the link can open this page without signing in. Turn sharing off anytime.",
  "publicShare.enableHint": "Sharing is off. Enable to get a copyable public URL.",
  "publicShare.enableButton": "Enable public link",
  "publicShare.revokeButton": "Turn off public link",
  "publicShare.closeButton": "Close",
  "publicShare.copyLink": "Copy public link",
  "publicShare.copied": "Link copied.",
  "publicShare.copyFailed": "Could not copy.",
  "publicShare.toggleFailed": "Could not update sharing.",
  "publicShare.nowPublic": "Public link is on.",
  "publicShare.nowPrivate": "Public link is off.",
  "publicShare.loading": "Loading…",
  "publicShare.readOnlyBadge": "Public view (read-only)",
  "publicShare.publicBadge": "Public",
  "viewerUi.hideAll": "Hide floating UI",
  "viewerUi.showAll": "Show floating UI",
  "viewerUi.viewModeToolbar": "View mode",
  "viewerUi.standardLayout": "Standard — toolbars, dock, and breadcrumbs",
  "viewerUi.focusLayout": "Focus — content only",
};

const zhTW: Record<MessageKey, string> = {
  "common.projects": "專案",
  "common.dashboard": "控制台",
  "common.docs": "文件",
  "common.home": "首頁",
  "common.documents": "文件庫",
  "common.allProjects": "所有專案",
  "common.browseDocs": "瀏覽文件",
  "common.createProject": "建立專案",
  "common.cancel": "取消",
  "common.create": "建立",
  "common.creating": "建立中…",
  "common.raw": "開啟原始 /docs 網址",
  "common.saved": "已儲存",
  "common.saveShortcut": "⌘S / Ctrl+S 儲存",
  "common.unsavedChanges": "有未儲存的變更",
  "common.saving": "儲存中…",
  "common.langEn": "EN",
  "common.langZhTw": "繁中",
  "common.more": "更多",
  "mdViewer.view": "檢視",
  "mdViewer.split": "分割",
  "mdViewer.edit": "編輯",
  "mdViewer.layoutAria": "編輯器版面",
  "mdViewer.docCardAria": "文件",
  "mdViewer.saveFailed": "儲存失敗",
  "theme.system": "跟隨系統",
  "theme.light": "淺色",
  "theme.dark": "深色",
  "theme.cycleTitle": "主題：{{label}}。點一下切換：系統 → 淺色 → 深色。",
  "home.title": "專案",
  "home.subtitle":
    "每個專案都有公開首頁、文件網址，以及 {{dash}} 後台可管理上傳。檔案網址類似 {{docExample}}。",
  "home.empty": "尚無專案。請點 {{create}} 建立第一個。",
  "home.dashboard": "控制台",
  "createProject.cta": "建立專案",
  "createProject.title": "新專案",
  "createProject.subtitle":
    "請輸入顯示名稱，網址會依此產生 slug（例如 {{example}}）。",
  "createProject.nameLabel": "專案名稱",
  "createProject.placeholder": "例如：產品路線圖",
  "createProject.error": "無法建立專案",
  "projectHome.subtitle":
    "在控制台上傳 {{html}} 或 {{tsx}} 可在此顯示整頁網站，或將文件發布在 {{docs}}。",
  "projectHome.openDashboard": "開啟控制台",
  "projectHome.docs": "文件",
  "projectHome.iframeTitle": "自訂專案首頁",
  "dash.title": "控制台",
  "dash.subtitleIntro": "管理 {{name}} 的公開首頁與文件。",
  "dash.publicHomeLabel": "公開首頁：",
  "dash.tabHome": "首頁檔案",
  "dash.tabDocs": "文件",
  "dash.homeFilesTitle": "首頁檔案",
  "dash.homeFilesDesc":
    "可上傳 HTML（沙箱 iframe 全頁預覽）或 TSX（在專案首頁網址即時預覽）。若有檔案，首頁路由會整頁替換為該內容。",
  "dash.customOnDisk": "磁碟上已有 {{file}} — 請開啟",
  "dash.customOnDiskLink": "公開首頁",
  "dash.customOnDiskSuffix": "檢視。",
  "dash.docsSectionTitle": "文件",
  "dash.docsSectionDesc": "檔案網址為 {{path}}。",
  "dash.deleteSectionTitle": "刪除專案",
  "dash.deleteSectionDesc": "從磁碟移除此專案，包含所有文件與首頁上傳。此動作無法復原。",
  "dash.deleteProject": "刪除專案",
  "dash.deleteProjectConfirm":
    "要刪除「{{name}}」（/{{slug}}）及其所有檔案嗎？此動作無法復原。",
  "dash.deletingProject": "刪除中…",
  "dash.deleteProjectFailed": "無法刪除專案",
  "docsPage.title": "文件庫",
  "docsPage.subtitleLead": "瀏覽各專案檔案。每個圖磚會開啟公開文件連結。新增或刪除檔案請到各專案的",
  "docsPage.subtitleTrail": "。",
  "docsPage.filterBanner": "顯示專案「{{name}}」的文件",
  "docsPage.showAll": "顯示所有專案",
  "explorer.noMatch": "沒有符合篩選的專案，或該專案尚無檔案。",
  "explorer.noProjects": "尚無專案。請先在首頁建立專案，再在控制台新增檔案。",
  "explorer.manageDashboard": "在控制台管理",
  "explorer.noDocs": "此專案尚無文件。",
  "kind.markdown": "Markdown",
  "kind.pdf": "PDF",
  "kind.image": "圖片",
  "kind.html": "HTML",
  "kind.code": "程式碼",
  "kind.other": "其他",
  "upload.replaceTitle": "取代首頁",
  "upload.replaceDesc":
    "上傳 HTML 以沙箱 iframe 預覽，或上傳 TSX/JSX 在瀏覽器內即時預覽（react-live：僅 React + lucide-react；不在伺服器執行）。",
  "upload.choose": "選擇 .html 或 .tsx 檔",
  "upload.uploading": "上傳中…",
  "upload.failed": "上傳失敗",
  "upload.savedAs": "已儲存為 {{name}}。",
  "docPage.embedNote": "（下方嵌入該網址）",
  "docViewer.pdfHint":
    "預覽來自公開文件網址（同源）。若開發者工具出現連到其他主機或埠（例如舊的本地開發網址）的失敗請求，多半是 PDF 內嵌連結註解造成，而非此應用程式。",
  "docViewer.htmlHint": "上傳 HTML 的沙箱預覽。",
  "docViewer.mdHint": "Markdown 應在編輯器工作區開啟。",
  "docViewer.codeHint": "沙箱 iframe 文字預覽。下載請用 Raw。",
  "docViewer.otherHint": "此檔案類型沒有內建預覽。請開啟原始網址或下載。",
  "docViewer.openFile": "開啟檔案",
  "docsWs.pasteTitle": "貼上 Markdown",
  "docsWs.pathLabel": "檔案路徑（於 docs 下）",
  "docsWs.pathPlaceholder": "summary.md 或 notes/q1.md",
  "docsWs.contentLabel": "內容",
  "docsWs.saveMd": "儲存 Markdown",
  "docsWs.saving": "儲存中…",
  "docsWs.uploadTitle": "上傳檔案",
  "docsWs.uploadDesc": "PDF、圖片或其他素材。檔名會保留在 {{path}} 之下",
  "docsWs.chooseFile": "選擇檔案",
  "docsWs.working": "處理中…",
  "docsWs.reloadList": "從磁碟重新載入清單",
  "docsWs.publishedTitle": "已發布路徑",
  "docsWs.publishedHelp":
    "檔名保留 Unicode。點標題開啟：Markdown 用分割編輯器與即時預覽，其他類型用內建檢視器（麵包屑＋導覽）。在 {{docs}} 網址後加 {{raw}} 可取得純文字。用「{{edit}}」在 {{docsFolder}} 下移動或重新命名。",
  "docsWs.noFiles": "尚無檔案 — 請上傳或貼上 Markdown。",
  "docsWs.pathUnderDocs": "docs 下的路徑",
  "docsWs.save": "儲存",
  "docsWs.rawMd": "原始 .md",
  "docsWs.editPath": "編輯路徑",
  "docsWs.delete": "刪除",
  "docsWs.openMd": "在 Markdown 編輯器開啟",
  "docsWs.openViewer": "在檢視器開啟",
  "docsWs.uploadFailed": "上傳失敗",
  "docsWs.saveFailed": "儲存失敗",
  "docsWs.deleteFailed": "刪除失敗",
  "docsWs.renameFailed": "重新命名失敗",
  "docsWs.pathEmpty": "路徑不可為空",
  "docsWs.confirmDelete": "要從此專案刪除「{{path}}」嗎？此動作無法復原。",
  "docsWs.statusUploaded": "已上傳 {{path}}。",
  "docsWs.statusDeleted": "已刪除 {{path}}。",
  "docsWs.statusRenamed": "已重新命名為 {{path}}。",
  "docsWs.statusSavedMd": "已儲存 {{path}}。",
  "login.title": "登入",
  "login.subtitle": "我們會寄送一次性驗證碼到你的信箱。",
  "login.emailLabel": "電子郵件",
  "login.emailPlaceholder": "you@example.com",
  "login.sendCode": "寄送驗證碼",
  "login.sending": "寄送中…",
  "login.codeLabel": "6 位數驗證碼",
  "login.codePlaceholder": "000000",
  "login.verify": "驗證並繼續",
  "login.verifying": "驗證中…",
  "login.sentHint": "請查看 {{email}} 的信件。",
  "login.genericError": "發生錯誤，請再試一次。",
  "login.rateLimited": "請等待 {{sec}} 秒後再索取驗證碼。",
  "login.backToEmail": "改用其他信箱",
  "login.notConfigured": "此部署尚未設定登入（缺少伺服器環境變數）。",
  "login.devChecklist": "本機開發：請在 `.env.local` 修正以下項目後重新執行 `npm run dev`：",
  "login.backHome": "返回專案列表",
  "login.resendHintTesting":
    "Resend 測試寄件者（例如 onboarding@resend.dev）通常只能把 OTP 寄到你 Resend 帳號所驗證的信箱。若要讓其他允許名單上的地址收信：請在 Resend 驗證你的網域、把 RESEND_FROM 設為該網域下的地址，然後再試一次。",
  "login.resendHintFrom":
    "寄件者地址未被 Resend 接受。請在 Resend 後台驗證網域後，使用該網域下的地址作為 RESEND_FROM。",
  "login.resendHintUnknown":
    "郵件服務拒絕寄出。請檢查伺服器紀錄、RESEND_API_KEY 與 RESEND_FROM；使用已驗證網域後，即可寄到允許名單上的任何地址。",
  "auth.logout": "登出",
  "publicShare.shareButton": "分享",
  "publicShare.dialogTitle": "公開連結",
  "publicShare.dialogDescription": "擁有連結者無需登入即可檢視此頁面。你可隨時關閉公開。",
  "publicShare.enableHint": "目前未公開。開啟後可取得可複製的公開網址。",
  "publicShare.enableButton": "開啟公開連結",
  "publicShare.revokeButton": "關閉公開連結",
  "publicShare.closeButton": "關閉",
  "publicShare.copyLink": "複製公開連結",
  "publicShare.copied": "已複製連結。",
  "publicShare.copyFailed": "無法複製。",
  "publicShare.toggleFailed": "無法更新分享設定。",
  "publicShare.nowPublic": "已開啟公開連結。",
  "publicShare.nowPrivate": "已關閉公開連結。",
  "publicShare.loading": "載入中…",
  "publicShare.readOnlyBadge": "公開檢視（唯讀）",
  "publicShare.publicBadge": "公開",
  "viewerUi.hideAll": "隱藏浮動介面",
  "viewerUi.showAll": "顯示浮動介面",
  "viewerUi.viewModeToolbar": "檢視模式",
  "viewerUi.standardLayout": "標準 — 工具列、快捷列與麵包屑",
  "viewerUi.focusLayout": "專注 — 僅內容",
};

export const messages: Record<AppLocale, Record<MessageKey, string>> = {
  en,
  "zh-TW": zhTW,
};

export function translate(
  locale: AppLocale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let out = messages[locale][key] ?? messages.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return out;
}
