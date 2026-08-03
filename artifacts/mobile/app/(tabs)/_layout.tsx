import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AddVideoModal from '@/components/AddVideoModal';

// Minimal inline type — avoids importing @react-navigation/bottom-tabs directly
interface TabBarProps {
  state: {
    routes: Array<{ key: string; name: string }>;
    index: number;
  };
  navigation: {
    emit: (args: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
  descriptors: Record<string, unknown>;
}

// ─── Custom Tab Bar (Classic / Android / Web) ───────────────────────────────
function CustomTabBar({
  state,
  navigation,
  onAddPress,
}: TabBarProps & { onAddPress: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === 'ios';

  // Map route names to visible tab config
  const tabConfig: Record<string, { label: string; icon: React.ComponentProps<typeof Feather>['name']; sfSymbol?: string }> = {
    feed: { label: 'Accueil', icon: 'home', sfSymbol: 'house' },
    profile: { label: 'Profil', icon: 'user', sfSymbol: 'person' },
  };

  const visibleRoutes = state.routes.filter((r) => tabConfig[r.name]);

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        },
      ]}
    >
      {/* Accueil */}
      {visibleRoutes.slice(0, 1).map((route) => {
        const isFocused = state.routes[state.index].name === route.name;
        const cfg = tabConfig[route.name];
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            activeOpacity={0.7}
          >
            {isIOS && cfg.sfSymbol ? (
              <SymbolView
                name={(isFocused ? `${cfg.sfSymbol}.fill` : cfg.sfSymbol) as any}
                tintColor={isFocused ? colors.primary : colors.mutedForeground}
                size={24}
              />
            ) : (
              <Feather name={cfg.icon} size={22} color={isFocused ? colors.primary : colors.mutedForeground} />
            )}
            <Text style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.mutedForeground }]}>
              {cfg.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Central "+" button */}
      <View style={styles.addBtnWrapper}>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onAddPress();
          }}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Profil */}
      {visibleRoutes.slice(1).map((route) => {
        const isFocused = state.routes[state.index].name === route.name;
        const cfg = tabConfig[route.name];
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            activeOpacity={0.7}
          >
            {isIOS && cfg.sfSymbol ? (
              <SymbolView
                name={(isFocused ? `${cfg.sfSymbol}.fill` : cfg.sfSymbol) as any}
                tintColor={isFocused ? colors.primary : colors.mutedForeground}
                size={24}
              />
            ) : (
              <Feather name={cfg.icon} size={22} color={isFocused ? colors.primary : colors.mutedForeground} />
            )}
            <Text style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.mutedForeground }]}>
              {cfg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Native Tab Layout (iOS Liquid Glass) ───────────────────────────────────
function NativeTabLayoutWithModal({ onAddPress }: { onAddPress: () => void }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1 }}>
      <NativeTabs>
        <NativeTabs.Trigger name="feed">
          <Icon sf={{ default: 'house', selected: 'house.fill' }} />
          <Label>Accueil</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf={{ default: 'person', selected: 'person.fill' }} />
          <Label>Profil</Label>
        </NativeTabs.Trigger>
      </NativeTabs>

      {/* Floating "+" button overlay for native tab layout */}
      <View style={styles.nativeFabContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.nativeFab, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onAddPress();
          }}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Root Tab Layout ─────────────────────────────────────────────────────────
export default function TabLayout() {
  const [addModalVisible, setAddModalVisible] = useState(false);

  const handleAddPress = () => setAddModalVisible(true);
  const handleAddClose = () => setAddModalVisible(false);

  if (isLiquidGlassAvailable()) {
    return (
      <>
        <NativeTabLayoutWithModal onAddPress={handleAddPress} />
        <AddVideoModal visible={addModalVisible} onClose={handleAddClose} />
      </>
    );
  }

  return (
    <>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar {...(props as any)} onAddPress={handleAddPress} />
        )}
        screenOptions={{ headerShown: false }}
      >
        {/* Visible tabs */}
        <Tabs.Screen name="feed" />
        <Tabs.Screen name="profile" />

        {/* Hidden screens — still navigable but not in tab bar */}
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="preview" options={{ href: null }} />
      </Tabs>

      <AddVideoModal visible={addModalVisible} onClose={handleAddClose} />
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },

  // Central "+" button
  addBtnWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  addBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  // Floating FAB for native tab layout
  nativeFabContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
