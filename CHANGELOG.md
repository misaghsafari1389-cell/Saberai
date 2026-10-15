# Changelog

## Replicavox flat SVG package
- Added Replicavox API key and voice settings, save/remove actions, status text, and Persian TTS test.
- Added Replicavox as the first online TTS provider, retaining ElevenLabs and the existing Google Translate fallback.
- Requests use the OpenAI-compatible Replicavox endpoint, model `replicavox-expressive-v2`, MP3 output, and `language: fa`.
- Kept all files at archive root with no assets folder and no raster images.
- Improved the separate inline SVG robot face and standalone `saber-face.svg`.
- Set the PWA icon SVG to the Saber emblem rather than the character face.
- Updated the Service Worker cache name.
