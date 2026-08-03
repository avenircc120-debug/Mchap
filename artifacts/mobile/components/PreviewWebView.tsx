import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

// Only import WebView on native platforms to avoid the React Native WebView error on web
let WebView: React.ComponentType<any> | null = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    WebView = require('react-native-webview').WebView;
  } catch {
    WebView = null;
  }
}

// ── JS injected to block every external navigation inside the preview ─────────
const ANTI_REDIRECT_JS = `
(function() {
  // Block all <a> clicks
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (el && el.tagName === 'A') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Disable window.open (popups / new tabs)
  window.open = function() { return null; };

  // Prevent location.href assignments
  try {
    var _desc = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
    if (_desc && _desc.set) {
      Object.defineProperty(window.location, 'href', {
        set: function() { /* blocked */ },
        get: _desc.get ? _desc.get.bind(window.location) : function() { return ''; },
        configurable: true,
      });
    }
  } catch(_) {}

  true;
})();
`;

interface PreviewWebViewProps {
  videoId: string | null;
  adsenseId: string;
}

function buildPreviewHTML(videoId: string | null, adsenseId: string): string {
  const adBlock = adsenseId
    ? `
      <ins class="adsbygoogle"
        style="display:inline-block;width:320px;height:50px"
        data-ad-client="${adsenseId}"
        data-ad-slot="auto">
      </ins>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}" crossorigin="anonymous"></script>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`
    : `<div class="ad-placeholder"><span>Bannière Google AdSense</span></div>`;

  const videoBlock = videoId
    ? `<div style="position:relative;width:100%;height:100%;">
        <iframe
          id="yt-player"
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1&enablejsapi=1"
          allow="autoplay; encrypted-media; fullscreen"
          allowfullscreen
          frameborder="0"
          style="width:100%;height:100%;border:none;"
        ></iframe>
        <button id="unmute-btn" onclick="unmuteVideo()" style="
          position:absolute;bottom:54px;right:10px;
          background:rgba(0,0,0,0.72);color:#fff;border:none;border-radius:20px;
          padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;
          display:flex;align-items:center;gap:6px;z-index:99;
          backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
        ">🔇 Son coupé — Appuyez</button>
        <script>
          var muted = true;
          var player;
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('yt-player', {
              events: { onReady: function() {} }
            });
          }
          function unmuteVideo() {
            var btn = document.getElementById('unmute-btn');
            if (muted) {
              if (player && player.unMute) { player.unMute(); player.setVolume(100); }
              btn.textContent = '🔊 Son activé';
              btn.style.background = 'rgba(5,150,105,0.85)';
              muted = false;
              setTimeout(function(){ btn.style.display='none'; }, 2000);
            }
          }
        </script>
        <script src="https://www.youtube.com/iframe_api"></script>
      </div>`
    : `<div class="video-placeholder">
        <div class="play-btn">
          <div class="triangle"></div>
        </div>
        <p>Collez un lien YouTube<br/>pour voir la vidéo</p>
      </div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; font-family: -apple-system, Arial, sans-serif; }
    /* Block pointer events on any anchor in the page to prevent accidental taps */
    a { pointer-events: none !important; cursor: default !important; }
    .adsense-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 60px;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }
    .ad-placeholder {
      width: 320px;
      height: 50px;
      background: #f0fdf4;
      border: 1.5px dashed #059669;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ad-placeholder span {
      font-size: 11px;
      color: #059669;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .video-container {
      position: absolute;
      top: 60px; left: 0; right: 0; bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }
    .video-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      color: #9ca3af;
    }
    .play-btn {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .triangle {
      width: 0; height: 0;
      border-top: 14px solid transparent;
      border-bottom: 14px solid transparent;
      border-left: 22px solid white;
      margin-left: 5px;
    }
    .video-placeholder p {
      font-size: 13px;
      text-align: center;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="adsense-bar">
    ${adBlock}
  </div>
  <div class="video-container">
    ${videoBlock}
  </div>
</body>
</html>`;
}

export default function PreviewWebView({ videoId, adsenseId }: PreviewWebViewProps) {
  const colors = useColors();
  const html = useMemo(
    () => buildPreviewHTML(videoId, adsenseId),
    [videoId, adsenseId],
  );

  // ── Web platform: strict sandbox — no popups, no top-navigation ────────────
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <iframe
          srcDoc={html}
          style={{
            border: 'none',
            width: '100%',
            height: '100%',
            display: 'block',
            flex: 1,
          }}
          allow="autoplay; encrypted-media; fullscreen"
          // Removed: allow-popups, allow-top-navigation, allow-forms
          // Only scripts + same-origin so YouTube embed works; nothing can open external URLs
          sandbox="allow-scripts allow-same-origin"
          title="Aperçu du mini-site"
        />
      </View>
    );
  }

  // ── Native platforms: react-native-webview with anti-redirect guards ────────
  if (!WebView) {
    return <View style={[styles.container, { backgroundColor: '#000' }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scrollEnabled={false}
        originWhitelist={['*']}
        mixedContentMode="always"
        // ── Anti-redirect: block top-frame navigations ─────────────────────────
        onShouldStartLoadWithRequest={(req) => {
          // Allow initial blank load and data/blob URIs
          if (
            req.url === 'about:blank' ||
            req.url.startsWith('blob:') ||
            req.url.startsWith('data:')
          ) {
            return true;
          }
          // Block any top-frame navigation attempt (link clicks, location.href, etc.)
          if (req.isTopFrame) return false;
          // Allow sub-frame navigations (YouTube embed internal requests)
          return true;
        }}
        // Block target="_blank" and window.open on Android
        setSupportMultipleWindows={false}
        // ── Anti-redirect: JS layer ─────────────────────────────────────────────
        injectedJavaScript={ANTI_REDIRECT_JS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
