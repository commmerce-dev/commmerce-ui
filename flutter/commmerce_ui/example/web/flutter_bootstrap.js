{{flutter_js}}
{{flutter_build_config}}

// The web demo is served at commmerce.com/commmerceui/flutter/; its code, assets, the CanvasKit engine and
// the fallback fonts all load from cdn.commmerce.com (same files, Cloudflare Worker route), not Google.
// scripts/flutter-web-mirror.mjs copies CanvasKit and the fallback fonts into the build after `flutter build web`.
const CDN = 'https://cdn.commmerce.com/commmerceui/flutter/';
_flutter.loader.load({
  serviceWorkerSettings: {
    serviceWorkerVersion: {{flutter_service_worker_version}},
  },
  config: {
    entryPointBaseUrl: CDN,
    assetBase: CDN,
    // CanvasKit stays on Google's CDN until cdn.commmerce.com serves .wasm as application/wasm
    // (it sends application/octet-stream, and Flutter then fails to start: blank page, 23 Nov 2026).
    // To switch: add canvasKitBaseUrl: CDN + 'canvaskit/' and canvasKitVariant: 'full' back here.
    fontFallbackBaseUrl: CDN + 'fallback-fonts/',
  },
});
