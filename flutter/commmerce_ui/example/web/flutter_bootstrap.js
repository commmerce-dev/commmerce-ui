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
    // Needs .wasm served as application/wasm (blog server /etc/nginx/mime.types, 23 Nov 2026); with any other
    // type Flutter fails to start and the page stays blank.
    canvasKitBaseUrl: CDN + 'canvaskit/',
    canvasKitVariant: 'full',
    fontFallbackBaseUrl: CDN + 'fallback-fonts/',
  },
});
