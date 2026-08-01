import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
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
const DRAWER_W = Math.min(SCREEN_W * 0.75, 300);

type Section = 'youtube' | 'adsense' | 'domain';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelectSection: (section: Section) => void;
  onNewProject?: () => void;
}

const SECTION_ITEMS: { section: Section; icon: React.ComponentProps<typeof Feather>['name']; label: string }[] = [
  { section: 'youtube', icon: 'youtube', label: 'Lien YouTube' },
  { section: 'adsense', icon: 'dollar-sign', label: 'Google AdSense' },
  { section: 'domain', icon: 'globe', label: 'Nom de domaine' },
];

export default function DrawerMenu({ visible, onClose, onSelectSection, onNewProject }: DrawerMenuProps) {
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
            backgroundColor: '#FFFFFF',
            transform: [{ translateX }],
            paddingTop: topPad + 16,
            paddingBottom: bottomPad + 20,
            borderRightColor: colors.border,
          },
        ]}
      >
        {/* Close button */}
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.muted }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>

        {/* App title */}
        <View style={styles.brandRow}>
          <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.brandName, { color: colors.foreground }]}>Mchap</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Section nav items */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          CONFIGURATION
        </Text>
        <View style={styles.navItems}>
          {SECTION_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.section}
              style={styles.navItem}
              onPress={() => onSelectSection(item.section)}
              activeOpacity={0.7}
            >
              <View style={[styles.navIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
                style={styles.navChevron}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border, marginTop: 8 }]} />

        {/* New project */}
        {onNewProject && (
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              onClose();
              onNewProject();
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.navIcon, { backgroundColor: colors.muted }]}>
              <Feather name="plus-circle" size={18} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.navLabel, { color: colors.mutedForeground }]}>
              Nouveau projet
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
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
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  navItems: {
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
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
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  navChevron: {
    opacity: 0.5,
  },
});
