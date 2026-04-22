# Phase 1 功能拆解表（含 Owner / Sprint / Priority）

> **估時雙版本**（與下列功能列相同，僅工時假設不同）：[`slow.md`](slow.md) 全表 FE+BE 合計 **500h**；[`fast.md`](fast.md) 合計 **420h**（各列 FE(h)/BE(h)/小計 為 slow 之 **84%**，比例一致）。

以下以 **2 位工程師** 的配置來拆：

- **工程師 A**：後端 / 架構 / 串接 / 核心商業邏輯
- **工程師 B**：前端 / 後台介面 / C 端流程 / 操作體驗

Sprint**6 個 Sprint** 規劃（每個 Sprint 約 2 週）：

- **Sprint 0**：需求確認 / 架構 / DB / 技術設計
- **Sprint 1**：Auth / RBAC / 基礎框架
- **Sprint 2**：訂單建立 / 預約規則 / 庫存防撞
- **Sprint 3**：合約 / 金流 / 發票
- **Sprint 4**：KYC / 後台作業 / 計費結算
- **Sprint 5**：IoT / 取還車 / 通知 / 收尾上線

---

## 欄位說明

| 欄位 | 說明 |
|---|---|
| 模組 | 功能模組 |
| 功能分類 | 子功能群 |
| 小功能 | 可切 ticket 的功能點 |
| FE | 前端 |
| BE | 後端 |
| 後台 | 是否含管理後台介面 |
| 串接 | 是否涉及第三方或硬體 |
| Priority | P0 / P1 / P2 |
| Owner | 建議主責工程師 |
| Sprint | 建議落點 |
| 備註 | 規則 / 補充 |

---

## 一、基礎架構 / Auth / RBAC

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| Platform | 專案初始化 | 專案骨架建立 | Y | Y | Y | N | P0 | A | Sprint 0 | Repo / env / deploy 基礎 |
| Platform | DB 設計 | DB Schema 與 migration | N | Y | N | N | P0 | A | Sprint 0 | 預留 tenant_id / credit_score / license_expiry_date |
| Platform | 架構設計 | Payment Adapter 介面 | N | Y | N | N | P0 | A | Sprint 0 | 未來可替換金流商 |
| Platform | 架構設計 | IoT Adapter 介面 | N | Y | N | N | P0 | A | Sprint 0 | 未來可替換硬體商 |
| Platform | 架構設計 | Notification Handler 架構 | N | Y | N | N | P0 | A | Sprint 0 | SMS / Email / LINE 分流 |
| Auth | OTP 註冊 | 手機輸入 / OTP UI | Y | Y | N | Y | P0 | B | Sprint 1 | C 端登入註冊入口 |
| Auth | OTP 註冊 | 發送 OTP | N | Y | N | Y | P0 | A | Sprint 1 | SMS provider |
| Auth | OTP 註冊 | OTP 驗證與帳號建立 | Y | Y | N | N | P0 | A | Sprint 1 | 建立 user |
| Auth | OTP 登入 | OTP 登入流程 | Y | Y | N | Y | P0 | B | Sprint 1 | 與註冊可共用流程 |
| Auth | RBAC | 後台登入 | Y | Y | Y | N | P0 | B | Sprint 1 | 員工登入 |
| Auth | RBAC | View / Edit / Admin 權限模型 | N | Y | Y | N | P0 | A | Sprint 1 | 基礎權限控制 |
| Auth | RBAC | 後台權限控管中介層 | N | Y | Y | N | P0 | A | Sprint 1 | API / 頁面權限 |
| Auth | 會員資料 | 基本會員資料頁 | Y | Y | N | N | P1 | B | Sprint 1 | ⚠️ 可簡版先上 | 

---

## 二、KYC / 風控

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| KYC | 文件上傳 | 證件上傳頁 | Y | Y | N | Y | P0 | B | Sprint 4 | 使用者上傳證件 |
| KYC | 文件上傳 | 檔案上傳 API | N | Y | N | Y | P0 | A | Sprint 4 | 雲端或 NAS |
| KYC | 審核流程 | KYC 狀態欄位與流程 | N | Y | N | N | P0 | A | Sprint 4 | Pending / Approved / Rejected |
| KYC | 審核流程 | 後台 KYC 列表頁 | Y | Y | Y | N | P0 | B | Sprint 4 | 營運人工審核 |
| KYC | 審核流程 | KYC 詳情與核准 / 駁回 | Y | Y | Y | N | P0 | B | Sprint 4 | 必須可人工放行 |
| KYC | 稽核 | 審核紀錄 audit log | N | Y | Y | N | P1 | A | Sprint 4 | ⚠️ 建議保留操作軌跡 |

---

## 三、訂單建立 / 預約規則 / 庫存防撞

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| OMS | 下單流程 | C 端預約下單頁 | Y | Y | N | N | P0 | B | Sprint 2 | Web / PWA |
| OMS | 下單流程 | 訂單建立 API | N | Y | N | N | P0 | A | Sprint 2 | 核心建立流程 |
| OMS | 下單流程 | B 端人工建單頁 | Y | Y | Y | N | P0 | B | Sprint 2 | 門市代客建單 |
| OMS | 下單流程 | 極簡建單欄位（手機、稱呼） | Y | Y | Y | N | P0 | B | Sprint 2 | MVP 範圍 |
| OMS | 車輛選擇 | 指定車牌下拉與過濾 | Y | Y | Y | N | P0 | B | Sprint 2 | 過濾已預約車輛 |
| OMS | 訂單查詢 | C 端訂單列表 | Y | Y | N | N | P1 | B | Sprint 2 | ⚠️ 會員查詢 |
| OMS | 訂單查詢 | C 端訂單詳情 | Y | Y | N | N | P1 | B | Sprint 2 | ⚠️ 顯示狀態 |
| OMS | 訂單查詢 | 後台訂單列表 / 詳情 | Y | Y | Y | N | P0 | B | Sprint 2 | 營運作業核心 |
| OMS | 規則引擎 | 專人模式 T+1 ~ 60 天 | Y | Y | N | N | P0 | A | Sprint 2 | C 端限制 |
| OMS | 規則引擎 | 後台專人模式 T+0 建單 | Y | Y | Y | N | P0 | A | Sprint 2 | 僅後台允許 |
| OMS | 規則引擎 | 自助模式 T+10 分 ~ 7 天 | Y | Y | N | N | P0 | A | Sprint 2 | 自助模式限制 |
| OMS | 規則引擎 | 專人模式 1 單多車 | Y | Y | Y | N | P0 | A | Sprint 2 | 只限專人模式 |
| OMS | 規則引擎 | 訪客預訂 | Y | Y | Y | N | P1 | B | Sprint 2 | 可留簡化資料 |
| OMS | 規則引擎 | 自助模式 1 人 1 車 | N | Y | N | N | P0 | A | Sprint 2 | 強限制 |
| OMS | 規則引擎 | 自助模式不可重疊 | N | Y | N | N | P0 | A | Sprint 2 | 強限制 |
| OMS | 庫存控制 | 可用車查詢 API | Y | Y | Y | N | P0 | A | Sprint 2 | 建單前依賴 |
| OMS | 庫存控制 | 時間軸庫存防撞 | N | Y | N | N | P0 | A | Sprint 2 | 高風險核心邏輯 |
| OMS | 庫存控制 | No-Show 保留庫存 | N | Y | N | N | P1 | A | Sprint 2 | 規則保留 |

---

## 四、數位合約

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| Contract | 合約流程 | 合約預覽頁 | Y | Y | N | N | P0 | B | Sprint 3 | 付款前簽署 |
| Contract | 電子簽名 | Canvas 簽名 | Y | Y | N | N | P0 | B | Sprint 3 | 首次下單 |
| Contract | 電子簽名 | 歷史簽名帶入 | Y | Y | N | N | P0 | B | Sprint 3 | 舊客一鍵同意 |
| Contract | 文件產製 | 合約 PDF 生成 | N | Y | N | Y | P0 | A | Sprint 3 | 合約存證 |
| Contract | 文件管理 | 合約檔案儲存 | N | Y | N | Y | P0 | A | Sprint 3 | 雲端 / NAS |
| Contract | 文件查詢 | 合約列表 / 歷史合約 | Y | Y | N | N | P1 | B | Sprint 3 | ⚠️ C 端可調閱 |
| Contract | 文件查詢 | 合約下載 | Y | Y | N | N | P1 | B | Sprint 3 | ⚠️ 可下載 PDF |

---

## 五、付款 / 金流 / 電子發票

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| Payment | 倒數機制 | 10 分鐘付款倒數 UI | Y | Y | N | N | P0 | B | Sprint 3 | 合約後啟動 |
| Payment | 倒數機制 | 逾時自動取消訂單 | N | Y | N | N | P0 | A | Sprint 3 | 釋放庫存 |
| Payment | 線上付款 | 結帳頁 | Y | Y | N | Y | P0 | B | Sprint 3 | 付款入口 |
| Payment | 線上付款 | 藍新建立交易 | N | Y | N | Y | P0 | A | Sprint 3 | 核心串接 |
| Payment | 線上付款 | 支付 callback 處理 | N | Y | N | Y | P0 | A | Sprint 3 | 狀態更新 |
| Payment | 預授權 | 保證金預授權 | N | Y | N | Y | P0 | A | Sprint 3 | 信用卡圈存 |
| Payment | 風控 | 首次綁卡 3DS | Y | Y | N | Y | P1 | A | Sprint 3 | 依 gateway 流程 |
| Payment | 線下付款 | 現金 / 匯款 / 記帳後台選項 | Y | Y | Y | N | P1 | B | Sprint 4 | 後台結帳 |
| Invoice | 電子發票 | 自動開立電子發票 | N | Y | N | Y | P0 | A | Sprint 3 | 藍新 API |
| Invoice | 發票查詢 | 發票資訊顯示 | Y | Y | Y | N | P1 | B | Sprint 4 | ⚠️ 前後台可查 |
| Invoice | 人工作業 | 手動發票選項 | Y | Y | Y | N | P1 | B | Sprint 4 | 線下付款適用 |

---

## 六、計費 / 結算 / 折扣

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| Pricing | 基礎計費 | 時租計算 | N | Y | N | N | P0 | A | Sprint 4 | 核心計價 |
| Pricing | 基礎計費 | 日租計算 | N | Y | N | N | P0 | A | Sprint 4 | 核心計價 |
| Pricing | 基礎計費 | 24H 封頂邏輯 | N | Y | N | N | P0 | A | Sprint 4 | 核心規則 |
| Pricing | 基礎計費 | 00:00 假日切割 | N | Y | N | N | P0 | A | Sprint 4 | 核心規則 |
| Pricing | 逾時計費 | 15 分鐘寬限期 | N | Y | N | N | P0 | A | Sprint 4 | 向下取整 |
| Pricing | 里程費 | 里程費自動帶入 | N | Y | Y | Y | P0 | A | Sprint 4 | Pending_Settlement |
| Pricing | 結算 | 後台待結算表單 | Y | Y | Y | N | P0 | B | Sprint 4 | 補輸入額外費用 |
| Pricing | 結算 | ETC 輸入 | Y | Y | Y | N | P1 | B | Sprint 4 | 後台欄位 |
| Pricing | 結算 | 清潔費輸入 | Y | Y | Y | N | P1 | B | Sprint 4 | 後台欄位 |
| Pricing | 結算 | 車損費輸入 | Y | Y | Y | N | P1 | B | Sprint 4 | 後台欄位 |
| Pricing | 結算 | 其他附加費輸入 | Y | Y | Y | N | P1 | B | Sprint 4 | 後台欄位 |
| Pricing | 結算 | 預授權請款 | N | Y | N | Y | P0 | A | Sprint 4 | 結算後扣款 |
| Pricing | 加購 | 加購項目設定 | Y | Y | Y | N | P1 | B | Sprint 4 | ⚠️ 兒童座椅等 |
| Pricing | 加購 | 加購隨主單週期計價 | N | Y | N | N | P1 | A | Sprint 4 | ⚠️ 24H 週期 |
| Pricing | 折扣 | 折扣碼輸入 | Y | Y | N | N | P1 | B | Sprint 4 | ⚠️ C 端下單 |
| Pricing | 折扣 | 折扣碼驗證 | N | Y | N | N | P1 | A | Sprint 4 | ⚠️ 最低 0 元 |
| Pricing | 折扣 | 金額下限為 0 | N | Y | N | N | P0 | A | Sprint 4 | 不可負數 |
| Pricing | 政策 | 提早還車不退費 | N | Y | Y | N | P0 | A | Sprint 4 | 必須落實 |

---

## 七、訂單狀態機 / 流程控制

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| Flow | 狀態流轉 | Unpaid → Paid | N | Y | N | Y | P0 | A | Sprint 3 | 金流成功 |
| Flow | 狀態流轉 | Paid → Active | N | Y | N | Y | P0 | A | Sprint 5 | 取車啟動 |
| Flow | 狀態流轉 | Active → Pending_Settlement | N | Y | N | Y | P0 | A | Sprint 5 | 還車後 |
| Flow | 狀態流轉 | Pending_Settlement → Completed | N | Y | Y | Y | P0 | A | Sprint 5 | 完成結算 |
| Flow | 狀態流轉 | Cancelled | Y | Y | Y | N | P1 | B | Sprint 3 | 視規則取消 |
| Flow | 時間控制 | T-15 分鐘提前解鎖 | Y | Y | N | Y | P0 | A | Sprint 5 | 自助模式 |
| Flow | 時間控制 | 提前取車租期平移 | N | Y | N | N | P0 | A | Sprint 5 | 總租時數不變 |
| Flow | 財務標記 | Void | Y | Y | Y | N | P1 | B | Sprint 5 | ⚠️ 內部使用 |
| Flow | 財務標記 | Allowance | Y | Y | Y | N | P1 | B | Sprint 5 | ⚠️ 內部使用 |

---

## 八、IoT / 自助取還 / 客服控制台

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| IoT | Adapter | 單一 IoT provider 串接 | N | Y | N | Y | P0 | A | Sprint 5 | 供應商 API |
| IoT | 資料同步 | 讀取里程數 | N | Y | Y | Y | P0 | A | Sprint 5 | 結算需要 |
| IoT | 資料同步 | 讀取剩餘能源 | N | Y | Y | Y | P1 | A | Sprint 5 | ⚠️ 告警使用 |
| IoT | 遠端操作 | 遠端開鎖 | Y | Y | Y | Y | P0 | B | Sprint 5 | 自助取車核心 |
| IoT | 遠端操作 | 遠端關鎖 | Y | Y | Y | Y | P0 | B | Sprint 5 | 還車控制 |
| IoT | 安全驗證 | 遠端操作密碼驗證 | Y | Y | N | N | P0 | B | Sprint 5 | 防盜用 |
| IoT | 客服支援 | 客服控制台（簡版） | Y | Y | Y | N | P1 | B | Sprint 5 | ⚠️ 改簡版先行 |
| IoT | 客服支援 | 強制還車按鈕 | Y | Y | Y | Y | P0 | B | Sprint 5 | 截斷計費 |
| IoT | 稽核 | 遠端操作紀錄 | N | Y | Y | N | P1 | A | Sprint 5 | ⚠️ 建議保留 log |

---

## 九、車況影像存證

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| Media | 取車存證 | 取車照片上傳 | Y | Y | N | Y | P0 | B | Sprint 5 | C 端上傳 |
| Media | 取車存證 | 取車影片上傳 | Y | Y | N | Y | P1 | B | Sprint 5 | ⚠️ 可排在後段 |
| Media | 還車存證 | 還車照片上傳 | Y | Y | N | Y | P0 | B | Sprint 5 | C 端上傳 |
| Media | 還車存證 | 還車影片上傳 | Y | Y | N | Y | P1 | B | Sprint 5 | ⚠️ 可排在後段 |
| Media | 管理查閱 | 後台影像列表 | Y | Y | Y | N | P1 | B | Sprint 5 | 營運調閱 |
| Media | 管理查閱 | 影像詳情檢視 | Y | Y | Y | N | P1 | B | Sprint 5 | 權限控管 |

---

## 十、資產 / 站點 / 調度

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| Asset | 站點模式 | A-to-A 支援 | N | Y | Y | N | P0 | A | Sprint 5 | 原站取還 |
| Asset | 站點模式 | A-to-B 支援 | Y | Y | Y | N | P0 | A | Sprint 5 | 異地還車 |
| Asset | 站點追蹤 | 訂單結束更新站點 | N | Y | N | N | P0 | A | Sprint 5 | 還車更新 |
| Asset | 車輛管理 | 後台車輛列表 | Y | Y | Y | N | P1 | B | Sprint 5 | 狀態檢視 |
| Asset | 調度作業 | 手動修改站點 | Y | Y | Y | N | P1 | B | Sprint 5 | 營運使用 |
| Asset | 調度作業 | 移機確認照片上傳 | Y | Y | Y | Y | P1 | B | Sprint 5 | ⚠️ 內部紀錄 |

---

## 十一、通知系統

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| Notification | SMS | OTP 簡訊 | N | Y | N | Y | P0 | A | Sprint 1 | Auth 依賴 |
| Notification | Email | 合約副本寄送 | N | Y | N | Y | P1 | A | Sprint 5 | ⚠️ 合約完成後 |
| Notification | Email | 發票副本寄送 | N | Y | N | Y | P1 | A | Sprint 5 | ⚠️ 發票開立後 |
| Notification | LINE OA | 預約成功通知 | N | Y | N | Y | P1 | A | Sprint 5 | ⚠️ C 端通知 |
| Notification | LINE OA | 取車提醒通知 | N | Y | N | Y | P1 | A | Sprint 5 | ⚠️ 排程或事件觸發 |
| Notification | LINE OA | 還車結算通知 | N | Y | N | Y | P1 | A | Sprint 5 | ⚠️ 結算完成 |
| Notification | LINE OA | 新訂單營運告警 | N | Y | N | Y | P1 | A | Sprint 5 | ⚠️ 內部群組 |
| Notification | LINE OA | 低電量告警 | N | Y | N | Y | P1 | A | Sprint 5 | ⚠️ IoT 事件 |
| Notification | LINE OA | 強制還車告警 | N | Y | N | Y | P1 | A | Sprint 5 | ⚠️ 關鍵事件 |

---

## 十二、批次匯入

| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |
|---|---|---|---|---|---|---|---|---|---|---|
| Import | 匯入作業 | Excel / CSV 上傳頁 | Y | Y | Y | N | P1 | B | Sprint 4 | ⚠️ 過渡工具 |
| Import | 匯入作業 | 匯入解析器 | N | Y | N | N | P1 | A | Sprint 4 | ⚠️ 解析格式 |
| Import | 匯入作業 | 合法資料建單 | N | Y | N | N | P1 | A | Sprint 4 | ⚠️ 僅建立合法訂單 |
| Import | 匯入作業 | 異常資料略過 | N | Y | N | N | P1 | A | Sprint 4 | ⚠️ 不中斷整批 |
| Import | 匯入作業 | 錯誤清單頁 | Y | Y | Y | N | P1 | B | Sprint 4 | ⚠️ 顯示失敗原因 |

---

# 建議的里程碑切法

| Sprint | 目標 |
|---|---|
| Sprint 0 | 架構、DB、技術設計完成 |
| Sprint 1 | Auth / RBAC / 專案骨架完成 |
| Sprint 2 | 可建立訂單、可檢查庫存、可查詢訂單 |
| Sprint 3 | 可簽約、可付款、可開發票 |
| Sprint 4 | 可 KYC、可計費、可結算、可批次匯入 |
| Sprint 5 | 可自助取還、可強制還車、可通知、可上線驗收 |

---
