# Test report

Automated checks performed on this archive:
- ZIP integrity check passed.
- ZIP contains only root-level files; no enclosing directory and no assets/ folder.
- Runtime visual files are SVG; no PNG or WebP assets are included.
- Manifest parses as JSON and points to root-level SVG icon.
- JavaScript syntax check passed (Node.js `--check`).
- HTML avatar uses inline SVG elements; the SVG mouth's radius is changed while audio playback is marked as speaking.
- Service Worker cache name was bumped to invalidate older cached app files.

Not verified in this environment:
- Live GitHub Pages deployment and installation prompt on a real Android phone.
- Live Groq/ElevenLabs API responses.
- Phoneme-level lip synchronization. Mouth motion follows the speaking state and varies over time, but is not matched to individual spoken phonemes.

PWA caution: SVG manifest icons satisfy the project's all-SVG asset constraint, but some installability checks/platforms may be more reliable with PNG icons at 192x192 and 512x512.
