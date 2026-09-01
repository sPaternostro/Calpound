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
import {
  caloriesHint,
  fetchProductByBarcode,
  searchOpenFoodFacts,
  suggestedCalories,
  type OffProduct,
} from '@/lib/openFoodFacts';
import { useAppStore } from '@/lib/store';
import type { FoodSource } from '@/lib/types';

type TabKey = 'search' | 'scan' | 'manual';

export default function FoodScreen() {
  const router = useRouter();
  const addFood = useAppStore((s) => s.addFood);
  const catalog = useAppStore((s) => s.catalog);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const [tab, setTab] = useState<TabKey>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OffProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualName, setManualName] = useState('');
  const [manualKcal, setManualKcal] = useState('');
  const [scanned, setScanned] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const favorites = catalog.filter((item) => item.isFavorite);
  const recents = catalog.slice(0, 8);

  useEffect(() => {
    if (tab !== 'search') return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setResults(await searchOpenFoodFacts(q));
      } catch {
        setError('No pudimos consultar la base ahora. Probá de nuevo o cargalo a mano.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [query, tab]);

  const save = (
    name: string,
    calories: number,
    source: FoodSource,
    extra?: { barcode?: string; servingLabel?: string },
  ) => {
    if (!name.trim() || calories <= 0) return;
    addFood({ name, calories, source, ...extra });
    router.back();
  };

  return (
    <Screen safeTop={false}>
      <HelpText>
        Buscá por nombre, escaneá el envase o anotá las calorías a mano. Lo que ya usaste queda en
        favoritos y recientes.
      </HelpText>

      <View className="mt-4 flex-row flex-wrap">
        <ChoiceChip label="Buscar" selected={tab === 'search'} onPress={() => setTab('search')} />
        <ChoiceChip label="Escanear código" selected={tab === 'scan'} onPress={() => setTab('scan')} />
        <ChoiceChip label="Manual" selected={tab === 'manual'} onPress={() => setTab('manual')} />
      </View>

      {(favorites.length > 0 || recents.length > 0) && tab !== 'scan' ? (
        <View className="mt-4">
          {favorites.length > 0 ? (
            <>
              <AppText className="mb-2 font-semibold">Favoritos</AppText>
              {favorites.map((item) => (
                <QuickRow
                  key={`fav-${item.name}`}
                  name={item.name}
                  calories={item.calories}
                  favorite
                  onPress={() => save(item.name, item.calories, item.source, { barcode: item.barcode })}
                  onStar={() => toggleFavorite(item.name)}
                />
              ))}
            </>
          ) : null}
          <AppText className="mb-2 mt-3 font-semibold">Recientes</AppText>
          {recents.map((item) => (
            <QuickRow
              key={`rec-${item.name}`}
              name={item.name}
              calories={item.calories}
              favorite={item.isFavorite}
              onPress={() => save(item.name, item.calories, item.source, { barcode: item.barcode })}
              onStar={() => toggleFavorite(item.name)}
            />
          ))}
        </View>
      ) : null}

      {tab === 'search' && (
        <View className="mt-4">
          <Field
            label="Alimento o producto"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            help="Escribí al menos 2 letras. Los resultados vienen de Open Food Facts, una base abierta de productos."
          />
          {loading ? <ActivityIndicator color="#2F5D50" /> : null}
          {error ? <AppText tone="bronze">{error}</AppText> : null}
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
                className="mb-2 rounded-2xl border border-line bg-paper px-4 py-3">
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
            } catch {
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
    </Screen>
  );
}

function QuickRow({
  name,
  calories,
  favorite,
  onPress,
  onStar,
}: {
  name: string;
  calories: number;
  favorite: boolean;
  onPress: () => void;
  onStar: () => void;
}) {
  return (
    <View className="mb-2 flex-row items-center rounded-2xl border border-line bg-paper">
      <Pressable onPress={onPress} className="flex-1 px-4 py-3">
        <AppText className="font-medium">{name}</AppText>
        <AppText tone="muted" className="text-xs">
          {calories} kcal
        </AppText>
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
