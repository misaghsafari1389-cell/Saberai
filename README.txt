SABER AI V6 PRO — GitHub Pages package

All files are at the ZIP root. There is no assets/ folder and no raster images.

Quick setup:
1. Extract this ZIP.
2. Upload every extracted file to the root of your GitHub repository.
3. In Settings > Pages choose Deploy from a branch, branch main, folder /(root).
4. Open the published HTTPS address on your phone.
5. In Settings, create and save your own Replicavox API key, then press Test Persian Voice.

Replicavox integration:
- API base: https://api.replicavox.com/v1
- Speech endpoint: POST /audio/speech
- Model: replicavox-expressive-v2
- Voice default: Archer (editable in Settings)
- Requested language code: fa
- Free plan advertised by Replicavox: 15,000 characters/month with API access.
- Persian output quality/support is not confirmed by the service docs, so use the in-app test before relying on it.
- API key is stored in this browser's LocalStorage. GitHub Pages is static, so browser-side API keys can be inspected; use only a key you are comfortable using client-side.

Voice fallback priority when online TTS is enabled: Replicavox, ElevenLabs if configured, then the existing Google Translate TTS fallback.

The app logo and PWA icon use the Saber emblem SVG. The animated voice character is a separate inline SVG face. PWA icon is SVG-only per project requirements; some Android/Chrome installability checks may still prefer PNG icons at 192x192 and 512x512.
