import React, { useMemo } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Only import WebView on native to avoid RN WebView errors on web
let WebView: React.ComponentType<any> | null = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    WebView = require('react-native-webview').WebView;
  } catch {
    WebView = null;
  }
}

// ── JS injected into the WebView to block ALL external navigations ────────────
const ANTI_REDIRECT_JS = `
(function() {
  // 1. Block every <a> click
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (el && el.tagName === 'A') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // 2. Disable window.open (new tabs / popups)
  window.open = function() { return null; };

  // 3. Prevent location changes
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

  true; // required return value for injectedJavaScript
})();
`;

function buildPlayerHTML(videoId: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
    iframe {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&controls=1&rel=0&modestbranding=1&iv_load_policy=3"
    allow="autoplay; encrypted-media; fullscreen"
    allowfullscreen
    frameborder="0"
  ></iframe>
</body>
</html>`;
}

interface VideoPlayerModalProps {
  videoId: string | null;
  title?: string;
  visible: boolean;
  onClose: () => void;
}

export default function VideoPlayerModal({
  videoId,
  title,
  visible,
  onClose,
}: VideoPlayerModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const html = useMemo(
    () => (videoId ? buildPlayerHTML(videoId) : ''),
    [videoId],
  );

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // ── Web fallback (iframe with strict sandbox — no popups, no top-nav) ──────
  const WebContent = () => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          srcDoc={html}
          style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
          allow="autoplay; encrypted-media; fullscreen"
          // no allow-popups, no allow-top-navigation → links cannot escape
          sandbox="allow-scripts allow-same-origin"
          title="Lecteur vidéo"
        />
      );
    }

    if (!WebView) return null;

    return (
      <WebView
        source={{ html }}
        style={styles.webview}
        // ── Playback ──────────────────────────────────────────────────────────
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
        // ── Anti-redirect: native layer ───────────────────────────────────────
        // Block any top-frame navigation that is not our initial blank load
        onShouldStartLoadWithRequest={(req) => {
          // Allow initial blank page load and blob/data URIs
          if (
            req.url === 'about:blank' ||
            req.url.startsWith('blob:') ||
            req.url.startsWith('data:')
          ) {
            return true;
          }
          // Allow only if NOT a top-frame navigation
          // (YouTube embed does sub-frame navigations — those are fine)
          if (req.isTopFrame) return false;
          return true;
        }}
        // Block new windows on Android (target="_blank" etc.)
        setSupportMultipleWindows={false}
        // ── Anti-redirect: JS layer ───────────────────────────────────────────
        injectedJavaScript={ANTI_REDIRECT_JS}
        // General
        scrollEnabled={false}
        originWhitelist={['*']}
        mixedContentMode="always"
        startInLoadingState={false}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        {/* Close button */}
        <TouchableOpacity
          style={[
            styles.closeBtn,
            { top: insets.top + 10, backgroundColor: 'rgba(0,0,0,0.55)' },
          ]}
          onPress={handleClose}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Title bar */}
        {!!title && (
          <View style={[styles.titleBar, { top: insets.top + 8 }]}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* Player */}
        <View style={styles.playerWrapper}>
          <WebContent />
        </View>

        {/* "Lecture isolée" badge */}
        <View
          style={[
            styles.badge,
            { bottom: insets.bottom + 16, backgroundColor: 'rgba(5,150,105,0.85)' },
          ]}
        >
          <Feather name="shield" size={12} color="#FFFFFF" />
          <Text style={styles.badgeText}>Lecture isolée — sans redirection</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    alignSelf: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
  titleBar: {
    position: 'absolute',
    left: 60,
    right: 60,
    zIndex: 10,
    alignItems: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  badge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
