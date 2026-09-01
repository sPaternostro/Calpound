export interface OffProduct {
  barcode?: string;
  name: string;
  caloriesPer100g: number | null;
  servingCalories: number | null;
  servingSize?: string;
  imageUrl?: string;
  brands?: string;
}

const HEADERS = {
  'User-Agent': 'Calpound/1.0 (calorie budget app; local)',
  Accept: 'application/json',
};

function readCalories(nutriments: Record<string, unknown> | undefined): {
  per100: number | null;
  serving: number | null;
} {
  if (!nutriments) return { per100: null, serving: null };
  const per100Raw =
    nutriments['energy-kcal_100g'] ??
    nutriments['energy-kcal'] ??
    nutriments['energy-kcal_value'];
  const servingRaw = nutriments['energy-kcal_serving'];
  const per100 = typeof per100Raw === 'number' ? Math.round(per100Raw) : null;
  const serving = typeof servingRaw === 'number' ? Math.round(servingRaw) : null;
  return { per100, serving };
}

function mapProduct(product: Record<string, unknown>): OffProduct | null {
  const name =
    (product.product_name as string) ||
    (product.generic_name as string) ||
    (product.brands as string);
  if (!name) return null;
  const { per100, serving } = readCalories(
    product.nutriments as Record<string, unknown> | undefined,
  );
  return {
    barcode: (product.code as string) || undefined,
    name: name.trim(),
    caloriesPer100g: per100,
    servingCalories: serving,
    servingSize: (product.serving_size as string) || undefined,
    imageUrl: (product.image_front_small_url as string) || undefined,
    brands: (product.brands as string) || undefined,
  };
}

export async function searchOpenFoodFacts(query: string): Promise<OffProduct[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    q,
  )}&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name,generic_name,brands,nutriments,serving_size,image_front_small_url`;

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error('No se pudo buscar en Open Food Facts');
  const data = (await res.json()) as { products?: Record<string, unknown>[] };
  return (data.products ?? [])
    .map(mapProduct)
    .filter((item): item is OffProduct => item !== null);
}

export async function fetchProductByBarcode(barcode: string): Promise<OffProduct | null> {
  const code = barcode.replace(/\s/g, '');
  if (!code) return null;
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error('No se pudo leer el código de barras');
  const data = (await res.json()) as {
    status?: number;
    product?: Record<string, unknown>;
  };
  if (data.status !== 1 || !data.product) return null;
  return mapProduct(data.product);
}

export function suggestedCalories(product: OffProduct): number | null {
  return product.servingCalories ?? product.caloriesPer100g;
}

export function caloriesHint(product: OffProduct): string {
  if (product.servingCalories && product.servingSize) {
    return `${product.servingCalories} kcal por porción (${product.servingSize})`;
  }
  if (product.servingCalories) {
    return `${product.servingCalories} kcal por porción`;
  }
  if (product.caloriesPer100g != null) {
    return `${product.caloriesPer100g} kcal cada 100 g`;
  }
  return 'Sin dato de calorías: cargalo a mano si lo conocés';
}
