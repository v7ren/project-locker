import React from 'react'
import { Calendar, Layers, ShieldCheck, CreditCard, Car, Bell, FileText, Radio, CheckCircle2 } from 'lucide-react'

const sections = [
  {
    title: '專案摘要',
    icon: FileText,
    items: [
      'mOx Phase 1 目標為建立租賃 MVP，完成核心交易閉環。',
      '同時支援「專人服務」與「自助取還（IoT）」雙軌營運模式。',
      '範圍以 Happy Path 與基礎防呆為主，複雜異常先以人工營運處理。'
    ]
  },
  {
    title: '核心模組',
    icon: Layers,
    items: [
      'Auth / OTP 登入註冊 / RBAC 權限控管',
      'OMS 訂單建立、預約規則、庫存防撞、訂單狀態流轉',
      '數位合約、Canvas 電子簽名、歷史合約查閱下載',
      '金流 / 預授權 / 電子發票 / 結算',
      'IoT 開關鎖、里程 / 電量讀取、客服強制還車',
      '通知系統：SMS / Email / LINE OA'
    ]
  },
  {
    title: 'Phase 1 重點',
    icon: CheckCircle2,
    items: [
      '先完成從下單、簽約、付款、取車、還車到結算的完整流程。',
      '後台需支援門市人工建單、KYC 審核、待結算處理、影像調閱。',
      '資料庫與底層架構需預留 tenant_id、credit_score、license_expiry_date 等擴充欄位。'
    ]
  }
]

const milestoneItems = [
  { label: 'Sprint 0', detail: '架構、ERD、資料庫、Adapter 設計' },
  { label: 'Sprint 1', detail: 'Auth、RBAC、專案骨架' },
  { label: 'Sprint 2', detail: 'OMS 下單、預約規則、庫存鎖定' },
  { label: 'Sprint 3', detail: '數位合約、付款、發票' },
  { label: 'Sprint 4', detail: 'KYC、計費、結算、批次匯入' },
  { label: 'Sprint 5', detail: 'IoT 取還車、通知、上線驗收' }
]

const moduleCards = [
  { title: '身份與權限', icon: ShieldCheck, desc: 'OTP、會員、KYC、RBAC' },
  { title: '訂單與庫存', icon: Calendar, desc: '預約、建單、排程、庫存防撞' },
  { title: '付款與結算', icon: CreditCard, desc: '藍新金流、預授權、發票、結算' },
  { title: '車輛與 IoT', icon: Car, desc: '開關鎖、里程、能源、站點更新' },
  { title: '通知與營運', icon: Bell, desc: 'SMS、Email、LINE OA、告警' },
  { title: '硬體串接', icon: Radio, desc: '單一 IoT provider adapter 抽象層' }
]

const stats = [
  { label: '專案階段', value: 'Phase 1' },
  { label: '交付目標', value: '租賃 MVP' },
  { label: '營運模式', value: '專人 + 自助' },
  { label: '工程配置', value: '2 Engineers' }
]

export default function MoxProjectMainPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="border-b border-black pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center border border-black px-3 py-1 text-xs tracking-widest uppercase">
                mOx Project
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Phase 1 主頁摘要
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-black/70">
                  專案主軸為建立可營運的租賃 MVP，打通會員註冊、KYC、預約建單、數位合約、
                  金流付款、IoT 取還車、結算與通知等核心流程，並保留未來多租戶與擴充整合的架構彈性。
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-px border border-black bg-black sm:w-auto sm:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="bg-white px-4 py-4">
                  <div className="text-xs uppercase tracking-widest text-black/50">{item.label}</div>
                  <div className="mt-2 text-sm font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <main className="grid gap-10 py-10 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-10">
            <div className="grid gap-px border border-black bg-black md:grid-cols-2 xl:grid-cols-3">
              {moduleCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.title} className="bg-white p-5">
                    <div className="flex items-start justify-between">
                      <Icon className="h-5 w-5" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-black/40">Module</span>
                    </div>
                    <h2 className="mt-6 text-lg font-medium">{card.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-black/65">{card.desc}</p>
                  </div>
                )
              })}
            </div>

            <div className="space-y-6">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <section key={section.title} className="border border-black">
                    <div className="flex items-center gap-3 border-b border-black px-5 py-4">
                      <Icon className="h-4 w-4" />
                      <h3 className="text-sm font-medium tracking-wide">{section.title}</h3>
                    </div>
                    <div className="px-5 py-4">
                      <ul className="space-y-3 text-sm leading-6 text-black/75">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="border border-black">
              <div className="border-b border-black px-5 py-4">
                <h3 className="text-sm font-medium tracking-wide">交付節奏</h3>
              </div>
              <div className="divide-y divide-black">
                {milestoneItems.map((item) => (
                  <div key={item.label} className="px-5 py-4">
                    <div className="text-xs uppercase tracking-widest text-black/45">{item.label}</div>
                    <div className="mt-2 text-sm leading-6">{item.detail}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-black p-5">
              <h3 className="text-sm font-medium tracking-wide">管理重點</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-black/75">
                <p>• 優先打通交易閉環，而不是一次完成所有營運自動化。</p>
                <p>• 高風險項目為：庫存防撞、金流預授權、IoT 指令與結算邏輯。</p>
                <p>• Phase 1 明確接受人工補操作，避免過早投入複雜異常流程。</p>
              </div>
            </section>

            <section className="border border-black p-5">
              <h3 className="text-sm font-medium tracking-wide">架構預留</h3>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {['tenant_id', 'credit_score', 'license_expiry_date', 'Payment Adapter', 'IoT Adapter', 'Notification Handler'].map((item) => (
                  <span key={item} className="border border-black px-2 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}