import React from 'react';
import {
  Dimensions,
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

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { config, setConfig } = useSiteConfig();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handlePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/preview');
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <Text style={[styles.logoLetter, { color: colors.primaryForeground }]}>M</Text>
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Mchap Studio</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Configurez votre mini-site
          </Text>
        </View>
      </View>

      {/* YouTube */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="youtube" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Vidéo YouTube</Text>
        </View>
        <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
          Collez l'URL de la vidéo à afficher sur votre mini-site.
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
      </View>

      {/* AdSense */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="dollar-sign" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Google AdSense</Text>
        </View>
        <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
          Entrez votre identifiant AdSense (ex: ca-pub-XXXXXXXXXX).
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
      </View>

      {/* Domain */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="globe" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Nom de domaine</Text>
        </View>
        <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
          Choisissez un sous-domaine gratuit ou un domaine personnalisé.
        </Text>

        {/* Toggle */}
        <View style={[styles.toggle, { backgroundColor: colors.muted }]}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              config.domainType === 'subdomain' && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setConfig({ domainType: 'subdomain' })}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    config.domainType === 'subdomain'
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                },
              ]}
            >
              Sous-domaine gratuit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              config.domainType === 'custom' && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setConfig({ domainType: 'custom' })}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    config.domainType === 'custom'
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                },
              ]}
            >
              Domaine personnalisé
            </Text>
          </TouchableOpacity>
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
              onChangeText={(v) => setConfig({ subdomainName: v.toLowerCase().replace(/\s/g, '-') })}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <Text style={[styles.domainSuffix, { color: colors.mutedForeground, backgroundColor: colors.muted }]}>
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

      {/* Preview Button */}
      <TouchableOpacity
        style={[styles.previewBtn, { backgroundColor: colors.primary }]}
        onPress={handlePreview}
        activeOpacity={0.85}
      >
        <Feather name="eye" size={20} color={colors.primaryForeground} />
        <Text style={[styles.previewBtnText, { color: colors.primaryForeground }]}>
          Voir l'aperçu 9:16
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  domainRow: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
    height: 48,
  },
  domainInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  domainSuffix: {
    paddingHorizontal: 12,
    fontSize: 13,
    alignSelf: 'center',
    fontFamily: 'Inter_400Regular',
  },
  previewBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  previewBtnText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
