# Google Drive 照片橋接設定

1. 以單位專用 Google 帳號在 [Apps Script](https://script.google.com/) 建立專案，貼上 `Code.gs`。
2. 在 Google Drive 建立「清運案件照片」根資料夾，從網址複製資料夾 ID。
3. 在 Apps Script 的「專案設定 → 指令碼屬性」設定 `DRIVE_ROOT_FOLDER_ID` 與高強度隨機的 `DRIVE_UPLOAD_TOKEN`。
4. 部署 → 新部署 → 類型選「網頁應用程式」；執行身分選自己，存取權選「所有人」。複製 `/exec` 網址。
5. 將網址與同一組密鑰設為 Supabase Edge Function secrets：

```powershell
npx supabase secrets set GOOGLE_DRIVE_WEB_APP_URL="https://script.google.com/macros/s/.../exec" GOOGLE_DRIVE_WEB_APP_TOKEN="請填入相同密鑰"
npx supabase functions deploy case-api
```

網址與密鑰不可放到前端。新照片會存成 Drive 子資料夾 `案件單號/檔名.jpg`；Supabase 資料庫只保存 `drive:<檔案ID>`，既有 Supabase Storage 照片仍可正常讀取。
