import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { extractYouTubeId } from '@/context/SiteConfigContext';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface AddVideoModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (url: string) => void;
}

const PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'Vimeo'];

function isValidVideoUrl(url: string): boolean {
  return (
    url.trim().length > 10 &&
    (url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('tiktok.com') ||
      url.includes('instagram.com') ||
      url.includes('vimeo.com') ||
      url.startsWith('http'))
  );
}

function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export default function AddVideoModal({ visible, onClose, onConfirm }: AddVideoModalProps) {
  const colors = useColors();
  const [url, setUrl] = useState('');
  const [hasPreview, setHasPreview] = useState(false);

  const valid = isValidVideoUrl(url);
  const youtubeId = extractYouTubeId(url);

  const handleValidate = () => {
    if (!valid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHasPreview(true);
  };

  const handleConfirm = () => {
    if (!valid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onConfirm?.(url.trim());
    handleClose();
  };

  const handleClose = () => {
    setUrl('');
    setHasPreview(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            {/* Pull handle */}
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  Ajouter une vidéo
                </Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                  Collez le lien de votre vidéo
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.muted }]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Feather name="x" size={18} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* URL input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  Lien de la vidéo
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.muted,
                      borderColor: valid
                        ? colors.primary
                        : url.length > 0
                        ? colors.border
                        : colors.input,
                    },
                  ]}
                >
                  <Feather
                    name="link"
                    size={16}
                    color={colors.mutedForeground}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="https://www.youtube.com/watch?v=..."
                    placeholderTextColor={colors.mutedForeground}
                    value={url}
                    onChangeText={(v) => {
                      setUrl(v);
                      setHasPreview(false);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    returnKeyType="done"
                    onSubmitEditing={handleValidate}
                  />
                  {url.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setUrl('');
                        setHasPreview(false);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="x-circle" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Platform chips */}
                <View style={styles.platforms}>
                  {PLATFORMS.map((p) => (
                    <View
                      key={p}
                      style={[styles.platformTag, { backgroundColor: colors.secondary }]}
                    >
                      <Text style={[styles.platformText, { color: colors.primary }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Validate button */}
              {!hasPreview && (
                <TouchableOpacity
                  style={[
                    styles.validateBtn,
                    { backgroundColor: valid ? colors.primary : colors.muted },
                  ]}
                  onPress={handleValidate}
                  activeOpacity={0.85}
                  disabled={!valid}
                >
                  <Feather
                    name="eye"
                    size={16}
                    color={valid ? '#FFFFFF' : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.validateBtnText,
                      { color: valid ? '#FFFFFF' : colors.mutedForeground },
                    ]}
                  >
                    Prévisualiser
                  </Text>
                </TouchableOpacity>
              )}

              {/* ── Preview zone ── */}
              {hasPreview && (
                <View style={styles.previewSection}>
                  <Text style={[styles.previewLabel, { color: colors.foreground }]}>
                    Aperçu — vidéo nettoyée
                  </Text>

                  {/* Real preview */}
                  <View
                    style={[
                      styles.playerContainer,
                      { borderColor: colors.border, overflow: 'hidden' },
                    ]}
                  >
                    {youtubeId ? (
                      /* YouTube: real thumbnail */
                      <>
                        <Image
                          source={{ uri: ytThumb(youtubeId) }}
                          style={styles.playerScreen}
                          resizeMode="cover"
                        />
                        <View style={styles.playBtnSim}>
                          <Feather name="play" size={30} color="#FFFFFF" />
                        </View>
                      </>
                    ) : (
                      /* Non-YouTube: dark placeholder */
                      <View style={[styles.playerScreen, { alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
                        <Feather name="video" size={36} color="rgba(255,255,255,0.6)" />
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center', paddingHorizontal: 16 }}>
                          Aperçu disponible à la lecture
                        </Text>
                      </View>
                    )}

                    {/* Clean badge */}
                    <View
                      style={[styles.cleanBadge, { backgroundColor: colors.primary }]}
                    >
                      <Feather name="check-circle" size={10} color="#FFFFFF" />
                      <Text style={styles.cleanBadgeText}>
                        Sans logo · Sans filigrane
                      </Text>
                    </View>
                  </View>

                  {/* Clean features list */}
                  <View
                    style={[
                      styles.featuresBox,
                      { backgroundColor: colors.secondary, borderColor: colors.accent },
                    ]}
                  >
                    {[
                      { icon: 'shield-off' as const, text: 'Logo de la plateforme retiré' },
                      { icon: 'eye-off' as const, text: 'Filigranes supprimés' },
                      { icon: 'maximize-2' as const, text: 'Lecture plein écran propre' },
                    ].map((f, i) => (
                      <View
                        key={i}
                        style={[
                          styles.featureRow,
                          i < 2 && {
                            borderBottomWidth: 1,
                            borderBottomColor: colors.accent,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.featureIconCircle,
                            { backgroundColor: colors.accent },
                          ]}
                        >
                          <Feather name={f.icon} size={13} color={colors.primary} />
                        </View>
                        <Text style={[styles.featureText, { color: colors.primary }]}>
                          {f.text}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Confirm button */}
                  <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                    onPress={handleConfirm}
                    activeOpacity={0.85}
                  >
                    <Feather name="plus-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.confirmBtnText}>Ajouter cette vidéo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  scrollContent: { paddingBottom: 32 },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  platforms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  platformTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  platformText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  validateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    marginBottom: 8,
  },
  validateBtnText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },

  // Preview section
  previewSection: { gap: 14 },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },

  // Player
  playerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  playerScreen: {
    height: 180,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnSim: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cleanBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  playerControls: {
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  playerUrl: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '35%',
    borderRadius: 2,
  },
  playerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  playMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Features
  featuresBox: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  featureIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },

  // Confirm
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    marginTop: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
