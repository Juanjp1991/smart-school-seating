# 3. Proposed Frontend File Structure (React/Next.js)

/src
|
|-- /app                  # Main application pages/routes
|   |-- /layout-editor
|   |-- /rosters
|   |-- /plan-editor
|   |-- page.js
|
|-- /components           # Reusable UI elements
|   |-- /common           # Button.js, Modal.js, Input.js
|   |-- /layout           # Grid.js, FurnitureItem.js, LayoutToolbar.js
|   |-- /roster           # StudentForm.js, CsvImportModal.js
|   |-- /plan             # StudentCard.js, RuleBuilder.js
|   |-- /ui               # MainLayout.js, Header.js
|
|-- /lib                  # Core application logic
|   |-- db.js             # IndexedDB service
|   |-- placementAlgorithm.js
|   |-- exportService.js
|
|-- /hooks                # Custom React hooks
|
|-- /styles               # Global CSS
|-- globals.css


---
