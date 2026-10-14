# تغییرات نسخه V6 Dual Groq + ElevenLabs

- حذف کامل رابط کاربری و منطق Gemini TTS؛ کلید قدیمی Gemini هنگام اجرای نسخه جدید از LocalStorage پاک می‌شود.
- افزودن دو محل مستقل برای Groq API Key و دو فیلد انتخاب مدل.
- مسیریابی درخواست‌ها بر اساس نشانه‌های جستجو و تلاش اتصال دوم در صورت شکست اتصال اول.
- حفظ ElevenLabs به‌عنوان موتور گفتار آنلاین اصلی و Google Translate به‌عنوان جایگزین.
- بازطراحی آواتار به چهره‌ای انسان‌مانندتر با چشم، مو، بینی و لب.
- حرکت لب و نمایش وضعیت SPEAKING فقط پس از رویداد شروع واقعی پخش صوت؛ هنگام انتظار برای پاسخ صوتی، آواتار در وضعیت THINKING می‌ماند.
- افزایش نسخه کش Service Worker برای بارگیری تغییرات جدید.


## PWA + multilingual temporary search routing
- ZIP root flattened: index.html, manifest.json, sw.js and docs are directly at archive root; only icon/logo files remain under assets/.
- Manifest start_url/scope/id normalized to relative root and both required PNG icon sizes are declared, with a maskable entry.
- Service worker cache version bumped to clear prior cached app assets.
- Search intent detection expanded across multiple languages and applies only to the current request; subsequent requests return to the configured chat model.


## PWA + multilingual temporary search routing
- ZIP root flattened; only icons and logo remain in assets/.
- Manifest start_url/scope/id normalized to relative root and 192/512 PNG icons declared, including maskable icon purpose.
- Service worker cache version bumped.
- Search intent detection expanded across multiple languages and applies only to the current request; next requests return to configured chat model.
