import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSiteConfig, extractYouTubeId } from '@/context/SiteConfigContext';
import { Feather } from '@expo/vector-icons';

const { width: W, height: H } = Dimensions.get('window');

function ytThumb(vid: string) {
  return `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
}

type FeedEntry = {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  buyEnabled: boolean;
  buyUrl: string;
  buyText: string;
};

export default function FeedScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { config, videoId, activeProjectId } = useSiteConfig();
  const topPad    = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const ITEM_H    = H;

  const shopUrl =
    config.shopUrl ||
    (config.domainType === 'subdomain' && config.subdomainName
      ? `https://${config.subdomainName}.mchap.app`
      : config.customDomain || '');

  const entries: FeedEntry[] = [];
  if (videoId) {
    entries.push({
      id: '__main__',
      videoId,
      title: config.projectName || 'Ma vidéo',
      description: '',
      buyEnabled: config.shopEnabled,
      buyUrl: config.shopUrl || shopUrl,
      buyText: config.shopButtonText || 'Voir la boutique',
    });
  }
  for (const pub of config.publications || []) {
    const vid = extractYouTubeId(pub.videoUrl);
    if (vid && vid !== videoId) {
      entries.push({
        id: pub.id,
        videoId: vid,
        title: pub.title || config.projectName || '',
        description: pub.description,
        buyEnabled: pub.buyButtonEnabled,
        buyUrl: pub.buyButtonUrl || shopUrl,
        buyText: pub.buyButtonText || config.shopButtonText || 'Voir la boutique',
      });
    }
  }

  const renderItem = ({ item }: { item: FeedEntry }) => {
    const url = `https://www.youtube.com/watch?v=${item.videoId}`;
    return (
      <View style={[styles.item, { height: ITEM_H }]}>
        {/* Thumbnail */}
        <Image
          source={{ uri: ytThumb(item.videoId) }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {/* Dark gradient */}
        <View style={styles.gradient} />

        {/* Centre — play button */}
        <TouchableOpacity
          style={styles.playZone}
          onPress={() => Linking.openURL(url)}
          activeOpacity={0.85}
        >
          <View style={styles.playCircle}>
            <Feather name="play" size={34} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Bottom — title + buy button */}
        <View style={[styles.bottom, { paddingBottom: bottomPad + 72 }]}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          {!!item.description && (
            <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
          )}
          {item.buyEnabled && !!item.buyUrl && (
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => Linking.openURL(item.buyUrl)}
              activeOpacity={0.85}
            >
              <Feather name="shopping-bag" size={16} color="#fff" />
              <Text style={styles.buyLabel}>{item.buyText}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Right — actions */}
        <View style={[styles.actions, { top: topPad + 56 }]}>
          <View style={styles.actionItem}>
            <Feather name="heart" size={28} color="#fff" />
            <Text style={styles.actionLabel}>0</Text>
          </View>
          <View style={styles.actionItem}>
            <Feather name="message-circle" size={28} color="#fff" />
            <Text style={styles.actionLabel}>0</Text>
          </View>
          <TouchableOpacity style={styles.actionItem} onPress={() => Linking.openURL(url)} activeOpacity={0.7}>
            <Feather name="share-2" size={26} color="#fff" />
            <Text style={styles.actionLabel}>Partager</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!activeProjectId || entries.length === 0) {
    const msg = !activeProjectId
      ? 'Ouvrez un projet depuis le Dashboard'
      : 'Ajoutez un lien YouTube dans le Dashboard';
    return (
      <View style={[styles.empty, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Feather name={activeProjectId ? 'video-off' : 'film'} size={52} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          {activeProjectId ? 'Fil vide' : 'Aucun projet actif'}
        </Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>{msg}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={ITEM_H}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: ITEM_H, offset: ITEM_H * i, index: i })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: { width: W, position: 'relative', overflow: 'hidden', backgroundColor: '#000' },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playZone: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 72,
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  desc: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF3C00',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  buyLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  actions: {
    position: 'absolute',
    right: 10,
    gap: 22,
    alignItems: 'center',
  },
  actionItem: { alignItems: 'center', gap: 4 },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
