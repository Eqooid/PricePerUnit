import { describe, expect, it } from 'vitest'
import { compareProducts, compatible, percentageDifference, unitPrice } from './comparison'
import type { Product, Unit } from '../types'

describe('normalized unit pricing', () => {
  it.each([['g', 250, 15000, 6000], ['kg', 1, 12000, 1200], ['ml', 250, 15000, 6000], ['L', 1, 20000, 2000], ['pcs', 4, 10000, 2500], ['m', 2, 10000, 5000]] as [Unit, number, number, number][])('%s quantities normalize correctly', (unit, quantity, price, expected) => expect(unitPrice(price, quantity, unit)).toBe(expected))
  it('finds the cheapest product after sorting', () => {
    const products: Product[] = [{ id: 'a', name: 'A', price: '15000', quantity: '250', unit: 'g' }, { id: 'b', name: 'B', price: '22000', quantity: '400', unit: 'g' }]
    expect(compareProducts(products)[0].product.name).toBe('B')
  })
  it('calculates savings as a percentage of the more expensive option', () => expect(percentageDifference(5500, 6000)).toBeCloseTo(8.3333, 3))
  it('rejects invalid quantities and incompatible units', () => {
    expect(() => unitPrice(10, 0, 'g')).toThrow(/greater than zero/)
    expect(compatible('g', 'kg')).toBe(true)
    expect(compatible('g', 'ml')).toBe(false)
  })
})
