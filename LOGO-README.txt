SABER AI logo and PWA icons

- assets/saber-logo-animated.svg: animated vector logo used in the app header, loading screen, and browser favicon.
- assets/saber-icon-192.png: 192x192 PWA / Apple touch icon generated from the SABER logo.
- assets/saber-icon-512.png: 512x512 standard PWA icon generated from the same logo.
- assets/saber-icon-512-maskable.png: 512x512 maskable PWA icon with extra safe-area padding.
- manifest.json declares the actual PNG assets explicitly. sw.js precaches all icon assets.

If GitHub Pages is hosted under a repository path, keep the relative paths unchanged. GitHub's web interface does not unpack ZIP files: extract the archive and upload the contents.
