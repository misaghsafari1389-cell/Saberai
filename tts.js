/* SABER V6 — Persian TTS Preprocessor */
(function (global) {
  'use strict';

  const ONES = ['صفر','یک','دو','سه','چهار','پنج','شش','هفت','هشت','نه'];
  const TEENS = ['ده','یازده','دوازده','سیزده','چهارده','پانزده','شانزده','هفده','هجده','نوزده'];
  const TENS = ['','','بیست','سی','چهل','پنجاه','شصت','هفتاد','هشتاد','نود'];
  const HUNDREDS = ['','صد','دویست','سیصد','چهارصد','پانصد','ششصد','هفتصد','هشتصد','نهصد'];
  const SCALES = ['','هزار','میلیون','میلیارد','بیلیون'];

  function threeDigit(n) {
    const parts = [];
    const h = Math.floor(n / 100), r = n % 100;
    if (h) parts.push(HUNDREDS[h]);
    if (r) {
      if (r < 10) parts.push(ONES[r]);
      else if (r < 20) parts.push(TEENS[r - 10]);
      else {
        const t = Math.floor(r / 10), o = r % 10;
        parts.push(TENS[t]);
        if (o) parts.push(ONES[o]);
      }
    }
    return parts.join(' و ');
  }

  function numToWords(num) {
    num = parseInt(num, 10);
    if (isNaN(num)) return '';
    if (num === 0) return 'صفر';
    if (num < 0) return 'منفی ' + numToWords(-num);
    const groups = [];
    let n = num;
    while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000); }
    const words = [];
    for (let i = groups.length - 1; i >= 0; i--) {
      if (groups[i] === 0) continue;
      const w = threeDigit(groups[i]);
      words.push(SCALES[i] ? `${w} ${SCALES[i]}` : w);
    }
    return words.join(' و ');
  }

  function normalize(t) {
    return String(t)
      .replace(/\u064A/g, 'ی')
      .replace(/\u0649/g, 'ی')
      .replace(/\u0643/g, 'ک')
      .replace(/\u0629/g, 'ه')
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/\u0640/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stripNonSpeech(t) {
    return String(t)
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, ' لینک ')
      .replace(/www\.\S+/g, ' لینک ')
      .replace(/#{1,6}\s?/g, ' ')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ');
  }

  function convertSymbols(t) {
    // ساعت
    t = t.replace(/\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g, (m, h, mm, ss) => {
      let out = `ساعت ${numToWords(+h)}`;
      if (+mm) out += ` و ${numToWords(+mm)} دقیقه`;
      if (ss) out += ` و ${numToWords(+ss)} ثانیه`;
      return out;
    });
    // درصد
    t = t.replace(/(\d+(?:[.,]\d+)?)\s*%/g, (m, n) => `${numToWords(parseInt(String(n).replace(',', ''), 10))} درصد`);
    // اعشار
    t = t.replace(/(\d+)[.,](\d+)/g, (m, a, b) => `${numToWords(+a)} ممیز ${numToWords(+b)}`);
    // اعداد
    t = t.replace(/\d+/g, (m) => numToWords(+m));
    return t;
  }

  function applyDict(t, dict) {
    const base = {
      'API': 'ای پی آی', 'TTS': 'تی تی اس', 'PDF': 'پی دی اف',
      'AI': 'ای آی', 'URL': 'یو آر ال', 'HTTP': 'اچ تی تی پی'
    };
    const merged = Object.assign({}, base, dict || {});
    const keys = Object.keys(merged).sort((a, b) => b.length - a.length);
    for (const k of keys) {
      if (!k) continue;
      const v = typeof merged[k] === 'object' ? merged[k].speech : merged[k];
      const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        t = t.replace(new RegExp(`(^|[^A-Za-z0-9\\u0600-\\u06FF])${esc}(?=[^A-Za-z0-9\\u0600-\\u06FF]|$)`, 'g'), `$1${v}`);
      } catch (e) {}
    }
    return t;
  }

  global.PersianTTSPreprocessor = {
    prepareForTTS(raw, dict) {
      if (!raw) return '';
      let t = String(raw);
      try {
        t = stripNonSpeech(t);
        t = normalize(t);
        t = convertSymbols(t);
        t = applyDict(t, dict);
        t = t.replace(/\s{2,}/g, ' ').trim();
      } catch (e) { console.warn('TTS preprocessor:', e); }
      return t;
    }
  };
})(window);