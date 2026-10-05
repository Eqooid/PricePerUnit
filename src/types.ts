export const units = ['g', 'kg', 'ml', 'L', 'pcs', 'm'] as const
export type Unit = typeof units[number]
export type Product = { id: string; name: string; price: string; quantity: string; unit: Unit }
export type ProductResult = { product: Product; family: 'weight' | 'volume' | 'pieces' | 'length'; normalizedPrice: number; normalizedUnit: string }
