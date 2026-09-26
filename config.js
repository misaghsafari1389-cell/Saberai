/* ============================================================
   ⚙️ SABER V6 — Config File
   ============================================================
   این فایل فقط تنظیمات و کلید Groq رو داره.
   هیچ کد اصلی اینجا نیست. هر وقت خواستی کلید یا مدل رو
   عوض کنی، فقط همین فایل رو ویرایش کن.
   ============================================================ */

window.SABER_CONFIG = {

  // 🔑 کلید Groq (بین دو تا ' بذار)
  // اگه هنوز نداری: https://console.groq.com/keys
  GROQ_API_KEY: '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',

  // 🧠 مدل پیش‌فرض
  // گزینه‌ها:
  //   'mistral-saba-24b'         ← فارسی (پیشنهاد)
  //   'llama-3.3-70b-versatile'  ← قوی
  //   'llama-3.1-8b-instant'     ← سریع
  //   'gemma2-9b-it'             ← گوگل
  GROQ_MODEL: 'mistral-saba-24b',

  // 🎙️ تنظیمات صدا
  TTS_LANG: 'fa-IR',
  TTS_RATE: 0.9,
  TTS_PITCH: 0.85,

  // 🖥️ اطلاعات
  VERSION: '6.0.0',
  APP_NAME: 'صابر'
};