import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AppText, HelpText } from '@/components/ui/AppText';
import { Button, Card, ChoiceChip } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { PORTION_HINTS } from '@/lib/copy';
import { useEntryDate } from '@/lib/entryDate';
import { formatDayLabel, todayKey } from '@/lib/dates';
import {
  caloriesHint,
  describeSearchFailure,
  fetchProductByBarcode,
  searchOpenFoodFacts,
  suggestedCalories,
  type OffProduct,
} from '@/lib/openFoodFacts';
import { useAppStore } from '@/lib/store';
import type { CatalogFood, FoodSource } from '@/lib/types';
import { usePalette } from '@/lib/usePalette';

type TabKey = 'search' | 'scan' | 'manual' | 'recents';

export default function FoodScreen() {
  const router = useRouter();
  const theme = usePalette();
  const entryDate = useEntryDate();
  const addFood = useAppStore((s) => s.addFood);
  const catalog = useAppStore((s) => s.catalog);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleGuiltFree = useAppStore((s) => s.toggleGuiltFree);
  const guiltFreeCount = useAppStore(
    (s) => (s.profile?.guiltFreeFoods ?? []).filter((item) => item.name.trim()).length,
  );
  const [tab, setTab] = useState<TabKey>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OffProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const [manualName, setManualName] = useState('');
  const [manualKcal, setManualKcal] = useState('');
  const [scanned, setScanned] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const recentsList = useMemo(() => {
    return [...catalog].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      if (!!a.isGuiltFree !== !!b.isGuiltFree) return a.isGuiltFree ? -1 : 1;
      return b.lastUsedAt.localeCompare(a.lastUsedAt);
    });
  }, [catalog]);

  useEffect(() => {
    if (tab !== 'search') return;
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setEmptyMessage(null);
      setError(null);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setEmptyMessage(null);
      try {
        const found = await searchOpenFoodFacts(q);
        setResults(found);
        if (found.length === 0) {
          setEmptyMessage(
            'No encontramos coincidencias. Probá otro nombre o cargalo a mano.',
          );
        }
      } catch (err) {
        console.error('Open Food Facts search failed', err);
        setResults([]);
        setError(describeSearchFailure(err));
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(handle);
  }, [query, tab]);

  const save = (
    name: string,
    calories: number,
    source: FoodSource,
    extra?: { barcode?: string; servingLabel?: string },
  ) => {
    if (!name.trim() || calories <= 0) return;
    addFood({ name, calories, source, date: entryDate, ...extra });
    router.back();
  };

  const saveFromCatalog = (item: CatalogFood) => {
    save(item.name, item.calories, item.source, { barcode: item.barcode });
  };

  return (
    <Screen safeTop={false}>
      {entryDate !== todayKey() ? (
        <AppText className="mb-2 font-semibold">Para el {formatDayLabel(entryDate)}</AppText>
      ) : null}
      <HelpText>
        Buscá por nombre, escaneá el envase, anotá las calorías a mano o reutilizá algo reciente.
      </HelpText>

      <View className="mt-4 flex-row flex-wrap">
        <ChoiceChip label="Buscar" selected={tab === 'search'} onPress={() => setTab('search')} />
        <ChoiceChip label="Escanear código" selected={tab === 'scan'} onPress={() => setTab('scan')} />
        <ChoiceChip label="Manual" selected={tab === 'manual'} onPress={() => setTab('manual')} />
        <ChoiceChip label="Recientes" selected={tab === 'recents'} onPress={() => setTab('recents')} />
      </View>

      {tab === 'search' && (
        <View className="mt-4">
          <Field
            label="Alimento o producto"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            help="Escribí al menos 3 letras. Esperamos un momento antes de buscar para no saturar la base abierta de Open Food Facts."
          />
          {loading ? <ActivityIndicator color="#2F5D50" /> : null}
          {error ? <AppText tone="bronze">{error}</AppText> : null}
          {!loading && emptyMessage ? <AppText tone="muted">{emptyMessage}</AppText> : null}
          {results.map((product) => {
            const kcal = suggestedCalories(product);
            return (
              <Pressable
                key={`${product.barcode}-${product.name}`}
                onPress={() => {
                  if (!kcal) {
                    setTab('manual');
                    setManualName(product.name);
                    return;
                  }
                  save(product.name, kcal, 'search', {
                    barcode: product.barcode,
                    servingLabel: product.servingSize,
                  });
                }}
                className="mb-2 rounded-2xl border px-4 py-3"
                style={{ backgroundColor: theme.hex.card, borderColor: theme.hex.line }}>
                <AppText className="font-medium">{product.name}</AppText>
                {product.brands ? (
                  <AppText tone="muted" className="text-xs">
                    {product.brands}
                  </AppText>
                ) : null}
                <AppText tone="forest" className="mt-1 text-sm">
                  {caloriesHint(product)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      )}

      {tab === 'scan' && (
        <ScanPane
          permissionGranted={permission?.granted ?? false}
          onRequestPermission={requestPermission}
          scanned={scanned}
          onScanned={async (code) => {
            if (scanned) return;
            setScanned(code);
            setLoading(true);
            try {
              const product = await fetchProductByBarcode(code);
              if (!product) {
                setError('No encontramos ese código. Probá buscarlo o cargarlo a mano.');
                setTab('manual');
                return;
              }
              const kcal = suggestedCalories(product);
              if (!kcal) {
                setManualName(product.name);
                setTab('manual');
                return;
              }
              save(product.name, kcal, 'barcode', {
                barcode: product.barcode,
                servingLabel: product.servingSize,
              });
            } catch (err) {
              console.error('Open Food Facts barcode lookup failed', err);
              setError('No pudimos leer el producto. Podés cargarlo a mano.');
              setTab('manual');
            } finally {
              setLoading(false);
            }
          }}
          onReset={() => {
            setScanned(null);
            setError(null);
          }}
          error={error}
          loading={loading}
        />
      )}

      {tab === 'manual' && (
        <View className="mt-4">
          <Field
            label="Nombre"
            value={manualName}
            onChangeText={setManualName}
            help="Un nombre que reconozcas la próxima vez alcanza, por ejemplo “arroz del mediodía”."
          />
          <Field
            label="Calorías"
            keyboardType="number-pad"
            value={manualKcal}
            onChangeText={setManualKcal}
            help="¿No sabés cuánto tiene? Probá buscarlo o escanear el código de barras. Si es casero, usá las referencias de abajo."
          />
          <Card>
            {PORTION_HINTS.map((hint) => (
              <AppText key={hint} tone="muted" className="mb-2 text-sm leading-5">
                {hint}
              </AppText>
            ))}
          </Card>
          <View className="mt-5">
            <Button
              label="Sumar al día"
              onPress={() => save(manualName, Number(manualKcal), 'manual')}
              disabled={!manualName.trim() || !Number(manualKcal)}
            />
          </View>
        </View>
      )}

      {tab === 'recents' && (
        <View className="mt-4">
          <HelpText>
            Tocá para sumar al día. Estrella = favorito. Hoja = sin culpa (hasta 3).
          </HelpText>
          {recentsList.length === 0 ? (
            <AppText tone="muted" className="mt-4">
              Todavía no hay recuerdos. Cuando registres una comida, va a aparecer acá.
            </AppText>
          ) : (
            recentsList.map((item) => (
              <QuickRow
                key={`rec-${item.name}`}
                name={item.name}
                calories={item.calories}
                favorite={item.isFavorite}
                guiltFree={!!item.isGuiltFree}
                canMarkGuiltFree={guiltFreeCount < 3 || !!item.isGuiltFree}
                cardColor={theme.hex.card}
                lineColor={theme.hex.line}
                ink={theme.hex.accent}
                onPress={() => saveFromCatalog(item)}
                onStar={() => toggleFavorite(item.name)}
                onLeaf={() => toggleGuiltFree(item.name)}
              />
            ))
          )}
        </View>
      )}
    </Screen>
  );
}

function QuickRow({
  name,
  calories,
  favorite,
  guiltFree,
  canMarkGuiltFree,
  cardColor,
  lineColor,
  ink,
  onPress,
  onStar,
  onLeaf,
}: {
  name: string;
  calories: number;
  favorite: boolean;
  guiltFree: boolean;
  canMarkGuiltFree: boolean;
  cardColor: string;
  lineColor: string;
  ink: string;
  onPress: () => void;
  onStar: () => void;
  onLeaf: () => void;
}) {
  return (
    <View
      className="mb-2 flex-row items-center rounded-2xl border"
      style={{ backgroundColor: cardColor, borderColor: lineColor }}>
      <Pressable onPress={onPress} className="flex-1 px-4 py-3">
        <AppText className="font-medium">{name}</AppText>
        <AppText tone="muted" className="text-xs">
          {calories} kcal{guiltFree ? ' · sin culpa' : ''}
        </AppText>
      </Pressable>
      <Pressable onPress={onLeaf} disabled={!canMarkGuiltFree} className="px-2 py-3">
        <Ionicons
          name={guiltFree ? 'leaf' : 'leaf-outline'}
          size={20}
          color={canMarkGuiltFree ? ink : '#C5BFB6'}
        />
      </Pressable>
      <Pressable onPress={onStar} className="px-4 py-3">
        <Ionicons name={favorite ? 'star' : 'star-outline'} size={20} color="#C17F4A" />
      </Pressable>
    </View>
  );
}

function ScanPane({
  permissionGranted,
  onRequestPermission,
  scanned,
  onScanned,
  onReset,
  error,
  loading,
}: {
  permissionGranted: boolean;
  onRequestPermission: () => void;
  scanned: string | null;
  onScanned: (code: string) => void;
  onReset: () => void;
  error: string | null;
  loading: boolean;
}) {
  const hint = useMemo(
    () => 'Apuntá al código de barras del envase. Buscamos el producto en Open Food Facts.',
    [],
  );

  if (!permissionGranted) {
    return (
      <View className="mt-4">
        <HelpText>{hint}</HelpText>
        <View className="mt-4">
          <Button label="Permitir cámara" onPress={onRequestPermission} />
        </View>
      </View>
    );
  }

  return (
    <View className="mt-4">
      <HelpText>{hint}</HelpText>
      <View className="mt-3 h-64 overflow-hidden rounded-3xl">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
          }}
          onBarcodeScanned={scanned ? undefined : ({ data }) => onScanned(data)}
        />
      </View>
      {loading ? <ActivityIndicator className="mt-3" color="#2F5D50" /> : null}
      {error ? <AppText className="mt-2" tone="bronze">{error}</AppText> : null}
      {scanned ? (
        <View className="mt-3">
          <Button label="Escanear otro" variant="ghost" onPress={onReset} />
        </View>
      ) : null}
    </View>
  );
}
