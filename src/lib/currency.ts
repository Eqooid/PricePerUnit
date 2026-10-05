const currencyCodes = ['IDR', 'USD', 'EUR', 'GBP', 'JPY', 'SGD', 'MYR', 'THB', 'AUD', 'CAD'] as const
export type CurrencyCode = typeof currencyCodes[number]
type CurrencyOption = { code: CurrencyCode; name: string; locale: string; fractionDigits?: number }

export const currencies: CurrencyOption[] = [
  { code: 'IDR', name: 'Indonesian Rupiah', locale: 'id-ID', fractionDigits: 0 },
  { code: 'USD', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'SGD', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'MYR', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  { code: 'THB', name: 'Thai Baht', locale: 'th-TH' },
  { code: 'AUD', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', name: 'Canadian Dollar', locale: 'en-CA' },
] 

export const defaultCurrency: CurrencyCode = 'IDR'
const isCurrencyCode = (value: string | null): value is CurrencyCode => currencies.some(currency => currency.code === value)

export function formatCurrency(value: number, code: CurrencyCode): string {
  const currency = currencies.find(item => item.code === code)!
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    ...(currency.fractionDigits === undefined ? {} : { minimumFractionDigits: currency.fractionDigits, maximumFractionDigits: currency.fractionDigits }),
  }).format(value)
}

type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>
const preferencesKey = 'price-per-unit-preferences'

export function readPreferences(storage: PreferenceStorage): { currency: CurrencyCode; theme: 'light' | 'dark' } {
  try {
    const saved = JSON.parse(storage.getItem(preferencesKey) ?? '{}') as { currency?: string; theme?: string }
    const legacyTheme = storage.getItem('price-per-unit-theme')
    const selectedCurrency = saved.currency ?? null
    return { currency: isCurrencyCode(selectedCurrency) ? selectedCurrency : defaultCurrency, theme: saved.theme === 'dark' || saved.theme === 'light' ? saved.theme : legacyTheme === 'dark' ? 'dark' : 'light' }
  } catch {
    return { currency: defaultCurrency, theme: storage.getItem('price-per-unit-theme') === 'dark' ? 'dark' : 'light' }
  }
}

export function writePreferences(storage: PreferenceStorage, preferences: { currency: CurrencyCode; theme: 'light' | 'dark' }): void {
  storage.setItem(preferencesKey, JSON.stringify(preferences))
}
