import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import DrawerMenu from '@/components/DrawerMenu';
import PublishModal, { type PublishState } from '@/components/PublishModal';

type Section = 'youtube' | 'adsense' | 'domain';

const SECTIONS: { key: Section; icon: string; label: string }[] = [
  { key: 'youtube', icon: 'youtube', label: 'YouTube' },
  { key: 'adsense', icon: 'dollar-sign', label: 'AdSense' },
  { key: 'domain', icon: 'globe', label: 'Domaine' },
];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { config, setConfig } = useSiteConfig();
  const [activeSection, setActiveSection] = useState<Section>('youtube');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>({ kind: 'idle' });

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  // Completion indicators
  const done: Record<Section, boolean> = {
    youtube: !!config.youtubeUrl,
    adsense: !!config.adsenseId,
    domain: !!(config.subdomainName || config.customDomain),
  };

  const handlePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/preview');
  };

  const handlePublish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPublishState({ kind: 'loading' });
    try {
      const resp = await fetch(
        `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            youtubeUrl: config.youtubeUrl,
            adsenseId: config.adsenseId,
            domainType: config.domainType,
            subdomainName: config.subdomainName,
            customDomain: config.customDomain,
          }),
        },
      );
      const data = await resp.json();
      if (!resp.ok) {
        setPublishState({ kind: 'error', message: data.error ?? 'Erreur inconnue' });
        return;
      }
      setPublishState({
        kind: 'success',
        url: data.url,
        githubUrl: data.githubCommitUrl ?? null,
      });
    } catch (err) {
      setPublishState({ kind: 'error', message: 'Impossible de joindre le serveur.' });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 4,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.hamburger, { backgroundColor: colors.muted }]}
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={20} color={colors.foreground} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Mchap Studio
        </Text>

        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.badgeLetter, { color: colors.primaryForeground }]}>M</Text>
        </View>
      </View>

      {/* ── Section tabs ── */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {SECTIONS.map((s) => {
          const active = activeSection === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[
                styles.tab,
                active && { borderBottomColor: colors.primary, borderBottomWidth: 2.5 },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveSection(s.key);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.tabInner}>
                <Feather
                  name={s.icon as any}
                  size={15}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? colors.primary : colors.mutedForeground },
                    active && styles.tabLabelActive,
                  ]}
                >
                  {s.label}
                </Text>
                {done[s.key] && (
                  <View style={[styles.doneDot, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Section content ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={topPad + 96}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.sectionContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeSection === 'youtube' && (
            <SectionYouTube config={config} setConfig={setConfig} colors={colors} />
          )}
          {activeSection === 'adsense' && (
            <SectionAdSense config={config} setConfig={setConfig} colors={colors} />
          )}
          {activeSection === 'domain' && (
            <SectionDomain config={config} setConfig={setConfig} colors={colors} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom action bar ── */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: bottomPad + 12,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionBtn, styles.previewBtn, { borderColor: colors.primary }]}
          onPress={handlePreview}
          activeOpacity={0.85}
        >
          <Feather name="eye" size={18} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Prévisualiser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.publishBtn, { backgroundColor: colors.primary }]}
          onPress={handlePublish}
          activeOpacity={0.85}
        >
          <Feather name="upload-cloud" size={18} color={colors.primaryForeground} />
          <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>Publier</Text>
        </TouchableOpacity>
      </View>

      {/* ── Drawer & Modal ── */}
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <PublishModal
        state={publishState}
        onClose={() => setPublishState({ kind: 'idle' })}
      />
    </View>
  );
}

// ─── Section: YouTube ────────────────────────────────────────────────────────
function SectionYouTube({
  config,
  setConfig,
  colors,
}: {
  config: ReturnType<typeof useSiteConfig>['config'];
  setConfig: ReturnType<typeof useSiteConfig>['setConfig'];
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={[styles.sectionIcon, { backgroundColor: colors.secondary }]}>
        <Feather name="youtube" size={22} color={colors.primary} />
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Lien YouTube</Text>
      <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
        Collez l'URL de la vidéo à afficher. Elle sera lue automatiquement, en
        mode silencieux, sur votre mini-site.
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: config.youtubeUrl ? colors.primary : colors.input,
            color: colors.foreground,
          },
        ]}
        placeholder="https://www.youtube.com/watch?v=..."
        placeholderTextColor={colors.mutedForeground}
        value={config.youtubeUrl}
        onChangeText={(v) => setConfig({ youtubeUrl: v })}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="done"
      />
      {!!config.youtubeUrl && (
        <View style={[styles.hint, { backgroundColor: colors.secondary }]}>
          <Feather name="check-circle" size={14} color={colors.primary} />
          <Text style={[styles.hintText, { color: colors.primary }]}>Lien détecté ✓</Text>
        </View>
      )}
    </View>
  );
}

// ─── Section: AdSense ────────────────────────────────────────────────────────
function SectionAdSense({
  config,
  setConfig,
  colors,
}: {
  config: ReturnType<typeof useSiteConfig>['config'];
  setConfig: ReturnType<typeof useSiteConfig>['setConfig'];
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={[styles.sectionIcon, { backgroundColor: colors.secondary }]}>
        <Feather name="dollar-sign" size={22} color={colors.primary} />
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Google AdSense</Text>
      <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
        Entrez votre identifiant éditeur AdSense pour afficher une bannière
        publicitaire fixe en haut de votre mini-site.
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: config.adsenseId ? colors.primary : colors.input,
            color: colors.foreground,
          },
        ]}
        placeholder="ca-pub-0000000000000000"
        placeholderTextColor={colors.mutedForeground}
        value={config.adsenseId}
        onChangeText={(v) => setConfig({ adsenseId: v })}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
      />
      <View style={[styles.infoBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="info" size={14} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          Format: ca-pub-XXXXXXXXXXXXXXXXX (16 chiffres)
        </Text>
      </View>
    </View>
  );
}

// ─── Section: Domain ─────────────────────────────────────────────────────────
function SectionDomain({
  config,
  setConfig,
  colors,
}: {
  config: ReturnType<typeof useSiteConfig>['config'];
  setConfig: ReturnType<typeof useSiteConfig>['setConfig'];
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={[styles.sectionIcon, { backgroundColor: colors.secondary }]}>
        <Feather name="globe" size={22} color={colors.primary} />
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nom de domaine</Text>
      <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
        Choisissez l'adresse web de votre mini-site : un sous-domaine gratuit
        ou votre propre domaine.
      </Text>

      {/* Toggle */}
      <View style={[styles.toggle, { backgroundColor: colors.muted }]}>
        {(['subdomain', 'custom'] as const).map((type) => {
          const active = config.domainType === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.toggleBtn, active && { backgroundColor: colors.primary }]}
              onPress={() => setConfig({ domainType: type })}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: active ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {type === 'subdomain' ? 'Sous-domaine gratuit' : 'Domaine personnalisé'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {config.domainType === 'subdomain' ? (
        <View
          style={[
            styles.domainRow,
            { borderColor: config.subdomainName ? colors.primary : colors.input },
          ]}
        >
          <TextInput
            style={[styles.domainInput, { color: colors.foreground, backgroundColor: colors.background }]}
            placeholder="mon-site"
            placeholderTextColor={colors.mutedForeground}
            value={config.subdomainName}
            onChangeText={(v) =>
              setConfig({ subdomainName: v.toLowerCase().replace(/\s/g, '-') })
            }
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          <Text
            style={[
              styles.domainSuffix,
              { color: colors.mutedForeground, backgroundColor: colors.muted },
            ]}
          >
            .mchap.app
          </Text>
        </View>
      ) : (
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: config.customDomain ? colors.primary : colors.input,
              color: colors.foreground,
            },
          ]}
          placeholder="www.mon-domaine.com"
          placeholderTextColor={colors.mutedForeground}
          value={config.customDomain}
          onChangeText={(v) => setConfig({ customDomain: v })}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="done"
        />
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  hamburger: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLetter: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  tabLabelActive: {
    fontFamily: 'Inter_600SemiBold',
  },
  doneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
  },
  sectionContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    gap: 14,
  },
  sectionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  sectionDesc: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Inter_400Regular',
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  hintText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  domainRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    height: 52,
  },
  domainInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  domainSuffix: {
    paddingHorizontal: 12,
    fontSize: 13,
    alignSelf: 'center',
    fontFamily: 'Inter_400Regular',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  previewBtn: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  publishBtn: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
