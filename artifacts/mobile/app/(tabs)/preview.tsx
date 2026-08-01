import React from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { Feather } from '@expo/vector-icons';
import PreviewWebView from '@/components/PreviewWebView';
import { router } from 'expo-router';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// 9:16 container sizing — fits inside screen with padding
function getPreviewSize() {
  const maxH = SCREEN_H * 0.78;
  const maxW = SCREEN_W - 32;
  const h9by16FromWidth = maxW * (16 / 9);
  if (h9by16FromWidth <= maxH) {
    return { width: maxW, height: h9by16FromWidth };
  }
  return { width: maxH * (9 / 16), height: maxH };
}

export default function PreviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { config, videoId } = useSiteConfig();
  const { width: prevW, height: prevH } = getPreviewSize();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const domainLabel =
    config.domainType === 'subdomain'
      ? config.subdomainName
        ? `${config.subdomainName}.mchap.app`
        : 'votre-site.mchap.app'
      : config.customDomain || 'votre-domaine.com';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad,
          paddingBottom: bottomPad,
        },
      ]}
    >
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.secondary }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={18} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { color: colors.foreground }]}>Aperçu</Text>
          <Text style={[styles.topUrl, { color: colors.mutedForeground }]}>{domainLabel}</Text>
        </View>
        <View style={[styles.livePill, { backgroundColor: colors.secondary }]}>
          <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.liveText, { color: colors.primary }]}>LIVE</Text>
        </View>
      </View>

      {/* 9:16 preview frame */}
      <View style={styles.frameWrapper}>
        <View
          style={[
            styles.phoneFrame,
            {
              width: prevW,
              height: prevH,
              borderColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
        >
          {/* Notch decoration */}
          <View style={[styles.notch, { backgroundColor: colors.foreground }]} />
          {/* Preview content */}
          <View style={styles.previewContent}>
            <PreviewWebView videoId={videoId} adsenseId={config.adsenseId} />
          </View>
          {/* Home bar decoration */}
          <View style={[styles.homeBar, { backgroundColor: colors.mutedForeground }]} />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCenter: {
    flex: 1,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  topUrl: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  frameWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  phoneFrame: {
    borderRadius: 32,
    borderWidth: 2.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  notch: {
    width: 90,
    height: 6,
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 2,
    opacity: 0.3,
  },
  previewContent: {
    flex: 1,
    alignSelf: 'stretch',
  },
  homeBar: {
    width: 100,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    marginTop: 4,
    opacity: 0.4,
  },
});
