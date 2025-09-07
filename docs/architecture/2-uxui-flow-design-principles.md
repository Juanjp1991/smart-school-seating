# 2. UX/UI Flow & Design Principles

- **Core Principle:** Simplicity and Focus. The UI must be clean, intuitive, and minimize clicks.
- **Onboarding:** First-time users will be guided by a simple, dismissible tooltip to "Create Your First Classroom Layout."

## 2.1. Screen: Layout Editor
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

## 2.2. Screen: Roster Management
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

## 2.3. Screen: Seating Plan Editor
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
