# SABER AI V6 PRO - Final flat SVG build

- Removed the animated intro logo; boot screen and header use the static Saber SVG emblem.
- Removed raster/WebP assets and the assets directory; visual assets are SVG files at the ZIP root.
- Rebuilt the voice avatar as inline SVG: soft rounded white robot, centered direct gaze, blinking eyes, and a mouth that opens/closes during speech playback.
- Retained the three themes and local conversation history.
- Updated the web app manifest and Service Worker cache version for the flat root deployment.
- The mouth motion is speech-state animation, not phoneme-accurate lip synchronization.
