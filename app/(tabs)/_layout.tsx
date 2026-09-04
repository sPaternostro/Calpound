import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { View, type ColorValue } from 'react-native';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppStore } from '@/lib/store';
import { paletteFor } from '@/lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  color,
  focused,
  pill,
}: {
  name: IconName;
  color: ColorValue;
  focused: boolean;
  pill: string;
}) {
  return (
    <View
      className="items-center justify-center rounded-xl"
      style={{
        width: 36,
        height: 28,
        backgroundColor: focused ? pill : 'transparent',
      }}>
      <Ionicons name={name} color={color} size={20} />
    </View>
  );
}

export default function TabLayout() {
  const mode = useAppStore((s) => s.profile?.mode);
  const theme = paletteFor(mode);
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.hex.tabActive,
        tabBarInactiveTintColor: theme.hex.tabInactive,
        safeAreaInsets: { bottom: 0 },
        tabBarStyle: {
          backgroundColor: theme.hex.tabBg,
          borderTopColor: theme.hex.tabBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: bottomPad,
          minHeight: 52 + bottomPad,
        },
        tabBarItemStyle: { overflow: 'visible', paddingTop: 2 },
        tabBarIconStyle: { marginTop: 0 },
        tabBarLabelStyle: {
          fontFamily: 'Manrope_600SemiBold',
          fontSize: 11,
          marginTop: 2,
          marginBottom: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home-outline" color={color} focused={focused} pill={theme.hex.tabPill} />
          ),
        }}
      />
      <Tabs.Screen
        name="bank"
        options={{
          title: 'Banco',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="wallet-outline" color={color} focused={focused} pill={theme.hex.tabPill} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="calendar-outline" color={color} focused={focused} pill={theme.hex.tabPill} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Logros',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="ribbon-outline" color={color} focused={focused} pill={theme.hex.tabPill} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings-outline" color={color} focused={focused} pill={theme.hex.tabPill} />
          ),
        }}
      />
    </Tabs>
  );
}
