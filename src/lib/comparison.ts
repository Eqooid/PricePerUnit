import type { Product, ProductResult, Unit } from '../types'

const factors: Record<Unit, { family: ProductResult['family']; base: number; display: string; displaySize: number }> = {
  g: { family: 'weight', base: 1, display: '100 g', displaySize: 100 },
  kg: { family: 'weight', base: 1000, display: '100 g', displaySize: 100 },
  ml: { family: 'volume', base: 1, display: '100 ml', displaySize: 100 },
  L: { family: 'volume', base: 1000, display: '100 ml', displaySize: 100 },
  pcs: { family: 'pieces', base: 1, display: 'piece', displaySize: 1 },
  m: { family: 'length', base: 1, display: 'm', displaySize: 1 },
}

export function normalizedQuantity(quantity: number, unit: Unit): number {
  return quantity * factors[unit].base
}

export function unitPrice(price: number, quantity: number, unit: Unit): number {
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Quantity must be greater than zero.')
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be zero or greater.')
  const factor = factors[unit]
  return price / normalizedQuantity(quantity, unit) * factor.displaySize
}

export function calculateProduct(product: Product): ProductResult | null {
  const price = Number(product.price), quantity = Number(product.quantity)
  if (!product.name.trim() || product.price.trim() === '' || product.quantity.trim() === '' || !Number.isFinite(price) || !Number.isFinite(quantity) || price < 0 || quantity <= 0) return null
  const factor = factors[product.unit]
  return { product, family: factor.family, normalizedPrice: unitPrice(price, quantity, product.unit), normalizedUnit: factor.display }
}

export function percentageDifference(cheapest: number, other: number): number {
  if (cheapest <= 0) return other <= 0 ? 0 : Infinity
  if (other <= 0) return 0
  return (other - cheapest) / other * 100
}

export function compareProducts(products: Product[]): ProductResult[] {
  return products.map(calculateProduct).filter((result): result is ProductResult => result !== null).sort((a, b) => a.normalizedPrice - b.normalizedPrice)
}

export function compatible(a: Unit, b: Unit): boolean { return factors[a].family === factors[b].family }
