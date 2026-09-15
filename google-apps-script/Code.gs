/**
 * Google Drive 照片橋接服務。
 * 部署為 Apps Script Web App 前，先在「專案設定 → 指令碼屬性」建立：
 * - DRIVE_UPLOAD_TOKEN：高強度隨機字串
 * - DRIVE_ROOT_FOLDER_ID：Google Drive 根資料夾 ID
 */
function doPost(e) {
  try {
    const request = JSON.parse(e.postData && e.postData.contents || '{}');
    const properties = PropertiesService.getScriptProperties();
    if (!request.token || request.token !== properties.getProperty('DRIVE_UPLOAD_TOKEN')) return respond_({ ok: false, message: '未授權' });
    if (request.action === 'upload') return upload_(request, properties);
    if (request.action === 'get') return get_(request);
    return respond_({ ok: false, message: '不支援的操作' });
  } catch (err) {
    return respond_({ ok: false, message: err && err.message || '服務發生錯誤' });
  }
}

function upload_(request, properties) {
  const caseNo = String(request.caseNo || '');
  const fileName = String(request.fileName || '');
  const mimeType = String(request.mimeType || 'image/jpeg');
  const base64 = String(request.base64 || '');
  if (!/^\d{3}-\d{4}-\d{3,}$/.test(caseNo)) throw new Error('預約單號格式不正確');
  // 一般照片：115-0915-006-1.jpg；結案照片：115-0915-006-finish-1.jpg
  const escapedCaseNo = caseNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const validFileName = new RegExp('^' + escapedCaseNo + '-(?:finish-)?\\d+\\.jpg$', 'i');
  if (!validFileName.test(fileName)) throw new Error('照片檔名格式不正確：' + fileName);
  if (!mimeType.startsWith('image/') || !base64) throw new Error('照片內容格式不正確');
  const rootId = properties.getProperty('DRIVE_ROOT_FOLDER_ID');
  if (!rootId) throw new Error('尚未設定 Google Drive 根資料夾');
  const root = DriveApp.getFolderById(rootId);
  const [, year, month] = caseNo.match(/^(\d{3})-(\d{2})\d{2}-\d{3,}$/) || [];
  if (!year || !month) throw new Error('預約單號格式不正確');
  const yearFolder = getOrCreateFolder_(root, year);
  const monthFolder = getOrCreateFolder_(yearFolder, month);
  const folder = getOrCreateFolder_(monthFolder, caseNo);
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName));
  return respond_({ ok: true, fileId: file.getId() });
}

function get_(request) {
  const fileId = String(request.fileId || '');
  if (!fileId) throw new Error('缺少檔案 ID');
  const blob = DriveApp.getFileById(fileId).getBlob();
  return respond_({ ok: true, base64: Utilities.base64Encode(blob.getBytes()), mimeType: blob.getContentType() || 'image/jpeg' });
}

function getOrCreateFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function respond_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
