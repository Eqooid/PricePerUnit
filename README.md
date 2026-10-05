# PricePerUnit

PricePerUnit compares the real unit price of everyday products, so different pack sizes are easier to compare. It works in your browser without an account or backend.

## MVP features

- Add, edit, and remove products; compare sorted unit prices and identify the best value.
- Supports g, kg, ml, L, pcs, and m, with comparisons grouped by compatible units.
- Supports IDR, USD, EUR, GBP, JPY, SGD, MYR, THB, AUD, and CAD display without converting entered amounts.
- Shows the percentage premium of each alternative, persists comparisons in localStorage, and supports light and dark themes.
- Responsive layout with input validation and accessible labels and controls.

## Stack

React, Vite, TypeScript, Tailwind CSS, lucide-react, and Vitest.

## Run locally

```sh
npm install
npm run dev
```

## Tests and production build

```sh
npm test
npm run typecheck
npm run build
```

## Unit normalization

Weight is converted to grams and displayed as price per 100 g. Volume is converted to milliliters and displayed per 100 ml. Pieces remain per piece, and length remains per meter. Only products in the same family (weight, volume, pieces, or length) are compared; mixed families are displayed in separate result groups. Prices are shown in the selected currency using `Intl.NumberFormat`; selecting a currency changes formatting only and never converts entered amounts. New comparisons default to IDR, and the selected currency is saved with the theme preference.
