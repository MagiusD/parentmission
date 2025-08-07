import axios from 'axios'; // [cite: 92]

const GAS_URL = import.meta.env.VITE_GAS_URL;

export async function callGoogleScript(action, payload = {}) {
  if (!GAS_URL) {
    throw new Error("錯誤：找不到 Google Apps Script 的 URL。請檢查您的 .env 檔案設定。[cite: 103]");
  }
  
  try {
    const response = await axios.post(GAS_URL, JSON.stringify({ action, payload }), {
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });

    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '發生未知的錯誤');
    }
  } catch (error) {
    console.error(`呼叫 Google Script 動作 "${action}" 時發生錯誤:`, error);
    throw new Error(error.response?.data?.message || error.message);
  }
}
