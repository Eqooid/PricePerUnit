import { useEffect, useMemo, useState } from 'react'
import { Moon, Plus, RotateCcw, Sun, Trash2, Trophy } from 'lucide-react'
import { calculateProduct, compareProducts, percentageDifference } from './lib/comparison'
import { currencies, formatCurrency, readPreferences, writePreferences, type CurrencyCode } from './lib/currency'
import { units, type Product, type Unit } from './types'

const storageKey = 'price-per-unit-products'
const blank = (): Product => ({ id: crypto.randomUUID(), name: '', price: '', quantity: '', unit: 'g' })
const readProducts = (): Product[] => {
  try { const value = localStorage.getItem(storageKey); const parsed = value ? JSON.parse(value) as Product[] : null; return Array.isArray(parsed) && parsed.length ? parsed : [blank(), blank()] } catch { return [blank(), blank()] }
}

function ProductForm({ product, index, currencyCode, onChange, onRemove, canRemove }: { product: Product; index: number; currencyCode: CurrencyCode; onChange: (next: Product) => void; onRemove: () => void; canRemove: boolean }) {
  const valid = calculateProduct(product)
  const errors = [!product.name.trim() ? 'Add a product name.' : '', product.price.trim() === '' ? 'Enter a price.' : Number(product.price) < 0 || !Number.isFinite(Number(product.price)) ? 'Enter a valid non-negative price.' : '', product.quantity.trim() === '' ? 'Enter a quantity.' : Number(product.quantity) <= 0 || !Number.isFinite(Number(product.quantity)) ? 'Quantity must be greater than zero.' : ''].filter(Boolean)
  const field = (key: 'name' | 'price' | 'quantity', label: string, placeholder: string, type = 'text') => <label className="field"><span>{label}</span><input type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? 'any' : undefined} value={product[key]} placeholder={placeholder} onChange={e => onChange({ ...product, [key]: e.target.value })} aria-invalid={errors.length > 0 && !!product[key]} /></label>
  return <article className={`product-card ${valid ? 'is-valid' : ''}`}>
    <div className="card-heading"><span className="product-index">{String(index + 1).padStart(2, '0')}</span><span className="product-label">Product {index + 1}</span>{canRemove && <button className="icon-button remove" onClick={onRemove} aria-label={`Remove product ${index + 1}`}><Trash2 size={17}/></button>}</div>
    {field('name', 'Product name', 'e.g. Oat milk')}
    <div className="form-row">{field('price', `Price (${currencyCode})`, '0', 'number')}</div>
    <div className="form-row quantity-row">{field('quantity', 'Quantity', '0', 'number')}<label className="field unit-field"><span>Unit</span><select value={product.unit} onChange={e => onChange({ ...product, unit: e.target.value as Unit })}>{units.map(unit => <option key={unit}>{unit}</option>)}</select></label></div>
    {errors.length > 0 && <p className="validation" role="status">{errors[0]}</p>}
    {valid && <p className="card-price">{formatCurrency(valid.normalizedPrice, currencyCode)} <span>/ {valid.normalizedUnit}</span></p>}
  </article>
}

export default function App() {
  const [products, setProducts] = useState<Product[]>(readProducts)
  const [preferences, setPreferences] = useState(() => readPreferences(localStorage))
  const { currency: currencyCode, theme: dark } = preferences
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(products)) }, [products])
  useEffect(() => { document.documentElement.dataset.theme = dark === 'dark' ? 'dark' : 'light'; writePreferences(localStorage, preferences) }, [preferences])
  const results = useMemo(() => compareProducts(products), [products])
  const groups = useMemo(() => [...new Set(results.map(item => item.family))].map(family => ({ family, items: results.filter(item => item.family === family) })), [results])
  const update = (index: number, next: Product) => setProducts(current => current.map((item, i) => i === index ? next : item))
  const reset = () => setProducts([blank(), blank()])
  const familyNames = { weight: 'Weight', volume: 'Volume', pieces: 'Pieces', length: 'Length' }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#" aria-label="PricePerUnit home"><span className="brand-mark">p</span><span>price<span className="brand-light">per</span>unit</span></a><p className="tagline">A little clarity at the checkout.</p><button className="theme-toggle" onClick={() => setPreferences(current => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }))} aria-label={`Switch to ${dark === 'dark' ? 'light' : 'dark'} mode`}>{dark === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}<span>{dark === 'dark' ? 'Light' : 'Dark'} mode</span></button></header>
    <main>
      <section className="intro"><p className="eyebrow">THE BETTER BUY, MADE CLEAR</p><h1>Compare the real price.</h1><p className="intro-copy">Different sizes, same question: which one gives you more for your money?</p></section>
      <section className="comparison-area" aria-label="Product comparison">
        <div className="section-heading"><div><h2>Your products</h2><p>Enter the price and pack size for each one.</p></div><button className="text-button reset-button" onClick={reset}><RotateCcw size={15}/> Reset</button></div>
        <div className="currency-row"><label htmlFor="currency-select">Currency</label><select id="currency-select" value={currencyCode} onChange={event => setPreferences(current => ({ ...current, currency: event.target.value as CurrencyCode }))}>{currencies.map(currency => <option key={currency.code} value={currency.code}>{currency.code} — {currency.name}</option>)}</select></div>
        <div className="product-grid">{products.map((product, index) => <ProductForm key={product.id} product={product} index={index} currencyCode={currencyCode} onChange={next => update(index, next)} onRemove={() => setProducts(current => current.filter((_, i) => i !== index))} canRemove={products.length > 2}/>)}</div>
        <button className="add-button" onClick={() => setProducts(current => [...current, blank()])}><Plus size={17}/> Add another product</button>
      </section>
      {results.length >= 2 && <section className="results" aria-live="polite"><div className="results-title"><span className="eyebrow">THE COMPARISON</span><h2>Your best value</h2></div>{groups.length > 1 && <p className="compatibility-note">Products with different units can’t be compared directly. Results below are grouped by compatible unit.</p>}{groups.map(group => { const winner = group.items[0]; return <div className="result-group" key={group.family}>{groups.length > 1 && <h3>{familyNames[group.family as keyof typeof familyNames]}</h3>}{group.items.length > 1 ? <><div className="winner"><div className="winner-icon"><Trophy size={19}/></div><div className="winner-copy"><span className="winner-label">BEST VALUE</span><h3>{winner.product.name}</h3><p>{formatCurrency(winner.normalizedPrice, currencyCode)} <span>/ {winner.normalizedUnit}</span></p></div><span className="winner-badge">Lowest price</span></div>{group.items.slice(1).map(item => <div className="runner-up" key={item.product.id}><div><strong>{item.product.name}</strong><span>{formatCurrency(item.normalizedPrice, currencyCode)} / {item.normalizedUnit}</span></div><span className="difference">{percentageDifference(winner.normalizedPrice, item.normalizedPrice).toFixed(1)}% cheaper</span></div>)}</> : <div className="runner-up"><div><strong>{winner.product.name}</strong><span>{formatCurrency(winner.normalizedPrice, currencyCode)} / {winner.normalizedUnit}</span></div><span className="difference">No direct match</span></div>}</div>})}</section>}
      {results.length === 1 && <p className="hint">Add at least one more valid product to see which is the better value.</p>}
      {results.length === 0 && <p className="hint">Your comparison will appear here once you add valid product details.</p>}
      {products.length < 2 && <p className="compatibility-note">Add at least two products to compare value.</p>}
    </main>
    <footer>Simple math. Smarter shopping. <span>Prices are assumed to be {currencyCode}; no currency conversion.</span></footer>
  </div>
}
