# 2. UX/UI Flow & Design Principles

- **Core Principle:** Simplicity and Focus. The UI must be clean, intuitive, and minimize clicks.
- **Onboarding:** First-time users will be guided by a simple, dismissible tooltip to "Create Your First Classroom Layout."
- **Main User Flow:**
  1.  **Layout Creation (`/layout-editor`):** User selects tools from a top toolbar (Set Size, Student Seat, Teacher's Desk, Door) and clicks on a grid to design a layout, then saves it as a template.
  2.  **Roster Management (`/rosters`):** A two-panel view. Left panel lists rosters. Right panel lists students in the selected roster. A modal window is used for adding students manually or via a 3-step CSV import (Upload -> Map Columns -> Confirm).
  3.  **Plan Creation (`/plan-editor`):** User selects a saved Layout and a Roster. The screen shows a list of unplaced students on the left and the empty classroom grid on the right.
  4.  **Generation & Refinement:** User defines and prioritizes rules, then clicks "Auto-Place." The algorithm places students. The teacher can then make manual drag-and-drop adjustments.
  5.  **Export:** User clicks "Export" to generate a clean PDF of the final plan.

---
