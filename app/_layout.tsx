import '../global.css';

import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useAppStore } from '@/lib/store';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const mode = useAppStore((s) => s.profile?.mode);
  const setHasHydrated = useAppStore((s) => s.setHasHydrated);
  const segments = useSegments();
  const router = useRouter();
  const ready = hasHydrated && fontsLoaded;

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
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!hasOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasOnboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [ready, hasOnboarded, segments, router]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color="#2F5D50" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={mode === 'tryhard' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: mode === 'tryhard' ? '#1C100C' : '#F4F1EA' },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="privacy"
          options={{
            headerShown: true,
            title: 'Privacidad',
            headerStyle: { backgroundColor: mode === 'tryhard' ? '#24120C' : '#FFFcf7' },
            headerTintColor: mode === 'tryhard' ? '#F6EDE6' : '#1F1A16',
            headerTitleStyle: {
              fontFamily: 'Manrope_600SemiBold',
              color: mode === 'tryhard' ? '#F6EDE6' : '#1F1A16',
            },
          }}
        />
        <Stack.Screen
          name="food"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Registrar comida',
            headerStyle: { backgroundColor: mode === 'tryhard' ? '#24120C' : '#FFFcf7' },
            headerTintColor: mode === 'tryhard' ? '#F6EDE6' : '#1F1A16',
            headerTitleStyle: {
              fontFamily: 'Manrope_600SemiBold',
              color: mode === 'tryhard' ? '#F6EDE6' : '#1F1A16',
            },
          }}
        />
        <Stack.Screen
          name="activity"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Registrar actividad',
            headerStyle: { backgroundColor: mode === 'tryhard' ? '#24120C' : '#FFFcf7' },
            headerTintColor: mode === 'tryhard' ? '#F6EDE6' : '#1F1A16',
            headerTitleStyle: {
              fontFamily: 'Manrope_600SemiBold',
              color: mode === 'tryhard' ? '#F6EDE6' : '#1F1A16',
            },
          }}
        />
      </Stack>
    </>
  );
}
