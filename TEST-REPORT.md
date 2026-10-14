# گزارش آزمایش نسخه V6 Dual Groq + ElevenLabs

## انجام‌شده
- بررسی نحوی JavaScript با Node.js: موفق.
- بررسی ساختار ZIP و وجود فایل‌های اصلی پروژه: در مرحله بسته‌بندی انجام می‌شود.
- جستجوی کد برای حذف رابط و توابع Gemini TTS: هیچ رابط یا تابع فعال Gemini TTS باقی نمانده؛ کلید قدیمی در زمان راه‌اندازی پاک می‌شود.
- همگام‌سازی مدل انتخابی با فیلد مدل اتصال اول: در کد اعمال شده است.
- انیمیشن لب برای صدای گوشی و صوت‌های HTMLAudioElement به رویداد onstart/onplay متصل است.

## تأییدنشده
- درخواست زنده به Groq با دو کلید واقعی، چون کلیدهای کاربر در اختیار نیستند.
- درخواست زنده ElevenLabs و دریافت صوت، به علت نیاز به کلید معتبر و Voice ID حساب کاربر.
- بررسی رفتار روی دستگاه Android واقعی و مرورگر واقعی.

## محدودیت‌ها
- انتخاب هوشمند جستجو بر اساس نشانه‌های متنی و تنظیم جستجوی زنده انجام می‌شود، نه یک طبقه‌بند جداگانه.
- GitHub Pages ایستا است؛ کلیدهای API در مرورگر ذخیره می‌شوند و برای پروژه عمومی/چندکاربره بهتر است از سرور واسط امن استفاده شود.
- حرکت لب به زمان پخش صوت وابسته است، اما از داده‌های دقیق phoneme/viseme موتور صدا استفاده نمی‌کند؛ بنابراین هم‌زمانی تقریبی است.


## Additional checks
- ZIP layout: project files are at archive root; only logos/icons are in assets/.
- manifest.json parses and declares 192x192 and 512x512 PNG icons.
- Search intent routes per request and does not mutate saved default model settings.
- Live browser installation and live Groq API calls cannot be verified in this build environment; test on the published HTTPS GitHub Pages URL.


## Additional checks
- ZIP layout: project files are at archive root; logos/icons are under assets/.
- manifest.json parses and declares 192x192 and 512x512 PNG icons.
- Search routing is per request and does not mutate saved default model settings.
- Live browser installation and live Groq API calls are not verified here; test on published HTTPS GitHub Pages.


## اصلاحات تکمیلی این نسخه
- بررسی ساختاری ZIP و اعتبار JSON manifest انجام می‌شود.
- چهره، تم‌ها، تاریخچه و دکمهٔ نصب به کد افزوده شده‌اند.
- نصب واقعی روی گوشی و APIهای زنده در این محیط قابل تأیید نیستند؛ پس از انتشار باید روی HTTPS آزمایش شوند.
