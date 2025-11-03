# Score Summary (Rangkuman Nilai) UI/UX Refactoring

**Date**: 29 October 2025  
**Status**: ✅ **COMPLETED**  
**Goal**: Modernize score summary page with better table design, filters, and export options

---

## 📄 File Modified

`resources/js/pages/akademik/Recap.tsx`

---

## 🎨 Major Improvements

### 1. Page Header Section (NEW)

**Added professional header**:

```tsx
<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
    Rangkuman Nilai Hafalan
</h1>
<p className="mt-1 text-sm text-muted-foreground sm:text-base">
    Lihat dan unduh rangkuman setoran hafalan per santri
</p>
```

**Benefits**:

- Consistent with dashboard and hafalan pages
- Clear page purpose
- Professional appearance

### 2. Summary Statistics Cards (NEW)

**Before**: No summary stats visible

**After**: Three gradient cards showing totals

```tsx
<div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
    <Card> // Total Setoran (Blue gradient)
    <Card> // Total Murojaah (Amber gradient)
    <Card> // Total Selesai (Green gradient)
</div>
```

**Features**:

- Real-time calculation from filtered data
- Same visual style as dashboard
- Responsive grid layout (1→2→3 columns)
- Icon indicators (BookOpenCheck, Sparkles, TrendingUp)

**Calculation Logic**:

```tsx
const totalStats = React.useMemo(() => {
    return safeRows.reduce(
        (acc, row) => ({
            totalSetoran: acc.totalSetoran + row.totalSetoran,
            totalMurojaah: acc.totalMurojaah + row.totalMurojaah,
            totalSelesai: acc.totalSelesai + row.totalSelesai,
        }),
        { totalSetoran: 0, totalMurojaah: 0, totalSelesai: 0 },
    );
}, [safeRows]);
```

### 3. Enhanced Filter Card

**Before**:

- Basic layout
- No labels
- No reset button

**After**:

```tsx
<CardHeader>
    <div className="flex items-center justify-between">
        <CardTitle>
            <Filter /> Filter Data
        </CardTitle>
        <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw /> Reset
        </Button>
    </div>
</CardHeader>
```

**Improvements**:

- ✅ Added descriptive labels for each filter
- ✅ Reset button to quickly clear filters
- ✅ Filter icon for visual clarity
- ✅ Better grid layout (5 columns on large screens)
- ✅ Proper spacing with `grid gap-4`

**Reset Filter Function**:

```tsx
const resetFilters = React.useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    setLocalFilters({
        from: weekAgo,
        to: today,
        student_id: ALL_OPTION,
        class_id: ALL_OPTION,
    });
}, []);
```

### 4. Redesigned Data Table

**Header Improvements**:

```tsx
<CardTitle className="flex items-center gap-2 text-lg">
    <FileText className="h-5 w-5" />
    Data Rangkuman ({safeRows.length} santri)
</CardTitle>
```

**Table Visual Enhancements**:

```tsx
<div className="overflow-x-auto rounded-lg border border-border/60">
    <Table>
        <TableHeader>
            <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">...</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow
                className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
            >
                ...
            </TableRow>
        </TableBody>
    </Table>
</div>
```

**Key Features**:

1. **Zebra Striping**: Alternating row colors for readability
2. **Border Container**: Rounded border around table
3. **Bold Headers**: `font-semibold` on all column headers
4. **Header Background**: `bg-muted/50` for visual separation
5. **Text Alignment**: Right-align for numbers, left for names
6. **Value Styling**:
    - Font-semibold for Total Setoran
    - Muted color for Murojaah
    - Green color for Selesai

**Class Badge**:

```tsx
<span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
    {row.class ?? '—'}
</span>
```

**Export Button Enhancement**:

```tsx
<Button variant="outline" size="sm">
    <Download className="mr-2 h-4 w-4" />
    Cetak PDF // More descriptive
</Button>
```

### 5. Improved Empty State

**Before**:

```tsx
<div className="border-dashed... rounded-lg border">
    Belum ada data hafalan pada periode yang dipilih.
</div>
```

**After**:

```tsx
<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-12 text-center">
    <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
    <p className="text-sm font-medium text-muted-foreground">
        Belum ada data hafalan
    </p>
    <p className="mt-1 text-xs text-muted-foreground">
        Belum ada data hafalan pada periode yang dipilih
    </p>
</div>
```

**Benefits**:

- More visual feedback with icon
- Better spacing (p-12)
- Two-line message for clarity
- Centered layout

---

## 📊 Layout Structure

```
┌─────────────────────────────────────┐
│ Header (Title + Description)        │
├─────────────────────────────────────┤
│ Summary Stats (3 Cards)             │
│ [Total Setoran] [Murojaah] [Selesai]│
├─────────────────────────────────────┤
│ Filter Card                          │
│ [From] [To] [Santri] [Kelas] [Apply]│
│                           [Reset]    │
├─────────────────────────────────────┤
│ Data Table Card                      │
│ ┌───────────────────────────────┐   │
│ │ No │ Nama │ Kelas │ ... │Aksi │   │
│ ├───────────────────────────────┤   │
│ │  1 │ ...  │  ...  │ ... │[PDF]│   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎯 Responsive Design

| Breakpoint           | Summary Cards | Filter Grid | Behavior           |
| -------------------- | ------------- | ----------- | ------------------ |
| **Mobile** (< 640px) | 1 column      | 1 column    | Stacked vertically |
| **sm** (≥ 640px)     | 2 columns     | 2 columns   | Partial grid       |
| **md** (≥ 768px)     | 2 columns     | 3 columns   | More horizontal    |
| **lg** (≥ 1024px)    | 3 columns     | 5 columns   | Full grid          |

**Third Card Spanning**:

- On `sm`/`md` (2-col grid): Total Selesai spans full width
- On `lg+` (3-col grid): All cards same width

---

## 🎨 Visual Enhancements

### Color Coding

- **Blue gradient**: Total Setoran (primary metric)
- **Amber gradient**: Murojaah (review needed)
- **Green gradient**: Selesai (success metric)
- **Table green text**: Selesai column for positive reinforcement

### Typography

- **Headers**: Bold, uppercase for field labels
- **Numbers**: Right-aligned, bold for totals
- **Class names**: Badge style for visual separation

### Spacing

- **Container**: `p-4 md:p-6` matching dashboard
- **Gaps**: `gap-3 md:gap-4` for cards
- **Padding**: Consistent `p-12` for empty state

---

## ✅ New Features

1. ✅ **Summary Statistics** - At-a-glance totals
2. ✅ **Reset Filters** - One-click reset to default (last 7 days)
3. ✅ **Row Counter** - `({safeRows.length} santri)` in table header
4. ✅ **Better Icons** - FileText, Filter, RotateCcw, Download
5. ✅ **Loading State** - Descriptive button text changes
6. ✅ **Performance** - `useMemo` for safeRows and totalStats

---

## 🐛 Bug Fixes

1. ✅ **Fixed React Hook warning** - Wrapped `safeRows` in `useMemo`
2. ✅ **Consistent data handling** - Safe array check with fallback
3. ✅ **Removed unused imports** - Cleaned up lint warnings

---

## 🔧 Technical Improvements

### Performance Optimization

```tsx
// Memoized data processing
const safeRows = React.useMemo(() =>
    Array.isArray(rows) ? rows : [],
    [rows]
);

const totalStats = React.useMemo(() => {
    return safeRows.reduce(...);
}, [safeRows]);
```

### Better Callbacks

```tsx
const applyFilters = React.useCallback(() => {
    router.get('/akademik/rekap-nilai', buildQuery(localFilters), {
        preserveScroll: true,
        replace: true,
    });
}, [localFilters]);
```

---

## ✅ Conclusion

Score Summary page now features:

- ✅ Professional header matching other pages
- ✅ Real-time summary statistics
- ✅ Enhanced filter interface with reset
- ✅ Beautiful table design with zebra striping
- ✅ Better empty state with icon
- ✅ Fully responsive layout
- ✅ Improved accessibility
- ✅ Performance optimizations
- ✅ Consistent visual language

The page provides a complete overview of student performance with easy filtering and PDF export capabilities.
