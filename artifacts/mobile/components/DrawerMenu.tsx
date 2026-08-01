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
import { router } from 'expo-router';

const SCREEN_W = Dimensions.get('window').width;
const DRAWER_W = Math.min(SCREEN_W * 0.75, 300);

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: 'sliders' as const, label: 'Dashboard', route: '/(tabs)/' },
  { icon: 'eye' as const, label: 'Aperçu 9:16', route: '/(tabs)/preview' },
];

export default function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
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

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

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
            paddingTop: topPad + 16,
            borderRightColor: colors.border,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <View style={[styles.drawerLogo, { backgroundColor: colors.primary }]}>
            <Text style={[styles.drawerLogoLetter, { color: colors.primaryForeground }]}>M</Text>
          </View>
          <View>
            <Text style={[styles.drawerTitle, { color: colors.foreground }]}>Mchap Studio</Text>
            <Text style={[styles.drawerSub, { color: colors.mutedForeground }]}>Mini-site builder</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Nav items */}
        <View style={styles.navItems}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, { borderRadius: 12 }]}
              onPress={() => {
                onClose();
                router.push(item.route as any);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.navIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Footer info */}
        <View style={styles.drawerFooter}>
          <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Connecté à GitHub & Vercel
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  drawerLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLogoLetter: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  drawerSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  navItems: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  drawerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
