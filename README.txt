SABER AI V6 PRO

GitHub Pages deployment
- Extract this ZIP. Upload all extracted files directly into the root of the GitHub repository. Do not create or upload an enclosing folder.
- All runtime assets are SVG files at the root; there is no assets/ directory.
- In Settings > Pages, publish from your branch and /(root). Open the resulting HTTPS URL in Chrome on Android.
- If a previous version is cached, remove the old shortcut/app and clear the site's storage before testing again.

Features in this build
- Static Saber emblem; no animated logo intro.
- Inline SVG robot face with a centered gaze, blinking eyes, and mouth motion while speech playback is active. Mouth motion is animation tied to the speaking state, not phoneme-accurate lip-sync.
- Three themes: tactical, midnight blue, and amber.
- Local conversation history.
- Flat ZIP layout and SVG visual assets.

PWA note: install availability depends on the deployed HTTPS origin, browser support, manifest parsing, and service-worker registration. SVG icons are used per the project's all-SVG requirement; some browser/platform combinations may still prefer conventional 192px and 512px PNG icons for the most reliable install prompt. Live installation on a physical phone has not been verified here.
