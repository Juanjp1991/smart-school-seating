# 2. MVP Feature Requirements & User Stories

## 2.1. Feature: Grid-Based Layout Templates
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

## 2.2. Feature: Roster & Student Management
- **Story 2.1 (Create Roster):** "As a teacher, I want to create multiple named class rosters, so that I can manage my different classes or groups separately."
- **Story 2.2 (Add Student Manually):** "As a teacher, I want to add a student to a roster by filling out a form with their name, photo, and ratings, so that I can build my class list."
- **Story 2.3 (Import Students via CSV):** "As a teacher, I want to import a class list from a CSV file, so that I can add all my students in bulk quickly."
  - **Acceptance Criteria:**
    - ✅ User can select a CSV file from their computer.
    - ✅ A "Map Columns" window appears after file selection.
    - ✅ The UI displays the headers from the user's CSV file and provides dropdowns to match them to the app's fields (Name, Behavior, etc.).
    - ✅ The user is shown a preview of the parsed data before final import.
    - ✅ Confirmed import adds all students from the CSV to the selected roster.

## 2.3. Feature: Prioritized Placement Rules
- **Story 3.1 (Create Rule):** "As a teacher, I want to create a placement rule by selecting one or more students and defining a constraint (e.g., 'must not sit together'), so that I can codify my classroom management strategies."
- **Story 3.2 (View Rules):** "As a teacher, I want to see a clear list of all the rules I've created for a class, so that I can easily review and manage them."
- **Story 3.3 (Prioritize Rules):** "As a teacher, I want to be able to drag and re-order the rules in my list, so that I can tell the system which rules are most important to follow."
- **Story 3.4 (Apply Rules):** "As a teacher, I want to press a button to automatically place students according to my prioritized rules, so that I can generate an optimized seating plan."
- **Story 3.5 (Toggle Rule):** "As a teacher, I want to be able to temporarily disable a rule without deleting it, so that I can experiment with different seating arrangements."

## 2.4. Feature: Toggleable Student Data Display
- **Story 4.1 (Toggle Data On):** "As a teacher, I want to select specific data points from a display menu, so that I can see this information directly on the seating chart."
- **Story 4.2 (Toggle Data Off):** "As a teacher, I want to be able to hide all additional data with a single click, so that I can return to a clean, simple view."

## 2.5. Feature: Printing & Data Portability
- **Story 5.1 (Export PDF):** "As a teacher, I want to export my final seating chart to a PDF that shows only the students' names and photos in their assigned seats, so that I have a clean, easy-to-read visual guide."
- **Story 5.2 (Backup Data):** "As a teacher, I want to export all my app data (layouts, rosters, etc.) into a single file, so that I can back it up or move it to another computer."
- **Story 5.3 (Restore Data):** "As a teacher, I want to import a backup file to restore all my data onto a new computer or browser, so that my work is portable."

---
