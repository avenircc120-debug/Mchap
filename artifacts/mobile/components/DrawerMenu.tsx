import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

const SCREEN_W = Dimensions.get('window').width;
const DRAWER_W = Math.min(SCREEN_W * 0.78, 310);

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  onGoHome?: () => void;       // Retour à la liste des projets
  onNewProject?: () => void;   // Créer un nouveau projet
  onSettings?: () => void;     // Paramètres généraux
  onLogout?: () => void;       // Déconnexion
  userEmail?: string;          // E-mail affiché dans le profil
}

type NavItem = {
  id: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  sublabel?: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
};

export default function DrawerMenu({
  visible,
  onClose,
  onGoHome,
  onNewProject,
  onSettings,
  onLogout,
  userEmail,
}: DrawerMenuProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-DRAWER_W)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_W,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 24 : insets.bottom;

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            onClose();
            onLogout?.();
          },
        },
      ],
    );
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@mchap.app?subject=Support%20Mchap');
  };

  const mainItems: NavItem[] = [
    {
      id: 'home',
      icon: 'grid',
      label: 'Mes projets',
      sublabel: 'Voir tous vos mini-sites',
      onPress: () => { onClose(); onGoHome?.(); },
    },
    {
      id: 'new',
      icon: 'plus-circle',
      label: 'Nouveau projet',
      sublabel: 'Créer un mini-site',
      onPress: () => { onClose(); onNewProject?.(); },
    },
  ];

  const accountItems: NavItem[] = [
    {
      id: 'settings',
      icon: 'settings',
      label: 'Paramètres',
      sublabel: 'Configuration du compte',
      onPress: () => { onClose(); onSettings?.(); },
    },
    {
      id: 'support',
      icon: 'help-circle',
      label: 'Aide & Support',
      sublabel: 'Contacter l'assistance',
      onPress: () => { onClose(); handleContact(); },
    },
  ];

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_W,
            backgroundColor: colors.background,
            transform: [{ translateX }],
            paddingTop: topPad + 12,
            paddingBottom: bottomPad + 20,
            borderRightColor: colors.border,
          },
        ]}
      >
        {/* Close */}
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.muted }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>

        {/* ── Profil utilisateur ── */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Feather name="user" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.foreground }]} numberOfLines={1}>
              Mon Compte
            </Text>
            <Text style={[styles.profileEmail, { color: colors.mutedForeground }]} numberOfLines={1}>
              {userEmail || 'Aucun compte connecté'}
            </Text>
          </View>
          <Feather name="edit-2" size={14} color={colors.mutedForeground} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ── Navigation principale ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NAVIGATION</Text>
        <View style={styles.navGroup}>
          {mainItems.map((item) => (
            <NavRow key={item.id} item={item} colors={colors} />
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border, marginTop: 8 }]} />

        {/* ── Compte & Support ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>COMPTE</Text>
        <View style={styles.navGroup}>
          {accountItems.map((item) => (
            <NavRow key={item.id} item={item} colors={colors} />
          ))}
        </View>

        {/* ── Spacer ── */}
        <View style={{ flex: 1 }} />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ── Déconnexion ── */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={[styles.logoutText, { color: '#EF4444' }]}>Déconnexion</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Sub-component ──
function NavRow({ item, colors }: { item: NavItem; colors: ReturnType<typeof useColors> }) {
  return (
    <TouchableOpacity
      style={[styles.navItem, { backgroundColor: 'transparent' }]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.navIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={item.icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.navLabel, { color: colors.foreground }]}>{item.label}</Text>
        {item.sublabel ? (
          <Text style={[styles.navSublabel, { color: colors.mutedForeground }]}>{item.sublabel}</Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ opacity: 0.5 }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: 1,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  navGroup: {
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  navIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  navSublabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
