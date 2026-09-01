import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Pantalla no encontrada' }} />
      <View className="flex-1 items-center justify-center bg-cream px-6">
        <AppText className="mb-4 text-lg">Esa pantalla no está en Calpound.</AppText>
        <Link href="/" className="rounded-2xl bg-forest px-5 py-3">
          <AppText className="font-semibold text-paper">Volver al inicio</AppText>
        </Link>
      </View>
    </>
  );
}
