import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({
  children,
  scroll = true,
  safeTop = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  safeTop?: boolean;
}) {
  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-10 pt-2"
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1 px-5 pt-2">{children}</View>
  );

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={safeTop ? ['top', 'left', 'right'] : ['left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
