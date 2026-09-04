import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePalette } from '@/lib/usePalette';

export function Screen({
  children,
  scroll = true,
  safeTop = true,
  header,
  banner,
  footer,
}: {
  children: ReactNode;
  scroll?: boolean;
  safeTop?: boolean;
  header?: ReactNode;
  banner?: ReactNode;
  footer?: ReactNode;
}) {
  const theme = usePalette();
  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-8 pt-4"
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1 px-5 pt-4">{children}</View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.hex.screen }}
      edges={safeTop ? ['top', 'left', 'right'] : ['left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header}
        {banner}
        {body}
        {footer ? (
          <View
            className="px-5 pb-3 pt-3"
            style={{ borderTopWidth: 1, borderTopColor: theme.hex.line, backgroundColor: theme.hex.header }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
