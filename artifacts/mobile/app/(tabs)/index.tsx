import React, { useState } from 'react';
import {
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

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { config, setConfig } = useSiteConfig();
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>({ kind: 'idle' });

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

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
    } catch {
      setPublishState({ kind: 'error', message: 'Impossible de joindre le serveur.' });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: '#FFFFFF' }]}>

      {/* ── Header — hamburger only ── */}
      <View style={[styles.header, { paddingTop: topPad + 4 }]}>
        <TouchableOpacity
          style={[styles.hamburger, { backgroundColor: colors.muted }]}
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* ── Main content — empty until a section is selected ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={topPad + 60}
      >
        {activeSection === null ? (
          <View style={styles.emptyState} />
        ) : (
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
        )}
      </KeyboardAvoidingView>

      {/* ── Bottom — Prévisualiser + Publier only ── */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: bottomPad + 12,
            borderTopColor: colors.border,
            backgroundColor: '#FFFFFF',
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
      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectSection={(section) => {
          setActiveSection(section);
          setDrawerOpen(false);
        }}
      />
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
            backgroundColor: '#FFFFFF',
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
            backgroundColor: '#FFFFFF',
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
            style={[styles.domainInput, { color: colors.foreground, backgroundColor: '#FFFFFF' }]}
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
              backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  hamburger: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    flex: 1,
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
