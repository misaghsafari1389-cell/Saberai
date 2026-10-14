# Change Log

## SABER V6 · ElevenLabs TTS integration
- Added independent ElevenLabs API key storage, separate from Groq chat and Google Gemini TTS keys.
- Added voice-list retrieval from the user's ElevenLabs account and selectable Voice ID.
- Added a Persian voice test and audio playback through ElevenLabs Text-to-Speech using `eleven_v3` and language code `fa`.
- Online speech now prioritizes ElevenLabs when its key is configured; existing Gemini and Google Translate fallbacks remain in place when ElevenLabs is not configured.
- Bumped the service-worker cache version to ensure GitHub Pages clients fetch the updated app.
- No API key is embedded in the project.
