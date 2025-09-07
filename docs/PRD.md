# Product Requirements Document (PRD) - SmartSchool

- **Version:** 1.0 (MVP)
- **Status:** Approved
- **Date:** September 5, 2025

---

## 1. Introduction & Vision

### 1.1. Problem Statement
Teachers invest significant time and effort in creating and managing classroom seating arrangements. The process is often manual and complex, requiring the balance of multiple student factors like academic performance, behavior, and support needs.

### 1.2. Proposed Solution & Vision
"SmartSchool" is a privacy-first web application designed to be an intelligent assistant for teachers. It will empower them to create optimized seating plans quickly and effectively by using a data-driven engine with customizable, prioritized rules.

### 1.3. Target Audience
- **Primary:** K-12 Classroom Teachers
- **Secondary:** Substitute Teachers, Department Heads

---

## 2. MVP Feature Requirements & User Stories

### 2.1. Feature: Grid-Based Layout Templates
- **Story 1.1 (Create):** "As a teacher, I want to create a classroom layout by specifying the number of rows and columns, so that I can quickly define the basic structure of my room."
  - **Acceptance Criteria:**
    - ✅ User can input a number for rows and columns.
    - ✅ The UI displays a grid matching the specified dimensions.
- **Story 1.2 (Add Furniture):** "As a teacher, I want to place a teacher's desk (2 blocks) and a door (1 block) onto my grid layout, so that the virtual classroom represents the key fixed elements of my physical room."
  - **Acceptance Criteria:**
    - ✅ User can select a "Teacher's Desk" tool.
    - ✅ The UI highlights two adjacent grid cells for placement.
    - ✅ User can rotate the desk highlight between horizontal and vertical.
    - ✅ User can click to place the desk on the grid.
    - ✅ User can select and place a one-block "Door" on the grid.
- **Story 1.3 (Place Seats):** "As a teacher, I want to place student seats by clicking on grid spaces, so I can easily 'paint' the seating area."
  - **Acceptance Criteria:**
    - ✅ User can select a "Student Seat" tool.
    - ✅ Clicking an empty grid cell turns it into a "seat".
    - ✅ Clicking a "seat" cell turns it back into an empty cell.
- **Story 1.4 (Save):** "As a teacher, I want to save a completed classroom layout as a named template, so that I don't have to recreate it every time."
  - **Acceptance Criteria:**
    - ✅ A "Save" button exists.
    - ✅ Clicking "Save" prompts the user for a template name.
    - ✅ The layout, including seats and furniture, is saved locally.
- **Story 1.5 (Load):** "As a teacher, I want to easily load one of my saved layout templates, so that I can begin arranging students immediately."
  - **Acceptance Criteria:**
    - ✅ The UI displays a list of saved layout templates.
    - ✅ Clicking a template name loads its grid dimensions, seats, and furniture onto the editor canvas.

### 2.2. Feature: Roster & Student Management
- **Story 2.1 (Create Roster):** "As a teacher, I want to create multiple named class rosters, so that I can manage my different classes or groups separately."
- **Story 2.2 (Add Student Manually):** "As a teacher, I want to add a student to a roster by filling out a form with their name, photo, and ratings, so that I can build my class list."
- **Story 2.3 (Import Students via CSV):** "As a teacher, I want to import a class list from a CSV file, so that I can add all my students in bulk quickly."
  - **Acceptance Criteria:**
    - ✅ User can select a CSV file from their computer.
    - ✅ A "Map Columns" window appears after file selection.
    - ✅ The UI displays the headers from the user's CSV file and provides dropdowns to match them to the app's fields (Name, Behavior, etc.).
    - ✅ The user is shown a preview of the parsed data before final import.
    - ✅ Confirmed import adds all students from the CSV to the selected roster.

### 2.3. Feature: Prioritized Placement Rules
- **Story 3.1 (Create Rule):** "As a teacher, I want to create a placement rule by selecting one or more students and defining a constraint (e.g., 'must not sit together'), so that I can codify my classroom management strategies."
- **Story 3.2 (View Rules):** "As a teacher, I want to see a clear list of all the rules I've created for a class, so that I can easily review and manage them."
- **Story 3.3 (Prioritize Rules):** "As a teacher, I want to be able to drag and re-order the rules in my list, so that I can tell the system which rules are most important to follow."
- **Story 3.4 (Apply Rules):** "As a teacher, I want to press a button to automatically place students according to my prioritized rules, so that I can generate an optimized seating plan." **[PLANNED FOR FUTURE IMPLEMENTATION]**
- **Story 3.5 (Toggle Rule):** "As a teacher, I want to be able to temporarily disable a rule without deleting it, so that I can experiment with different seating arrangements." **[PLANNED FOR FUTURE IMPLEMENTATION]**

### 2.4. Feature: Toggleable Student Data Display
- **Story 4.1 (Toggle Data On):** "As a teacher, I want to select specific data points from a display menu, so that I can see this information directly on the seating chart."
- **Story 4.2 (Toggle Data Off):** "As a teacher, I want to be able to hide all additional data with a single click, so that I can return to a clean, simple view."

### 2.5. Feature: Printing & Data Portability
- **Story 5.1 (Export PDF):** "As a teacher, I want to export my final seating chart to a PDF that shows only the students' names and photos in their assigned seats, so that I have a clean, easy-to-read visual guide."
- **Story 5.2 (Backup Data):** "As a teacher, I want to export all my app data (layouts, rosters, etc.) into a single file, so that I can back it up or move it to another computer."
- **Story 5.3 (Restore Data):** "As a teacher, I want to import a backup file to restore all my data onto a new computer or browser, so that my work is portable."

---

## 3. Product Backlog (Post-MVP)
- **Interactive Classroom "Heat Map":** A visualization tool to display data overlays on the seating chart.

ARCHITECTURE.md (FINAL, COMPLETE)

Markdown

# Technical Architecture Document - SmartSchool

- **Version:** 2.0 (MVP)
- **Status:** Approved
- **Date:** September 5, 2025

---

## 1. High-Level Architecture

- **Approach:** **Local-First Architecture**. All user data is stored exclusively in the user's browser via **IndexedDB**. The server is stateless and only serves the application files.
- **Frontend:** **React** (using Next.js framework).
- **Backend:** **Node.js** (using Express) - A minimal server for serving the static frontend application.
- **Data Portability:** App data can be backed up and restored via a user-controlled **JSON Import/Export** feature.

---

## 2. UX/UI Flow & Design Principles

- **Core Principle:** Simplicity and Focus. The UI must be clean, intuitive, and minimize clicks.
- **Onboarding:** First-time users will be guided by a simple, dismissible tooltip to "Create Your First Classroom Layout."
- **Main User Flow:**
  1.  **Layout Creation (`/layout-editor`):** User selects tools from a top toolbar (Set Size, Student Seat, Teacher's Desk, Door) and clicks on a grid to design a layout, then saves it as a template.
  2.  **Roster Management (`/rosters`):** A two-panel view. Left panel lists rosters. Right panel lists students in the selected roster. A modal window is used for adding students manually or via a 3-step CSV import (Upload -> Map Columns -> Confirm).
  3.  **Plan Creation (`/plan-editor`):** User selects a saved Layout and a Roster. The screen shows a list of unplaced students on the left and the empty classroom grid on the right.
  4.  **Generation & Refinement:** User defines and prioritizes rules, then clicks "Auto-Place." The algorithm places students. The teacher can then make manual drag-and-drop adjustments.
  5.  **Export:** User clicks "Export" to generate a clean PDF of the final plan.

---

## 3. Proposed Frontend File Structure (React/Next.js)

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

## 4. Data Models (in IndexedDB)

- **`layouts` store:** `id`, `name`, `grid_rows`, `grid_cols`, `furniture` (JSON: `[{type: 'seat', row: y, col: x}, ...]`)
- **`rosters` store:** `id`, `name`
- **`students` store:** `id`, `roster_id`, `name`, `photo` (base64 string), `ratings` (JSON: `{"behavior": 4, "support": 5, "marks": 3}`)
- **`rules` store:** `id`, `roster_id`, `priority` (integer), `type` (string: 'SEPARATE', 'TOGETHER', 'FRONT_ROW'), `student_ids` (array of student ids), `is_active` (boolean)
- **`seating_plans` store:** `id`, `roster_id`, `layout_id`, `name`, `positions` (JSON: `{"student_id": "uuid", "row": y, "col": x}`)

---

## 5. Core Logic & Algorithms

- **Placement Algorithm (`placementAlgorithm.js`):**
  - **Input:** A layout object, an array of student objects, a sorted array of rule objects (by priority).
  - **Process:**
    1.  Get a list of all available seat coordinates from the layout.
    2.  Iterate through the `rules` array from highest to lowest priority.
    3.  For each rule, try to place the specified students in a way that satisfies the constraint. Once a student is placed, remove them and the seat from the available pools.
    4.  After all rules are processed, place the remaining unplaced students randomly in the remaining available seats.
  - **Output:** A `positions` object mapping each student ID to a seat coordinate.

---

## 6. Sprint-by-Sprint Technical Breakdown

- **Sprint 1: Layout Management**
  - **Goal:** User can create, save, load, import, and export layout templates.
- **Sprint 2: Student & Roster Management**
  - **Goal:** User can create class rosters and add students (manually or via CSV) with photos and ratings.
- **Sprint 3: The Intelligent Placement Engine**
  - **Goal:** User can create prioritized rules and automatically generate a seating plan.
- **Sprint 4: Toggles, Export & Finalization**
  - **Goal:** User can view the final plan, toggle data, and export it as a PDF.

