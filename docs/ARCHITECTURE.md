# Technical Architecture Document - SmartSchool

- **Version:** 2.1 (MVP)
- **Status:** Approved
- **Date:** September 5, 2025

---

## 1. High-Level Architecture

- **Approach:** **Local-First Architecture**. All user data (layouts, students, rules) is stored exclusively in the user's browser via **IndexedDB**. The server is stateless.
- **Frontend:** **Vanilla HTML/CSS/JavaScript** (using Tailwind CSS for styling).
- **Backend:** **Node.js** (using Express) - To serve the static application files.
- **Data Portability:** The app will include **Import/Export functionality** (JSON).

---

## 2. UX/UI Flow & Design Principles

- **Core Principle:** Simplicity and Focus. The UI must be clean, intuitive, and minimize clicks.
- **Onboarding:** First-time users will be guided by a simple, dismissible tooltip to "Create Your First Classroom Layout."

### 2.1. Screen: Layout Editor
- **Goal:** Allow a teacher to quickly create and save a reusable classroom layout template.
- **Mockup (Toolbar on Top):**

+--------------------------------------------------------------------+
| [Rows: 8] [Cols: 6] | Tools: [Seat] [Desk] [Door] | [Rotate] | [Save] |
+--------------------------------------------------------------------+
|                                                                    |
|                           MAIN GRID CANVAS                         |
|                        (Teacher clicks to place)                     |
|                                                                    |
+--------------------------------------------------------------------+

- **User Flow:**
1.  Teacher sets the grid size (rows, cols).
2.  Teacher selects a "tool" from the toolbar (Seat, Desk, or Door).
3.  Teacher clicks on the grid to "paint" the items. Seats are 1x1, Doors are 1x1, Desks are 1x2.
4.  The "Rotate" button toggles the Desk placement between horizontal and vertical.
5.  Teacher clicks "Save" to name and save the template.

### 2.2. Screen: Roster Management
- **Goal:** Allow a teacher to manage their class lists and import students in bulk.
- **Mockup (Two-Panel Layout):**

+----------------------+------------------------------------------+
| ROSTERS              | STUDENTS in "Period 3 English"           |
|                      |                                          |
| * Period 3 English   | + [Add Student]  [Import from CSV]       |
| * Homeroom 101       |                                          |
|                      | [Photo] John Doe    [Edit] [Delete]      |
| + [Create Roster]    | [Photo] Jane Smith  [Edit] [Delete]      |
+----------------------+------------------------------------------+

- **User Flow (CSV Import):**
1.  User clicks **[Import from CSV]**. A modal pops up.
2.  **Step 1:** The modal asks the user to select a file and shows the required column format.
3.  **Step 2 (Mapping):** After file selection, the modal shows the headers from the user's file next to dropdowns, allowing them to map their columns to the app's fields (e.g., `student_full_name` -> `Student Name`).
4.  **Step 3 (Confirm):** The modal shows a preview of the first few students with the correctly mapped data. The user clicks "Confirm Import" to add the students to the roster.

### 2.3. Screen: Seating Plan Editor
- **Goal:** The main workspace where a teacher combines a layout and a roster to create a seating plan.
- **Mockup (Two-Panel Layout):**

+----------------------+------------------------------------------+
| UNPLACED STUDENTS    | CLASSROOM: "Room 201 Layout"             |
| Roster: "Period 3"   |                                          |
|                      | +------------------------------------+   |
| [Photo] John Doe     | | [Seat] [Seat] [    ] [Seat] [Seat] |   |
| [Photo] Jane Smith   | | [Seat] [Seat] [    ] [Seat] [Seat] |   |
| ...                  | | [Desk] [    ] [    ] [Seat] [Seat] |   |
|                      | +------------------------------------+   |
| [Auto-Place All]     |              [Display Options] [Export]  |
+----------------------+------------------------------------------+

- **User Flow:**
1.  Teacher selects a saved Layout and a Roster.
2.  The screen loads with unplaced students on the left and the empty layout on the right.
3.  Teacher defines and prioritizes rules for this plan.
4.  Teacher clicks **[Auto-Place All]**. The algorithm places students on the grid.
5.  Teacher can make manual drag-and-drop adjustments.
6.  Teacher can use **[Display Options]** to toggle data overlays (like ratings) on the student cards.
7.  Teacher clicks **[Export]** to generate the final PDF.

---

## 3. Current Frontend File Structure (Vanilla JavaScript)

/
|
|-- index.html            # Main HTML entry point
|
|-- /js                   # JavaScript modules
|   |-- app.js            # Main application controller
|   |-- storage.js        # Local storage service
|   |-- layout-editor.js  # Layout editing functionality
|   |-- roster-manager.js # Roster management
|   |-- plan-editor.js    # Seating plan generation
|
|-- styles.css            # Main stylesheet with Tailwind CSS


---

## 4. Data Models (in IndexedDB)

- **`layouts` store:** `id`, `name`, `grid_rows`, `grid_cols`, `furniture` (JSON)
- **`rosters` store:** `id`, `name`
- **`students` store:** `id`, `roster_id`, `name`, `photo` (base64), `ratings` (JSON)
- **`rules` store:** `id`, `roster_id`, `priority`, `type`, `student_ids`, `is_active`
- **`seating_plans` store:** `id`, `roster_id`, `layout_id`, `name`, `positions` (JSON)

---

## 5. Core Logic & Algorithms

- **Placement Algorithm (`placementAlgorithm.js`):**
  - **Input:** A layout object, an array of student objects, a sorted array of rule objects.
  - **Process:**
    1.  Get all available seat coordinates.
    2.  Iterate through rules by priority, placing students to satisfy constraints.
    3.  Place remaining students randomly in remaining seats.
  - **Output:** A `positions` object mapping student IDs to seat coordinates.

---

## 6. Sprint-by-Sprint Technical Breakdown

- **Sprint 1: Layout Management**
- **Sprint 2: Student & Roster Management**
- **Sprint 3: The Intelligent Placement Engine**
- **Sprint 4: Toggles, Export & Finalization**


