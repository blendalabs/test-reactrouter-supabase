# Test Task 1: Brand Selector for Video Templates

## Implementation summary

Implemented brand filtering via a URL param (`?brand=vio-ljusfabrik`). The dropdown updates the URL, so links are shareable/bookmarkable and Back/Forward works. The server loader reads the URL and returns filtered data (team-scoped, RLS-safe), so we never leak data across teams.

## Changes made

### Database (migration)

**File:** `supabase/migrations/20251004204804_add_brands_and_template_fk.sql`

- **New `brands` table**
  Holds canonical brand records. Minimal shape on purpose:
  - `id` (uuid pk), `name` (required), `slug` (unique, lowercase only for URL safety)
  - `created_at` / `updated_at` with a trigger to keep `updated_at` fresh
    This lets us attach a brand to a template and reliably look it up by slug.

- **`templates.brand_id` > FK to `brands(id)` with `ON DELETE SET NULL`**
  Templates can exist without a brand. If a brand is removed, the template stays; just null out `brand_id`. Safer than cascading deletes.

- **Indexes**
  - `brands(slug)` for fast `?brand=<slug>` lookups
  - `templates(brand_id)` for quick filtering by brand on the templates grid

- **RLS**
  Brands are readable by any authenticated user (mirrors existing policy style). Actual template access is still restricted by team membership.

- **Idempotent where it matters**.
  The migration is idempotent: schema changes are wrapped with `IF NOT EXISTS` (and `DROP … IF EXISTS` where needed), so re-running it won’t fail

### Database seed

**File:** `supabase/seed/main.sql`

- **Seeded three brands**
  - Vio Ljusfabrik (`vio-ljusfabrik`)
  - Blenda Labs (`blenda-labs`)
  - Nordic Film (`nordic-film`)
    Clear, URL-friendly slugs from day one.

- **Linked the sample template to a brand**
  So the selector doesn’t fall empty and the filter is easy to verify

- **Upserts via `on conflict (slug)`**
  Re-running seeds won’t duplicate brands; it just updates names if needed.

- **Commented helper for bulk brand assignment**
  Handy for local testing if you add more templates and want quick distribution of brands.

### Server (loader)

**File:** `app/routes/_in.$teamSlug.templates._index.tsx`

- **Reads `?brand=<slug>` from the URL (trims whitespace and lowercases for robust matching)**
  Users can paste sloppy URLs; They are normalized before querying.

- **Resolves the slug to `brand_id` via the DB (ignores invalid or unknown slugs)**
  If the slug isn’t found, we don’t crash; we simply don’t apply the brand filter.

- **Fetches all brands (A to Z) for the selector**
  Keeps the UI stable—even if a brand currently has no templates.

- **Filters templates by `brand_id` when a valid brand is selected**
  Server-side filter, which keeps RLS enforcement intact and avoids client-side data drifting out of sync.

- **Always scopes by team membership first, then applies the brand filter**
  First prove the user belongs to the team; only then fetch and filter. This keeps boundaries tight.

- **Returns `{ brands, activeBrand, templates }` to the component**
  Straightforward data contract for the UI—no, extra computation needed on the client.

**Component wiring:**

- **Mounted `BrandSelect` in the page header**
  Lives where users naturally look for filters and doesn’t disturb the existing layout.

- **Keeps the existing template grid intact**
  [ We didn’t] reshuffle unrelated UI; just connected the filter.

### Frontend (component)

**File:** `app/components/templates/BrandSelect.tsx`

- **Replaced native `<select>` with Radix Select (a11y + styling)**
  Predictable focus, proper ARIA, keyboard navigation, and easier styling than `<select>` across browsers.

- **“All Brands” implemented with a non-empty sentinel (Radix rule)**
  Radix items can’t have `value=""`. We use a safe token (e.g., `__all__`). Selecting it removes `?brand` from the URL cleanly.

- **URL is the single source of truth (uses `useSearchParams` + `navigate`)**
  The selected brand lives in the URL. We read it from the URL and write it back on change; the loader re-runs and returns the right data.

- **Keeps other query params intact**
  We clone `URLSearchParams`, update only `brand`, and preserve the rest (e.g., `?sort=title&page=2` stays).

- **Trigger width == menu width (uses `--radix-select-trigger-width`)**
  The dropdown matches the trigger size exactly, so the popup doesn’t feel detached or jittery.

- **Selected item highlighted (deep red), tick icon forced black**
  Clear selection state and consistent tick visibility against the red background.

- **Keyboard/screen reader friendly**
  Works with Tab/Arrows/Enter/Escape; labeled properly; screen readers announce changes.

### Types

**File:** `app/types/global.ts`

```ts
export type Brand = Tables['brands']['Row'];
```

- **Why:** This is the exact row shape from the `brands` table, pulled from the generated Supabase types.
- **How used:** In UI pieces like `BrandSelect`, the full row—so is not needed. tighten it with `Pick<Brand, 'slug' | 'name'>` to match what we actually render.

**File:** `app/types/supabase.d.ts`

- **Regenerated to include `brands` and `templates.brand_id`**
  After the migration, we refreshed types so editors know about the new table/column. Autocomplete and null-safety all come from here.

## Code quality & practices

- **Comments only where they pull weight**
  Business rules and non-obvious bits have comments; trivial code doesn’t.

- **Strong TS**
  No `any`. Nullable paths handled explicitly with `string | null`.

- **Let selects**
  Queries fetch only fields we display. Less bandwidth, faster responses.

- **No service role in the browser**
  Server-only for elevated keys. Browser uses anon; RLS does the gating.

- The filter state is kept in the URL, and data is fetched by the server loader.

- **Lint/format clean**
  Prettier and ESLint applied; typecheck passes.

## Performance notes

- **Narrow selects for templates amd locales**
  Only the needed columns are fetched, reducing payload and speeding up rendering. Cuts payload size and speeds up rendering.

- **Brand lookups can run in parallel**
  Brand lookups can run in parallel: the slug to id lookup and the full brand list fetch are independent, so they can be requested simultaneously as a future micro optimizations.

- **Right indexes**
  `brand_id` for filtering; `slug` for brand lookup.

## Security

- **Team check first**
  membershipis cheked first, before anything else; ensures data from other teams is never returned.

- **RLS enforced**
  Policies stay in charge. The loader doesn’t bypass them.

- **No secrets in git**
  `.env` is ignored; Cloud/local setup uses developer’s own keys.

- **Slug checked server-side**
  The query parameter is sanitized and checked; unrecognized slugs are ignored and no filter is applied.

## Accessibility

- **Explicit label/aria**
  The control has a visible label and proper ARIA attributes, so screen readers interpret it correctly.

- **Keyboard supports**
  Full arrow/enter/escape navigation through Radix.

- **Proper sizing**
  Dropdown width matches the trigger width, which helps focus and readability.

## Testing checklist (manual)

- Selector shows all seeded brands
- “All Brands” removes `?brand` from the URL and clears the filter
- Picking a brand writes `?brand=<slug>` to the URL
- Templates list is filtered correctly by brand
- Direct links with `?brand=<slug>` render filtered results on load
- Unknown slug doesn’t crash; team templates (unfiltered)
- Migrations and seed apply cleanly
- `npm run fix` and `npm run typecheck` pass

## How the URL flow works

1. User picks a brand in the dropdown
2. Component updates the URL search params (preserving other params)
3. Router runs the server loader again
4. Loader resolves slug to `brand_id` and filters by it
5. Filtered templates and `activeBrand` are returned to the component

## Files worked on,

**New**

- `app/components/templates/BrandSelect.tsx`
- `supabase/migrations/20251004204804_add_brands_and_template_fk.sql`

**Modified**

- `app/routes/_in.$teamSlug.templates._index.tsx`
- `app/types/global.ts`
- `app/types/supabase.d.ts`
- `supabase/seed/main.sql`

## Future improvements (out of scope here)

- Multi-select brands
- Show counts in the dropdown (e.g., “Blenda Labs (3)”)
- Route `ErrorBoundary` with friendly copy for “Team not found” / “Access denied”.
- Automated tests: unit tests for slug-to-ID lookup and template filtering logic; component test for BrandSelect URL updates
- Composite index on `(team_id, user_id)` for membership checks
