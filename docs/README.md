# List CRUD Page Styling Guidelines

These guidelines define the visual and layout standards for list-based CRUD pages (e.g., Device List, Snack List).

## Layout
- Page width: keep content within `max-w-[1024px]`.
- Use a vertical stack with `space-y-5` between major sections.
- Header section: title + subtitle on the left, actions on the right.
- Search/filter row: search input left, primary action button right.

## Typography
- Page title: `text-xl font-semibold text-[#1f2433]`.
- Subtitle: `text-xs text-[#8a93a5]`.
- Table header: `text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]`.
- Body text: `text-xs text-[#6b7280]`.

## Containers
- Main table card: `rounded-2xl border border-[#e6eaf2] bg-white`.
- Section paddings: `px-5 py-3` for headers, `px-5 py-4` for rows.
- Use `divide-y divide-[#eef1f6]` between rows.

## Inputs
- Search input wrapper: `rounded-lg border border-[#e6eaf2] bg-white px-3 py-2`.
- Placeholder text: `text-[#c0c6d4]`.
- Input text: `text-xs text-[#6b7280]`.

## Buttons
- Primary action: `rounded-lg bg-[#f04747] px-4 py-2 text-xs font-semibold text-white`.
- Secondary: `rounded-lg border border-[#e6eaf2] bg-white text-[#9aa2b1]`.

## Badges
- Model badge: `rounded-full px-2.5 py-1 text-[11px] font-semibold`.
- Status badge: `rounded-full px-2.5 py-1 text-[11px] font-semibold` with dot indicator.
- Examples:
  - Active: `bg-[#e7f7ee] text-[#22c55e]`
  - Maintenance: `bg-[#fff4d9] text-[#f59e0b]`
  - Offline: `bg-[#feecec] text-[#f04747]`

## Table Columns
- Use a 6-column grid for standard list pages:
  - `grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr_0.6fr]`
- Keep column alignment consistent across header and body rows.

## Pagination
- Wrapper: `rounded-lg border border-[#e6eaf2] bg-white`.
- Buttons: `h-8 w-8 text-xs`, active `bg-[#f3f5ff] text-[#4f5bff]`.

## Actions
- Icon buttons: `h-7 w-7 rounded-full border border-[#e6eaf2] bg-white`.
- Maintain a 3-button cluster with 12px spacing.
