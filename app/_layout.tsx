import '../global.css';

import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useAppStore } from '@/lib/store';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const setHasHydrated = useAppStore((s) => s.setHasHydrated);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const finish = () => setHasHydrated(true);
    if (useAppStore.persist.hasHydrated()) {
      finish();
      return;
    }
    const unsub = useAppStore.persist.onFinishHydration(finish);
    const timeout = setTimeout(finish, 4000);
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [setHasHydrated]);

  useEffect(() => {
    if (hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!hasOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasOnboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasHydrated, hasOnboarded, segments, router]);

  if (!hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color="#2F5D50" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F4F1EA' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="food" options={{ presentation: 'modal', headerShown: true, title: 'Registrar comida' }} />
        <Stack.Screen
          name="activity"
          options={{ presentation: 'modal', headerShown: true, title: 'Registrar actividad' }}
        />
      </Stack>
    </>
  );
}
