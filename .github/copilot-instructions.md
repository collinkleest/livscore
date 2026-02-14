# LivScore AI Coding Instructions

## Project Overview

LivScore is a React + TypeScript real estate listing application built with Vite. It displays property listings with filtering/sorting capabilities and supports CSV data import. The UI uses Mantine design system with mantine-react-table for advanced table features.

## Architecture

### Component Structure

- **Root**: `src/App.tsx` - Main component, imports `ListingsTable`
- **Components**: `src/_components/listings/` contains two sub-components:
  - `ListingsTable.tsx` - Primary table component using mantine-react-table with state management
  - `CsvUpload.tsx` - File input component for CSV data import
- All components exported via barrel files (`_components/index.ts`)

### Data Flow

1. `ListingsTable` maintains React state (`data: Listing[]`)
2. `CsvUpload` child component parses CSV files and calls `onDataLoaded` callback
3. Parent state updates trigger table re-render
4. Mock data (`mockListings`) provides initial table state

### Key Interfaces

```typescript
interface Listing {
  id: number;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
}
```

## Build & Development

- **Dev server**: `pnpm dev` (Vite HMR enabled)
- **Build**: `pnpm build` (runs TypeScript compilation then Vite build)
- **Lint**: `pnpm lint` (ESLint with flat config)
- **Preview**: `pnpm preview` (serve production build locally)

## Tech Stack & Patterns

### UI & Styling

- **Mantine Core** (v8.3.14) - Component library; all styles imported in [src/main.tsx](src/main.tsx)
- **Emotion** - Mantine's CSS-in-JS engine
- **mantine-react-table** (v2.0.0-beta.9) - Advanced table features; styles required in [src/main.tsx](src/main.tsx)
- **PostCSS** - Mantine preset configured in `postcss.config.cjs`

### Column Definition Pattern

Use `useMemo` + `MRT_ColumnDef<T>[]` to define table columns. Cell customization via `Cell` render function (see `listings-table.tsx` for Badge, formatting examples).

### File Processing

CSV parsing done client-side in [CsvUpload.tsx](src/_components/listings/csv-upload.tsx). Expects CSV headers to match Listing interface keys (lowercase). Validation: file extension check + try-catch error handling.

## Conventions

- **Component naming**: PascalCase with `.tsx` extension
- **Barrel exports**: Group related exports in `index.ts` files (e.g., `_components/listings/index.ts`)
- **Path alias**: Use `@_components` for absolute imports (configured in `vite.config.ts`)
- **State management**: useState for local component state; lift state to parent if needed
- **Formatting utilities**: Use `Intl.NumberFormat` for localized number/currency display

## Important Files

- [vite.config.ts](vite.config.ts) - Path alias configuration
- [tsconfig.app.json](tsconfig.app.json) - React + DOM type definitions
- [eslint.config.js](eslint.config.js) - Linting rules (flat config format)
- [src/\_components/listings/listings-table.tsx](src/_components/listings/listings-table.tsx) - Primary data table logic
