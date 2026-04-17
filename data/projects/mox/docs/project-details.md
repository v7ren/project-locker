# Phase 1 功能拆解表（小功能 → 類別 → 前後端）

---

## 建議欄位說明

| 欄位 | 說明 |
|---|---|
| 模組 | 大模組，例如 Auth、OMS、IoT |
| 功能分類 | 次分類，例如 OTP、角色權限、訂單建立 |
| 小功能 | 可切成 ticket 的功能點 |
| 前端 | 是否需要前端開發 |
| 後端 | 是否需要後端開發 |
| 管理後台 | 是否需要後台介面 |
| 外部串接 | 是否涉及第三方 / 硬體 API |
| 依賴 | 主要前置條件 |
| 優先級 | P0 / P1 / P2 |
| 備註 / 規則 | 關鍵商業規則 |

---

# 一、Auth / 會員 / 權限

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| Auth | OTP 註冊 | 手機號碼輸入頁 | Yes | Yes | No | SMS | SMS provider | P0 | 註冊入口 |
| Auth | OTP 註冊 | 發送 OTP 驗證碼 | No | Yes | No | SMS | SMS provider | P0 | 僅 SMS |
| Auth | OTP 註冊 | OTP 驗證成功建立帳號 | Yes | Yes | No | No | User schema | P0 | 建立會員 |
| Auth | OTP 登入 | 手機 OTP 登入頁 | Yes | Yes | No | SMS | SMS provider | P0 | 與註冊流程相似 |
| Auth | OTP 登入 | 發送登入驗證碼 | No | Yes | No | SMS | SMS provider | P0 | 單次驗證碼 |
| Auth | OTP 登入 | 驗證成功取得 session / token | Yes | Yes | No | No | Auth service | P0 | 登入成功 |
| Auth | 會員資料 | 基本會員資料頁 | Yes | Yes | No | No | User profile API | P1 | 顯示手機、稱呼等 |
| Auth | 會員資料 | 編輯基本會員資料 | Yes | Yes | No | No | User profile API | P2 | 若 MVP 可簡化 |
| Auth | 權限管理 | 後台登入頁 | Yes | Yes | Yes | No | Admin auth | P0 | 員工登入入口 |
| Auth | 權限管理 | 角色權限模型 View / Edit / Admin | No | Yes | Yes | No | RBAC schema | P0 | 基本權限 |
| Auth | 權限管理 | 後台角色權限設定頁 | Yes | Yes | Yes | No | RBAC API | P1 | 若初期固定角色可簡化 |
| Auth | 會員資料 | DB 預留 license_expiry_date | No | Yes | No | No | Schema design | P0 | Phase 2 預留 |
| Auth | 會員資料 | DB 預留 credit_score | No | Yes | No | No | Schema design | P0 | Phase 2 預留 |
| Auth | 多租戶 | DB 預留 tenant_id | No | Yes | No | No | Schema design | P0 | Phase 2 預留 |

---

# 二、KYC / 風控

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| KYC | 證件上傳 | KYC 文件上傳頁 | Yes | Yes | No | File storage | Upload service | P0 | 上傳證件照片 |
| KYC | 證件上傳 | 證件檔案上傳 API | No | Yes | No | File storage | Storage config | P0 | 雲端或 NAS |
| KYC | 審核流程 | KYC 狀態欄位 | No | Yes | No | No | User/KYC schema | P0 | Pending / Approved / Rejected |
| KYC | 審核流程 | 後台 KYC 審核列表 | Yes | Yes | Yes | No | KYC API | P0 | 營運審核 |
| KYC | 審核流程 | KYC 詳情檢視 | Yes | Yes | Yes | No | KYC API | P0 | 檢視證件 |
| KYC | 審核流程 | 手動核准 / 駁回 | Yes | Yes | Yes | No | Audit log | P0 | 人工放行 |
| KYC | 審核流程 | 審核紀錄 / audit log | No | Yes | Yes | No | Audit schema | P1 | 建議保留軌跡 |

---

# 三、通知系統

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| Notification | SMS | OTP 簡訊發送 | No | Yes | No | SMS | SMS provider | P0 | 僅登入註冊使用 |
| Notification | Email | 合約 Email 發送 | No | Yes | No | Email | Contract PDF | P0 | 寄合約副本 |
| Notification | Email | 電子發票 Email 發送 | No | Yes | No | Email | Invoice API | P0 | 寄發票副本 |
| Notification | LINE OA | 消費者預約成功通知 | No | Yes | No | LINE OA | Order event | P1 | 預約成立通知 |
| Notification | LINE OA | 取車提醒通知 | No | Yes | No | LINE OA | Scheduler / trigger | P1 | 接近取車時間 |
| Notification | LINE OA | 還車結算通知 | No | Yes | No | LINE OA | Settlement complete | P1 | 通知結算結果 |
| Notification | LINE OA | 營運 LINE 群組新單告警 | No | Yes | No | LINE OA | Order event | P1 | Admin alert |
| Notification | LINE OA | 低電量告警 | No | Yes | No | LINE OA / IoT | IoT data | P1 | 營運告警 |
| Notification | LINE OA | 強制還車告警 | No | Yes | No | LINE OA | Forced return | P1 | 營運告警 |
| Notification | 基礎架構 | NotificationHandler 分流邏輯 | No | Yes | No | No | Event model | P0 | Phase 2 可擴充 |

---

# 四、OMS / 訂單建立

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| OMS | 訂單建立 | C 端預約下單頁 | Yes | Yes | No | No | Availability API | P0 | Web / PWA |
| OMS | 訂單建立 | 訂單建立 API | No | Yes | No | No | Order schema | P0 | 核心能力 |
| OMS | 訂單建立 | B 端人工建單頁 | Yes | Yes | Yes | No | Order API | P0 | 門市代客建立 |
| OMS | 訂單建立 | 極簡欄位建單（手機、稱呼） | Yes | Yes | Yes | No | Order form | P0 | 後台 MVP |
| OMS | 訂單建立 | 指定車牌下拉選單 | Yes | Yes | Yes | No | Fleet availability | P0 | 過濾已預約車輛 |
| OMS | 訂單查詢 | C 端訂單列表 | Yes | Yes | No | No | Order query API | P1 | 會員查單 |
| OMS | 訂單查詢 | C 端訂單詳情 | Yes | Yes | No | No | Order query API | P1 | 訂單細節 |
| OMS | 訂單查詢 | 後台訂單列表 | Yes | Yes | Yes | No | Admin query API | P0 | 營運使用 |
| OMS | 訂單查詢 | 後台訂單詳情 | Yes | Yes | Yes | No | Admin query API | P0 | 營運使用 |

---

# 五、OMS / 預約規則與庫存防撞

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| OMS | 預約規則 | 專人模式預約時間限制 | Yes | Yes | No | No | Booking rules engine | P0 | C 端 T+1 ~ 60 天 |
| OMS | 預約規則 | 專人模式後台 T+0 建單 | Yes | Yes | Yes | No | Booking rules engine | P0 | 僅後台允許 |
| OMS | 預約規則 | 自助模式預約時間限制 | Yes | Yes | No | No | Booking rules engine | P0 | T+10 分 ~ 7 天 |
| OMS | 預約規則 | 專人模式 1 單多車 | Yes | Yes | Yes | No | Order model | P0 | 專人模式限定 |
| OMS | 預約規則 | 訪客預訂 | Yes | Yes | Yes | No | Guest order model | P1 | 專人模式 |
| OMS | 預約規則 | 自助模式 1 人 1 車 | Yes | Yes | No | No | User booking validator | P0 | 強限制 |
| OMS | 預約規則 | 自助模式時段不可重疊 | No | Yes | No | No | Overlap validator | P0 | 強限制 |
| OMS | 庫存控制 | 可用車查詢 API | Yes | Yes | Yes | No | Inventory model | P0 | 查詢可預約車輛 |
| OMS | 庫存控制 | 時間軸庫存防撞 | No | Yes | No | No | Locking strategy | P0 | 高風險核心 |
| OMS | 庫存控制 | No-Show 保留庫存 | No | Yes | No | No | Reservation policy | P1 | 需保留車輛 |

---

# 六、OMS / 批次匯入

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| OMS | 批次匯入 | 匯入模板下載 | Yes | Yes | Yes | No | Template file | P2 | 可後補 |
| OMS | 批次匯入 | Excel / CSV 上傳頁 | Yes | Yes | Yes | No | Upload API | P1 | 後台工具 |
| OMS | 批次匯入 | 匯入解析器 | No | Yes | No | No | File parser | P1 | Transitional tool |
| OMS | 批次匯入 | 建立有效訂單 | No | Yes | No | No | Order service | P1 | 僅建立合法資料 |
| OMS | 批次匯入 | 略過異常資料 | No | Yes | No | No | Validation rules | P1 | 不中斷整批 |
| OMS | 批次匯入 | 匯入錯誤清單頁 | Yes | Yes | Yes | No | Import result API | P1 | 顯示失敗原因 |

---

# 七、數位合約

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| Contract | 簽署流程 | 合約預覽頁 | Yes | Yes | No | No | Contract template | P0 | 付款前完成 |
| Contract | 電子簽名 | Canvas 簽名功能 | Yes | Yes | No | No | Signature storage | P0 | 首次下單 |
| Contract | 電子簽名 | 歷史簽名帶入 | Yes | Yes | No | No | Signature repository | P0 | 舊客一鍵同意 |
| Contract | 文件產製 | 合約 PDF 生成 | No | Yes | No | PDF lib | Contract data | P0 | 存證與寄送 |
| Contract | 文件管理 | 合約檔案儲存 | No | Yes | No | File storage | Storage config | P0 | 雲端 / NAS |
| Contract | 文件查詢 | 會員合約列表 | Yes | Yes | No | No | Contract query API | P1 | 歷史合約 |
| Contract | 文件查詢 | 合約下載 | Yes | Yes | No | No | File access control | P1 | 可下載 PDF |

---

# 八、付款 / 金流 / 發票

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| Payment | 倒數機制 | 10 分鐘付款倒數 UI | Yes | Yes | No | No | Order timer | P0 | 合約後啟動 |
| Payment | 倒數機制 | 逾時自動取消訂單 | No | Yes | No | No | Expiry job | P0 | 釋放庫存 |
| Payment | 線上付款 | 結帳頁 | Yes | Yes | No | NewebPay | Checkout API | P0 | 線上付款入口 |
| Payment | 線上付款 | 藍新付款建立交易 | No | Yes | No | NewebPay | Payment adapter | P0 | 核心串接 |
| Payment | 線上付款 | 支付結果 callback 處理 | No | Yes | No | NewebPay | Payment callback | P0 | 更新訂單狀態 |
| Payment | 預授權 | 保證金預授權 | No | Yes | No | NewebPay | Payment adapter | P0 | 信用卡圈存 |
| Payment | 風控 | 首次綁卡 3DS 流程 | Yes | Yes | No | NewebPay | Card binding flow | P1 | 視支付流程實作 |
| Payment | 線下付款 | 後台線下付款選項 | Yes | Yes | Yes | No | Admin payment API | P1 | 現金 / 匯款 / 記帳 |
| Invoice | 電子發票 | 電子發票自動開立 | No | Yes | No | NewebPay Invoice | Invoice adapter | P0 | 線上交易 |
| Invoice | 電子發票 | 發票資料查詢 | Yes | Yes | Yes | No | Invoice API | P1 | 後台 / 前台可查 |
| Invoice | 人工作業 | 手動發票選項 | Yes | Yes | Yes | No | Admin workflow | P1 | 線下交易使用 |

---

# 九、訂單狀態機與流程控制

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| Order Flow | 狀態機 | Unpaid → Paid 流轉 | No | Yes | No | Payment | Payment result | P0 | 付款成功 |
| Order Flow | 狀態機 | Paid → Active 流轉 | No | Yes | No | IoT / pickup | Pickup event | P0 | 取車後啟動 |
| Order Flow | 狀態機 | Active → Pending_Settlement | No | Yes | No | Return / force return | Return event | P0 | 還車後待結算 |
| Order Flow | 狀態機 | Pending_Settlement → Completed | No | Yes | Yes | Payment | Final settlement | P0 | 結算完成 |
| Order Flow | 狀態機 | 任意狀態 → Cancelled | Yes | Yes | Yes | No | Cancel rules | P1 | 視規則可取消 |
| Order Flow | 財務狀態 | Void 標記 | Yes | Yes | Yes | No | Finance workflow | P1 | 內部用 |
| Order Flow | 財務狀態 | Allowance 標記 | Yes | Yes | Yes | No | Finance workflow | P1 | 內部用 |
| Order Flow | 時間控制 | T-15 分鐘提前解鎖 | Yes | Yes | No | IoT | Unlock logic | P0 | 自助模式 |
| Order Flow | 時間控制 | 提前取車租期平移 | No | Yes | No | No | Time shift logic | P0 | 總租期不變 |

---

# 十、車況影像存證

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| Media | 取車存證 | 取車照片上傳 | Yes | Yes | No | File storage | Upload API | P0 | 消費者上傳 |
| Media | 取車存證 | 取車影片上傳 | Yes | Yes | No | File storage | Upload API | P1 | 可視時程調整 |
| Media | 還車存證 | 還車照片上傳 | Yes | Yes | No | File storage | Upload API | P0 | 消費者上傳 |
| Media | 還車存證 | 還車影片上傳 | Yes | Yes | No | File storage | Upload API | P1 | 可視時程調整 |
| Media | 管理查閱 | 後台影像調閱列表 | Yes | Yes | Yes | No | Media query API | P1 | 營運查證 |
| Media | 管理查閱 | 影像詳情檢視 | Yes | Yes | Yes | No | File access | P1 | 權限控管 |

---

# 十一、IoT / 自助取還 / 客服控制台

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| IoT | 裝置串接 | 單一 IoT provider adapter | No | Yes | No | IoT | Vendor API | P0 | 抽象層要先設計 |
| IoT | 裝置資料 | 讀取里程數 | No | Yes | Yes | IoT | Vendor API | P0 | 結算使用 |
| IoT | 裝置資料 | 讀取剩餘能源 | No | Yes | Yes | IoT | Vendor API | P1 | 營運監控 |
| IoT | 遠端操作 | 遠端開鎖 | Yes | Yes | Yes | IoT | Unlock API | P0 | 自助取車 |
| IoT | 遠端操作 | 遠端關鎖 | Yes | Yes | Yes | IoT | Lock API | P0 | 還車 / 控管 |
| IoT | 安全控管 | 遠端操作密碼驗證 | Yes | Yes | No | No | Password verify | P0 | 防盜用 |
| IoT | 客服支援 | 客服控制台頁面 | Yes | Yes | Yes | No | Admin access | P1 | 發送遠端指令 |
| IoT | 客服支援 | 強制還車按鈕 | Yes | Yes | Yes | IoT | Force return logic | P0 | 極端事故切費 |
| IoT | 客服支援 | 遠端指令執行紀錄 | Yes | Yes | Yes | No | Audit log | P1 | 建議保留 |

---

# 十二、資產 / 站點 / 調度

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| Asset | 站點模式 | A-to-A 支援 | No | Yes | Yes | No | Order model | P0 | 原站取還 |
| Asset | 站點模式 | A-to-B 支援 | Yes | Yes | Yes | No | Station model | P0 | 異地還車 |
| Asset | 站點追蹤 | 訂單結束更新站點 | No | Yes | No | No | Return flow | P0 | 更新歸屬 |
| Asset | 車輛管理 | 車輛列表 / 狀態查詢 | Yes | Yes | Yes | No | Fleet API | P1 | 後台管理 |
| Asset | 調度作業 | 手動修改車輛站點 | Yes | Yes | Yes | No | Station update API | P1 | 人工調度 |
| Asset | 調度作業 | 上傳移機確認照片 | Yes | Yes | Yes | File storage | Upload API | P1 | 內部紀錄 |
| Asset | 庫存管理 | 車輛可用狀態查詢 | Yes | Yes | Yes | IoT optional | Fleet status API | P0 | 建單依賴 |

---

# 十三、計費 / 結算 / 折扣

| 模組 | 功能分類 | 小功能 | 前端 | 後端 | 管理後台 | 外部串接 | 依賴 | 優先級 | 備註 / 規則 |
|---|---|---|---|---|---|---|---|---|---|
| Pricing | 基礎計費 | 時租計算 | No | Yes | No | No | Pricing engine | P0 | 核心 |
| Pricing | 基礎計費 | 日租計算 | No | Yes | No | No | Pricing engine | P0 | 核心 |
| Pricing | 基礎計費 | 24H 封頂邏輯 | No | Yes | No | No | Pricing engine | P0 | 核心 |
| Pricing | 基礎計費 | 00:00 假日費率切割 | No | Yes | No | No | Holiday calendar/rule | P0 | 核心 |
| Pricing | 逾時計費 | 15 分鐘寬限期 | No | Yes | No | No | Settlement rule | P0 | 向下取整 |
| Pricing | 里程費 | 里程費自動帶入 | No | Yes | Yes | IoT | Mileage data | P0 | Pending_Settlement |
| Pricing | 附加費 | ETC 欄位輸入 | Yes | Yes | Yes | No | Settlement form | P1 | 後台人工輸入 |
| Pricing | 附加費 | 清潔費欄位輸入 | Yes | Yes | Yes | No | Settlement form | P1 | 後台人工輸入 |
| Pricing | 附加費 | 車損費欄位輸入 | Yes | Yes | Yes | No | Settlement form | P1 | 後台人工輸入 |
| Pricing | 附加費 | 其他費用欄位輸入 | Yes | Yes | Yes | No | Settlement form | P1 | 後台人工輸入 |
| Pricing | 結算 | 後台待結算表單 | Yes | Yes | Yes | No | Settlement API | P0 | 結算核心 |
| Pricing | 結算 | 預授權請款 | No | Yes | No | Payment | Capture API | P0 | 結算後扣款 |
| Pricing | 加購服務 | 加購項目設定 | Yes | Yes | Yes | No | Product/add-on model | P1 | 例：兒童座椅 |
| Pricing | 加購服務 | 加購項目隨主單計價 | No | Yes | No | No | Pricing engine | P1 | 跟 24H 週期 |
| Pricing | 折扣 | 折扣碼輸入 | Yes | Yes | No | No | Promo API | P1 | C 端可用 |
| Pricing | 折扣 | 折扣碼驗證 | No | Yes | No | No | Promo rule | P1 | 最低 0 元 |
| Pricing | 折扣 | 金額下限為 0 | No | Yes | No | No | Pricing engine | P0 | 不可負數 |
| Pricing | 退費政策 | 提早還車不退費 | No | Yes | Yes | No | Settlement rules | P0 | 必須落實 |

---
