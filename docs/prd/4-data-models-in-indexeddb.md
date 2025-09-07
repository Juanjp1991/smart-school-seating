# 4. Data Models (in IndexedDB)

- **`layouts` store:** `id`, `name`, `grid_rows`, `grid_cols`, `furniture` (JSON: `[{type: 'seat', row: y, col: x}, ...]`)
- **`rosters` store:** `id`, `name`
- **`students` store:** `id`, `roster_id`, `name`, `photo` (base64 string), `ratings` (JSON: `{"behavior": 4, "support": 5, "marks": 3}`)
- **`rules` store:** `id`, `roster_id`, `priority` (integer), `type` (string: 'SEPARATE', 'TOGETHER', 'FRONT_ROW'), `student_ids` (array of student ids), `is_active` (boolean)
- **`seating_plans` store:** `id`, `roster_id`, `layout_id`, `name`, `positions` (JSON: `{"student_id": "uuid", "row": y, "col": x}`)

---
