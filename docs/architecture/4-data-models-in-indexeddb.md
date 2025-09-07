# 4. Data Models (in IndexedDB)

- **`layouts` store:** `id`, `name`, `grid_rows`, `grid_cols`, `furniture` (JSON)
- **`rosters` store:** `id`, `name`
- **`students` store:** `id`, `roster_id`, `name`, `photo` (base64), `ratings` (JSON)
- **`rules` store:** `id`, `roster_id`, `priority`, `type`, `student_ids`, `is_active`
- **`seating_plans` store:** `id`, `roster_id`, `layout_id`, `name`, `positions` (JSON)

---
