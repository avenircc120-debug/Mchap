import React from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

export type PublishState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; url: string; githubUrl: string | null }
  | { kind: 'error'; message: string };

interface PublishModalProps {
  state: PublishState;
  onClose: () => void;
}

export default function PublishModal({ state, onClose }: PublishModalProps) {
  const colors = useColors();
  const visible = state.kind !== 'idle';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {state.kind === 'loading' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.foreground }]}>
                Déploiement en cours…
              </Text>
              <Text style={[styles.loadingSubText, { color: colors.mutedForeground }]}>
                Publication sur Vercel + GitHub
              </Text>
            </View>
          )}

          {state.kind === 'success' && (
            <View style={styles.center}>
              <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
                <Feather name="check-circle" size={36} color={colors.primary} />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>
                Mini-site publié !
              </Text>
              <TouchableOpacity
                style={[styles.urlBox, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => Linking.openURL(state.url)}
                activeOpacity={0.7}
              >
                <Feather name="external-link" size={14} color={colors.primary} />
                <Text
                  style={[styles.urlText, { color: colors.primary }]}
                  numberOfLines={1}
                >
                  {state.url}
                </Text>
              </TouchableOpacity>

              {state.githubUrl && (
                <TouchableOpacity
                  style={styles.githubLink}
                  onPress={() => Linking.openURL(state.githubUrl!)}
                  activeOpacity={0.7}
                >
                  <Feather name="github" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.githubText, { color: colors.mutedForeground }]}>
                    Voir le commit GitHub
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.primary }]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={[styles.closeBtnText, { color: colors.primaryForeground }]}>
                  Fermer
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {state.kind === 'error' && (
            <View style={styles.center}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
                <Feather name="alert-circle" size={36} color={colors.destructive} />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>
                Erreur de publication
              </Text>
              <Text style={[styles.errorMsg, { color: colors.mutedForeground }]}>
                {state.message}
              </Text>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.primary }]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={[styles.closeBtnText, { color: colors.primaryForeground }]}>
                  Réessayer
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  center: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginTop: 8,
  },
  loadingSubText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
  },
  urlText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  githubLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  githubText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  errorMsg: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  closeBtn: {
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
