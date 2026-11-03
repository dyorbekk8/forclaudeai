# 07_render — Remotion project

1920×1080, 30 fps, H.264. Everything on screen is React/SVG code.

```bash
npm install
npx remotion render src/index.ts <CompositionId> out/<slug>.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

`Smoke` composition is the toolchain check (verified rendering 1920×1080 h264).
