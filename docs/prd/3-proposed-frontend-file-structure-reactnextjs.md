# 3. Proposed Frontend File Structure (React/Next.js)

/src
|
|-- /app                  # Main application pages/routes (Next.js App Router)
|   |-- /layout-editor    # View for creating/editing layouts
|   |-- /rosters          # View for managing rosters and students
|   |-- /plan-editor      # View for creating/editing seating plans
|   |-- page.js           # The main entry point/dashboard
|
|-- /components           # Reusable UI elements
|   |-- /common           # Generic: Button.js, Modal.js, Input.js
|   |-- /layout           # Specific: Grid.js, FurnitureItem.js, LayoutToolbar.js
|   |-- /roster           # Specific: StudentForm.js, CsvImportModal.js
|   |-- /plan             # Specific: StudentCard.js, RuleBuilder.js
|   |-- /ui               # App-level: MainLayout.js, Sidebar.js, Header.js
|
|-- /lib                  # Core application logic and services
|   |-- db.js             # The IndexedDB service (all database logic)
|   |-- placementAlgorithm.js # The core seating arrangement logic
|   |-- exportService.js  # Logic for PDF and JSON export/import
|
|-- /hooks                # Custom React hooks (e.g., useRosters, useLayouts)
|
|-- /styles               # Global CSS and styles
|-- globals.css


---
