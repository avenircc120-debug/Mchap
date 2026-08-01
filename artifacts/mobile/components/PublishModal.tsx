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
                Mise en ligne en cours…
              </Text>
              <Text style={[styles.loadingSubText, { color: colors.mutedForeground }]}>
                Votre mini-site est en cours de déploiement
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
              <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
                Votre site est maintenant en ligne
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
                style={[styles.closeBtn, { backgroundColor: colors.destructive }]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={[styles.closeBtnText, { color: '#FFFFFF' }]}>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 24,
  },
  center: {
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  loadingSubText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: -8,
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
