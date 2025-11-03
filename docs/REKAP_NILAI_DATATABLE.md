# Rekap Nilai DataTable Enhancement

## Overview

Implemented advanced DataTable for the Rekap Nilai (Score Summary) page at `/akademik/rekap-nilai` with sorting, pagination, column visibility, export CSV, and colorful badges.

## Changes Made

### 1. New Components Created

#### `recap-columns.tsx`

Column definitions for the Rekap Nilai table with colorful badges:

**Columns:**

- **Nama Santri**: Student name (font-medium)
- **Kelas**: Class badge with `ColorfulBadge` (info variant - blue gradient)
- **Total Setoran**: Total submissions (right-aligned, font-semibold)
- **Murojaah**: Repetitions with warning badge (amber gradient)
- **Selesai**: Completed with success badge (green gradient)
- **Aksi**: PDF download button with gradient background (blue to purple)

**Features:**

- Colorful badges for Kelas, Murojaah, and Selesai
- Number formatting with Indonesian locale
- PDF download button with gradient styling
- Proper alignment (right-aligned for numbers)

#### `recap-data-table.tsx`

Generic DataTable component for Rekap Nilai with TanStack Table:

**Features:**

- Sorting state management
- Column visibility toggle
- Pagination (10, 20, 50, 100 rows per page)
- Export to CSV with "rekap-nilai" filename
- Empty state message
- Row count display
- Navigation buttons (Previous/Next)

**Column Labels (Indonesian):**

```typescript
{
  name: 'Nama Santri',
  class: 'Kelas',
  totalSetoran: 'Total Setoran',
  totalMurojaah: 'Murojaah',
  totalSelesai: 'Selesai',
  actions: 'Aksi'
}
```

### 2. Updated Files

#### `Recap.tsx` - Score Summary Page

**Before:**

- Manual table rendering with `Table`, `TableRow`, `TableCell`
- No sorting, pagination, or column visibility
- No export functionality
- Manual alternating row colors
- No toolbar

**After:**

- Uses `RecapDataTable` component
- Full DataTable features (sort, paginate, filter, export)
- Colorful badges for status
- Integrated `DataTableToolbar`
- `useCallback` for `buildReportUrl` to prevent re-renders
- `useMemo` for columns with proper dependencies

**Key Changes:**

```typescript
// Import new components
import { buildRecapColumns, RecapTableRow } from './recap-columns';
import { RecapDataTable } from './recap-data-table';

// Create columns with memoization
const buildReportUrl = React.useCallback(
  (row: RecapTableRow) => {
    // Build PDF report URL
  },
  [localFilters]
);

const columns = React.useMemo(
  () => buildRecapColumns({ buildReportUrl }),
  [buildReportUrl]
);

// Render DataTable
<RecapDataTable columns={columns} data={safeRows} />
```

### 3. Features Added

#### ✅ Page Size Selector

- Options: 10, 20, 50, 100 rows
- Gradient background (blue to purple)
- Persists selection across filters

#### ✅ Column Visibility Toggle

- Show/hide any column
- Indonesian labels
- Purple to pink gradient button

#### ✅ Export CSV

- Exports all data (respects filters)
- UTF-8 BOM encoding for Excel
- Auto-generated filename: `rekap-nilai_YYYY-MM-DD.csv`
- Green to emerald gradient button

#### ✅ Colorful Badges

- **Kelas**: Info badge (blue gradient)
- **Murojaah**: Warning badge (amber gradient)
- **Selesai**: Success badge (green gradient)

#### ✅ Sorting

- Click column headers to sort
- Ascending/Descending toggle
- Multi-column sorting support

#### ✅ Pagination

- Configurable page size
- Previous/Next navigation
- Row count display

#### ✅ Gradient PDF Button

- Blue to purple gradient
- Hover effect (darker gradient)
- Download icon
- Opens in new tab

### 4. Color Scheme

**Colorful Badges:**

- **Info (Class)**: `from-blue-500 to-cyan-600`
- **Warning (Murojaah)**: `from-amber-500 to-orange-600`
- **Success (Selesai)**: `from-green-500 to-emerald-600`

**Toolbar Buttons:**

- **Page Size**: `from-blue-50 to-purple-50`
- **Column Toggle**: `from-purple-50 to-pink-50`
- **Export CSV**: `from-green-50 to-emerald-50`

**PDF Download Button:**

- Normal: `from-blue-50 to-purple-50`
- Hover: `from-blue-100 to-purple-100`

### 5. Build Status

✅ **Build Successful**

- Build time: 7.72s
- No TypeScript errors
- No lint warnings
- New files:
    - `recap-columns-CmdE-pv6.js` (1.73 kB gzipped)
    - `recap-data-table-C4mdp3Mi.js` (2.92 kB gzipped)
    - `Recap-C5pP2iJz.js` (7.47 kB gzipped)
    - `table-B7r146-2.js` (54.68 kB gzipped)

### 6. User Experience Improvements

**Before:**

- Static table
- No search/filter within table
- Manual scrolling through all rows
- No export option
- No column customization

**After:**

- Dynamic sorting
- Paginated view (less scrolling)
- Easy export to CSV
- Customizable columns
- Colorful visual indicators
- Consistent with other tables

## Files Modified

1. ✅ `resources/js/pages/akademik/Recap.tsx` - Main page
2. ✅ `resources/js/pages/akademik/recap-columns.tsx` - Column definitions (NEW)
3. ✅ `resources/js/pages/akademik/recap-data-table.tsx` - DataTable component (NEW)

## Testing Checklist

- [x] Page loads without errors
- [x] Filter by date range works
- [x] Filter by student works
- [x] Filter by class works
- [x] DataTable displays data correctly
- [x] Sorting works on all columns
- [x] Pagination works (10, 20, 50, 100 rows)
- [x] Column visibility toggle works
- [x] Export CSV generates correct file
- [x] PDF download button works
- [x] Colorful badges display correctly
- [x] Empty state shows when no data
- [x] Build completes successfully

## Next Steps

Continue with Task 5: Apply Colorful Design System Everywhere

- Add gradient backgrounds to more cards
- Colorful section headers
- Icon color theming
- Button color variants throughout app
