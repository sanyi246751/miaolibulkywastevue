# 苗栗大型廢棄傢俱清運系統

線上大型廢棄傢俱預約、派車、現場清運與結案管理系統。提供民眾端、管理端及工作端，正式資料與照片皆儲存於 Supabase。

## 系統入口

| 入口 | 網址檔案 | 用途 |
| --- | --- | --- |
| 民眾端 | `index.html` | 線上申請、上傳待清運照片、查詢進度 |
| 管理端 | `admin.html` | 審核、計費、排班、路線、資料庫檢視與統計 |
| 工作端 | `work.html` | 清運人員查看案件、導航、拍照結案 |

## 主要功能

### 民眾端

- 必填縣市、行政區域及詳細清運地址，送出時合併保存完整地址。
- 選擇清運品項、數量、希望日期與時段。
- 上傳待清運照片。
- 依預約單號與電話查詢案件進度。
- 每戶每年度最多 3 次免費申請；每次 2 件內免費，超過部分每件 NT$200。

### 管理端

- 待處理、已排班、清運完成、已取消、電話申請、Dashboard、資料庫檢視及系統設定頁籤。
- 人工逐項覆核、年度申請次數及費用計算。
- 車輛、清運人員與清運車出發點設定。
- 同車、日期、時段及班次的路線規劃；使用 Nominatim 定位與 OSRM 道路路線計算。
- 依車輛油耗與碳排係數計算班次碳排量。
- 每個清運地址可個別開啟 Google 地圖導航。
- 拍照結案時，將班次里程與碳排量寫入一次，避免同班多案件重複累加。
- 資料庫檢視支援所有系統資料表、搜尋、時間區隔、欄位自訂、表頭拖曳排序、CSV 匯出及資料列刪除確認。

### 工作端

- 使用工作人員驗證碼登入。
- 顯示已排班及清運中案件，可依車號與關鍵字篩選。
- 一鍵電話聯絡與 Google 地圖導航。
- 拍照結案，上傳最多 2 張結案照片至 Supabase Storage。

## 技術架構

```text
Vue 3 + Vite + Tailwind CSS
        │
        ├─ Supabase Auth：管理端登入
        ├─ Supabase Edge Function：case-api
        ├─ Supabase PostgreSQL：案件、車輛、人員、設定、歷程
        └─ Supabase Storage：待清運與結案照片

外部服務
  ├─ OpenStreetMap Nominatim：地址定位
  ├─ OSRM：道路距離及時間
  └─ Google Maps：導航連結
```

## Supabase 資料表

| 資料表 | 用途 |
| --- | --- |
| `cases` | 案件、派車、覆核、計費、照片、座標、結案里程與碳排 |
| `vehicles` | 車號、油耗、碳排係數及啟用狀態 |
| `workers` | 清運人員與啟用狀態 |
| `system_settings` | 系統設定，例如清運車預設出發點 |
| `case_history` | 案件操作歷程 |

照片存放於私有 Storage bucket：`case-photos`。

## 重要規則

- 同一完整地址、同一年度的非取消案件，依建立時間排序計算年度申請次數。
- 前 3 次申請，每次人工核可後前 2 件免費；第 4 次起全部計費。
- 路線結果優先使用 OSRM；道路服務無法取得路線時，使用直線距離 × 1.35 的預估值並顯示提示。
- `0,0` 或無效座標會重新定位；門牌未收錄時會嘗試同一路段定位。
- 同班次路線里程及碳排只在第一筆結案案件寫入資料庫一次。

## 本機開發

### 環境需求

- Node.js 18 以上
- npm
- 已建立的 Supabase 專案與存取權限

### 安裝與啟動

```powershell
npm install
npm run dev
```

- 民眾端：`http://localhost:3000/`
- 管理端：`http://localhost:3000/admin.html`
- 工作端：`http://localhost:3000/work.html`

### 環境變數

建立 `.env`：

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

請勿提交 `.env` 或任何 Supabase 金鑰。

## Supabase 部署

資料庫 migration 位於 `supabase/migrations/`。

```powershell
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy case-api --project-ref YOUR_PROJECT_REF
```

## 前端建置與發布

```powershell
npm run build
git add .
git commit -m "更新功能"
git push origin main
```

推送至 `main` 後，GitHub Actions 會建置並發布 GitHub Pages。

- 民眾端：`https://sanyi246751.github.io/miaolibulkywastevue/`
- 管理端：`https://sanyi246751.github.io/miaolibulkywastevue/admin.html`
- 工作端：`https://sanyi246751.github.io/miaolibulkywastevue/work.html`

## 專案結構

```text
src/
├─ App.jsx                    民眾端
├─ admin/
│  ├─ AdminApp.jsx            管理端主程式
│  └─ components/             管理端元件與資料庫檢視
├─ work/
│  └─ WorkApp.jsx             工作端
├─ api.js                     Supabase API 呼叫
└─ vueHooks.js                JSX 相容 hooks

supabase/
├─ functions/case-api/        Edge Function
└─ migrations/                PostgreSQL migrations
```

## 驗收重點

- 民眾申請後，完整地址及待清運照片可在管理端看到。
- 管理端人工核可後可排班，已排班班次能自動計算路線。
- 工作端可開啟導航並拍照結案，照片會出現在管理端與資料庫檢視。
- 結案後 Dashboard 與資料庫檢視可看到結案里程及碳排量。
- 資料庫檢視可查看所有 Supabase 資料表並匯出 CSV。
