import { paletteFor } from '@/lib/theme';
import { useAppStore } from '@/lib/store';

export function usePalette() {
  const mode = useAppStore((s) => s.profile?.mode);
  return paletteFor(mode);
}
