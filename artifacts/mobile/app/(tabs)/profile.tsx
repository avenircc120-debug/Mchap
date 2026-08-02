import React, { useState } from 'react';
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
import DrawerMenu from '@/components/DrawerMenu';

const { width: W } = Dimensions.get('window');
const GAP    = 1;
const COLS   = 3;
const CELL_W = Math.floor((W - GAP * (COLS - 1)) / COLS);
const CELL_H = Math.floor(CELL_W * 1.33);

type GridEntry = { id: string; videoId: string; title: string; videoUrl: string };

export default function ProfileScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { config, videoId, resetProject } = useSiteConfig();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const topPad    = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const entries: GridEntry[] = [];
  if (videoId) {
    entries.push({ id: '__main__', videoId, title: config.projectName || '', videoUrl: config.youtubeUrl });
  }
  for (const pub of config.publications || []) {
    const vid = extractYouTubeId(pub.videoUrl);
    if (vid && vid !== videoId) {
      entries.push({ id: pub.id, videoId: vid, title: pub.title, videoUrl: pub.videoUrl });
    }
  }

  const handle = config.domainType === 'subdomain'
    ? config.subdomainName ? `@${config.subdomainName}` : '@monprofil'
    : `@${(config.customDomain || '').replace(/^https?:\/\//, '').replace(/\/$/, '') || 'monprofil'}`;

  const initials = (config.projectName || 'M')
    .split(' ').slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '').join('');

  const renderCell = ({ item }: { item: GridEntry }) => {
    const thumb = `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`;
    const url   = `https://www.youtube.com/watch?v=${item.videoId}`;
    return (
      <TouchableOpacity
        style={[styles.cell, { marginRight: GAP, marginBottom: GAP }]}
        onPress={() => Linking.openURL(url)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: thumb }} style={styles.cellImg} resizeMode="cover" />
        <View style={styles.cellBadge}>
          <Feather name="play" size={10} color="#fff" />
          <Text style={styles.cellCount}>0</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── TOP BAR : hamburger en haut à DROITE ── */}
      <View style={[styles.topBar, { paddingTop: topPad + 4 }]}>
        <Text style={[styles.topName, { color: colors.foreground }]} numberOfLines={1}>
          {config.projectName || 'Mon Profil'}
        </Text>
        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: colors.muted }]}
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        numColumns={COLS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 16 }}
        ListHeaderComponent={
          <>
            {/* Infos profil */}
            <View style={styles.profileRow}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{initials || 'M'}</Text>
              </View>
              <View style={styles.statsRow}>
                {[
                  { n: entries.length, l: 'Vidéos' },
                  { n: 0, l: 'Suivis' },
                  { n: 0, l: "J'aime" },
                ].map(({ n, l }) => (
                  <View key={l} style={styles.statBox}>
                    <Text style={[styles.statNum, { color: colors.foreground }]}>{n}</Text>
                    <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.nameBlock}>
              <Text style={[styles.displayName, { color: colors.foreground }]}>
                {config.projectName || 'Mon site'}
              </Text>
              <Text style={[styles.handle, { color: colors.mutedForeground }]}>{handle}</Text>
            </View>

            {/* Onglets grille */}
            <View style={[styles.gridTabs, { borderBottomColor: colors.border }]}>
              <View style={[styles.gridTab, { borderBottomWidth: 2, borderBottomColor: colors.primary }]}>
                <Feather name="grid" size={20} color={colors.primary} />
              </View>
              <View style={styles.gridTab}>
                <Feather name="bookmark" size={20} color={colors.mutedForeground} />
              </View>
              <View style={styles.gridTab}>
                <Feather name="heart" size={20} color={colors.mutedForeground} />
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyGrid}>
            <Feather name="video-off" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucune publication</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Ajoutez une vidéo YouTube dans le Dashboard
            </Text>
          </View>
        }
        renderItem={renderCell}
      />

      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onGoHome={() => { resetProject(); setDrawerOpen(false); }}
        onNewProject={() => { resetProject(); setDrawerOpen(false); }}
        onLogout={() => { resetProject(); setDrawerOpen(false); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  topName: { fontSize: 18, fontWeight: '700', flex: 1, marginRight: 8 },
  menuBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 16,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700' },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center', gap: 2 },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  nameBlock: { paddingHorizontal: 16, paddingBottom: 14, gap: 2 },
  displayName: { fontSize: 15, fontWeight: '600' },
  handle: { fontSize: 13 },
  gridTabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 1 },
  gridTab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  cell: { width: CELL_W, height: CELL_H, overflow: 'hidden', position: 'relative' },
  cellImg: { width: '100%', height: '100%' },
  cellBadge: { position: 'absolute', bottom: 4, left: 4, flexDirection: 'row', alignItems: 'center', gap: 3 },
  cellCount: {
    color: '#fff', fontSize: 11, fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  emptyGrid: { alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
