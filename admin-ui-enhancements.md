# Admin UI Enhancements — Audit & Attack Plan

> Generated via UI/UX Pro Max skill audit. Priority scale: CRITICAL → HIGH → MEDIUM → LOW.
> Each page has concrete, actionable fixes — grouped into waves so we can ship incrementally.

---

## Wave 0: Global Fixes (ALL Pages)

These touch every page and should be done first to avoid rebasing conflicts.

### G1. Replace hardcoded `bg-[#F8F9FD]` with semantic tokens

**Why**: The project has a complete shadcn-style CSS variable theme system (`--background`, `--card`, `--muted`, etc.) but most pages hardcode a specific gray. This breaks theming if the user ever customizes colors. 3 different background values are used across pages (`#F8F9FD`, `#FBFBFC`, `bg-slate-50`) — none of them respect the theme.

**Pages affected**: BookingsPage, SalesPage, InvoicesPage, StatisticsPage, UsersPage, OrdersPage, SettingsPage, ArchivedInventoryPage, NotificationsPage (+partial: InventoryPage uses `bg-slate-50 dark:bg-background`)

**Action**: Replace `bg-[#F8F9FD]` / `bg-[#FBFBFC]` / `bg-slate-50` with `bg-background` or `bg-muted/30`. Replace `dark:bg-slate-950` with `dark:bg-background`.

---

### G2. Respect `prefers-reduced-motion`

**Why**: framer-motion animations (stagger, fade, slide) run unconditionally. Users with vestibular disorders get nauseated by motion. WCAG requires `prefers-reduced-motion` support.

**Action**: Create a `useReducedMotion()` hook that reads `window.matchMedia('(prefers-reduced-motion: reduce)')`. Wrap all `framer-motion` `animate` props to skip or shorten animations when enabled. Also wrap `animate-pulse` CSS classes (NotificationsPage priority badge).

---

### G3. Fix `opacity-0 group-hover:opacity-100` pattern

**Why**: Hover-revealed actions are invisible on mobile/touch devices. Users can't find delete, edit, print, or archive buttons without randomly tapping rows.

**Pages affected**: SalesPage (actions column), UsersPage (delete button), NotificationsPage (external link + delete)

**Action**: At breakpoints `<768px` (md), render action buttons always visible. On desktop, keep hover pattern but add a `focus-within` fallback so keyboard users can reach them.

---

### G4. Add `aria-label` to icon-only buttons

**Pages affected**: InvoicesPage (printer), InventoryPage (action column buttons), SalesPage (action buttons), NotificationsPage (delete), UsersPage (approve/delete)

**Why**: Icon buttons without text labels are invisible to screen readers.

**Action**: Audit every `<button>` that contains only an icon and no visible text. Add `aria-label` with the translated action name.

---

### G5. Status badges: add icons alongside color

**Why**: Color-only indicators (green=available, amber=reserved, rose=sold) fail WCAG 1.4.1 (Use of Color). Red-green colorblind users can't distinguish.

**Pages affected**: InventoryPage (car status), BookingsPage (booking status), UsersPage (user status), SalesPage (delivery status)

**Action**: Add a small Lucide icon inside each status badge. Map: `Available` → `CheckCircle2`, `Reserved` → `Clock`, `Sold` → `XCircle`, `active` → `CheckCircle`, `pending` → `Timer`, `banned` → `Ban`.

---

### G6. Add focus management on route change

**Why**: Navigating between admin pages drops keyboard focus at the top of the page, not the `<main>` content region.

**Action**: On each page's mount, call `document.getElementById('main-content')?.focus()`. Add `tabIndex={-1}` to the main wrapper.

---

## Page-by-Page Enhancements

### P1. Dashboard

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| D1 | MEDIUM | Wrap framer-motion variants with `useReducedMotion()` | Motion feedback loop | Create hook, pass dynamic `animate` values |
| D2 | MEDIUM | Add relative time helper for "last update" | `14:30` is stale if page was opened at 14:29 | Use `timeAgo()` utility |
| D3 | LOW | Show quick actions for `sales_manager` too | Managers also need quick access to Inventory + Add Sale | Add conditional `user?.role !== 'viewer'` |
| D4 | LOW | Activity feed timeline dot uses `-right-[9px]` | Inconsistent with spacing system | Use `-right-2` (8px) |

---

### P2. Inventory

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| I1 | CRITICAL | Fix hardcoded `border-slate-*`, `bg-slate-*` to semantic tokens | Theme consistency | Replace with `border-border`, `bg-card`, `text-card-foreground` |
| I2 | CRITICAL | Increase action buttons to 44×44px min | Touch target compliance | Add `min-w-[44px] min-h-[44px]` or increase padding |
| I3 | HIGH | Replace `window.confirm` with `ConfirmDialog` | Brand-consistent destructive flow | Create reusable `ConfirmDialog` + wire for delete + reset |
| I4 | HIGH | Add icons to status badges | Accessibility (color-not-alone) | Insert `CheckCircle2`/`Clock`/`XCircle` inside span |
| I5 | HIGH | Build responsive card variant for mobile | Table is unusable on 375px screens | At `<768px`, render cards instead of table rows |
| I6 | MEDIUM | Replace `bg-slate-900` stats cards with semantic colors | Theme token usage | Use `bg-primary` / `bg-chart-2` |
| I7 | MEDIUM | Add `onKeyDown` + `tabIndex` to clickable table rows | Keyboard navigation | `onKeyDown={(e) => e.key === 'Enter' && navigate(...)}` |
| I8 | LOW | Replace empty `<td>` text with EmptyState component | Consistent empty states | Import and use `EmptyState` from Dashboard |

---

### P3. Bookings

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| B1 | CRITICAL | Fix `bg-[#F8F9FD]` | Theme consistency (G1) | Swap to `bg-background` |
| B2 | CRITICAL | Collapse 4 action buttons on mobile | Cramped layout, touch targets | At `<640px`, stack buttons 2×2 or use a "more" popover |
| B3 | HIGH | Add confirm dialog for reject/cancel | Destructive action without undo | `ConfirmDialog` with optional reason textarea for rejection |
| B4 | HIGH | Add `border-r-4` instead of `border-r-8` | Arbitrary thick border | Use consistent spacing scale |
| B5 | MEDIUM | Add tab underline indicator | Color-only active state | `border-b-2 border-indigo-500` on active tab |
| B6 | LOW | Enhance empty state with guidance | "No bookings" → "Share your inventory" | Add copy-link to inventory URL |

---

### P4. Sales

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| S1 | CRITICAL | Fix `bg-[#F8F9FD]` | G1 | — |
| S2 | CRITICAL | Always show action buttons | Mobile invisible (G3) | Remove `opacity-0 group-hover` on `<md` |
| S3 | HIGH | Build mobile card layout for 8-column table | Unusable on small screens | Collapse to summary cards with delivery pipeline |
| S4 | MEDIUM | Add confirmation before archive/unarchive | No accidental toggles | `ConfirmDialog` with context |
| S5 | MEDIUM | Unify stats cards with `StatsCard` component | Reimplemented inline | Replace manual card with `<StatsCard>` |
| S6 | LOW | Color-code payment methods | Quick visual scan | Map: cash → green, wire → blue, card → purple |

---

### P5. Invoices

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| IN1 | CRITICAL | Fix `bg-[#F8F9FD]` | G1 | — |
| IN2 | HIGH | Add stats summary row | No aggregate data visible | Total invoices, total amount, this month |
| IN3 | HIGH | Add `aria-label` to printer button | Screen reader invisible | `aria-label={t('print_invoice')}` |
| IN4 | MEDIUM | Replace boring empty state | "No results" is not helpful | Illustration + CTA |
| IN5 | LOW | Make entire card clickable for invoice preview | Better UX, fewer taps | `onClick` → open invoice on whole card |

---

### P6. Statistics

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| ST1 | CRITICAL | Fix `bg-[#F8F9FD]` | G1 | — |
| ST2 | CRITICAL | Add direct labels/legend to pie charts | Color-only conveys data (WCAG 1.4.1) | Recharts `label` prop + `Legend` component |
| ST3 | HIGH | Replace hardcoded COLORS array with CSS var chart tokens | Theme-consistent charts | Use `hsl(var(--chart-1))` through `--chart-5` |
| ST4 | HIGH | Enable Recharts `accessibilityLayer` | Keyboard nav for charts | Add `accessibilityLayer` prop |
| ST5 | MEDIUM | Remove fake "+5.2%" hardcoded delta | Misleading static data | Either pull real delta from API or remove |
| ST6 | MEDIUM | Add shimmer skeletons per chart | Better loading UX than full-page spinner | Skeleton variants per chart type |

---

### P7. Users

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| U1 | CRITICAL | Fix `bg-[#F8F9FD]` | G1 | — |
| U2 | CRITICAL | Show delete button always on mobile | G3 | Remove `opacity-0 group-hover` at `<md` |
| U3 | HIGH | Add confirmation before role change | Accidental demotion | Confirm dialog: "Change X from sales_manager to viewer?" |
| U4 | HIGH | Replace `window.confirm` delete | G3 derivative | `ConfirmDialog` showing user name |
| U5 | MEDIUM | Add pagination for 50+ users | Performance + UX | Limit 20 per page with page controls |
| U6 | MEDIUM | Add icons to status badges | G5 | `CheckCircle` / `Timer` / `Ban` |
| U7 | LOW | Add "Approve Selected" bulk action | Efficiency with pending users | Checkbox column + floating action bar |

---

### P8. Orders

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| O1 | CRITICAL | Fix `bg-[#F8F9FD]` | G1 | — |
| O2 | MEDIUM | Enhance empty states (orders + favorites) | No guidance | Illustration + CTA per tab |
| O3 | LOW | Verify loyalty section contrast | Gradient text readability | Test indigo→blue gradient midpoint contrast |

---

### P9. Settings

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| SE1 | CRITICAL | Fix `bg-[#F8F9FD]` | G1 | — |
| SE2 | HIGH | Add `autoComplete` attributes to password fields | Browser autofill not working | `current-password`, `new-password`, `new-password` |
| SE3 | HIGH | Add show/hide password toggle | UX best practice | `Eye`/`EyeOff` icon on each password field |
| SE4 | MEDIUM | Add password strength indicator | Prevent weak passwords | Strength bar (weak/medium/strong) |
| SE5 | MEDIUM | Auto-dismiss status message | Persistent message blocks view | `setTimeout` 5s or use toast |
| SE6 | LOW | Increase upload camera button hit area | Touch target compliance | Make 44×44min |

---

### P10. Archived Inventory

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| A1 | CRITICAL | Fix `bg-[#F8F9FD]` | G1 | — |
| A2 | HIGH | Add stats row | No aggregate data | Total archived, total archived value, oldest |
| A3 | MEDIUM | Show archive date per row | Time context for restorations | Add date column |
| A4 | LOW | Add bulk restore via checkbox | Efficiency | Checkbox column + "Restore Selected" button |

---

### P11. Notifications

| # | Priority | What | Why | How |
|---|----------|------|-----|-----|
| N1 | CRITICAL | Fix `bg-[#FBFBFC]` → consistent | G1 | Use `bg-background` |
| N2 | CRITICAL | Always show action buttons on mobile | G3 | Remove `opacity-0 group-hover` at `<md` |
| N3 | HIGH | Add `role="list"` and `aria-live="polite"` | Screen reader announcements | Semantic list structure |
| N4 | MEDIUM | Wrap `animate-pulse` in reduced-motion guard | Vestibular safety | CSS media query |
| N5 | MEDIUM | Add contextual empty states per filter tab | "No warnings" ≠ "no notifications" | Per-filter illustration |
| N6 | LOW | Add infinite scroll / "Load older" | Long list UX | Pagination with limit |

---

## Component: `ConfirmDialog`

We need a shared destructive confirmation dialog. This will be used by multiple pages:

**API proposal**:
```tsx
<ConfirmDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Confirm deletion"
  description={`Are you sure you want to delete ${itemName}?`}
  confirmLabel="Delete"
  variant="destructive" // | "warning" | "info"
  onConfirm={handleDelete}
/>
```

Create once at `src/components/ConfirmDialog.tsx`, reuse across InventoryPage, UsersPage, BookingsPage, SalesPage.

---

## Component: `useReducedMotion`

```tsx
// src/lib/useReducedMotion.ts
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
}
```

Then in framer-motion usage:
```tsx
const reduced = useReducedMotion();
<motion.div
  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
  transition={reduced ? { duration: 0 } : { duration: 0.4 }}
>
```

---

## Execution Order

```
Wave 0 (Global):
  1. G1 — bg semantic tokens         → 10 files
  2. G2 — useReducedMotion hook      → 1 new + 6 files
  3. G3 — hover-only actions         → 3 files
  4. G4 — aria-labels                → 5 files
  5. G5 — status icons               → 4 files
  6. G6 — focus management           → 1 file + 11 page wrappers
  7. ConfirmDialog component         → 1 new component
  8. Apply ConfirmDialog to pages    → 4-5 files

Wave 1 (Per-Page):
  P1 Dashboard → P2 Inventory → P3 Bookings → P4 Sales → P5 Invoices
  P6 Statistics → P7 Users → P8 Orders → P9 Settings → P10 Archived → P11 Notifications
```

Ready to attack. Say the word and we start with **Wave 0: Global Fixes**.
