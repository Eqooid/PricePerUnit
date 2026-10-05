import { describe, expect, it } from 'vitest'
import { formatCurrency, readPreferences, writePreferences } from './currency'

describe('currency formatting', () => {
  it('formats IDR without fractional digits', () => {
    expect(formatCurrency(15000, 'IDR')).toContain('Rp')
    expect(formatCurrency(15000, 'IDR')).toContain('15.000')
    expect(formatCurrency(15000, 'IDR')).not.toContain(',00')
  })

  it('formats USD and JPY using their currency locales and digits', () => {
    expect(formatCurrency(15, 'USD')).toBe('$15.00')
    expect(formatCurrency(15, 'JPY')).toMatch(/[¥￥]15/)
    expect(formatCurrency(15, 'JPY')).not.toContain('.')
  })

  it('persists and restores the selected currency with application preferences', () => {
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
    writePreferences(storage, { currency: 'EUR', theme: 'dark' })
    expect(readPreferences(storage)).toEqual({ currency: 'EUR', theme: 'dark' })
  })
})
