# 5. Core Logic & Algorithms

- **Placement Algorithm (`placementAlgorithm.js`):**
  - **Input:** A layout object, an array of student objects, a sorted array of rule objects (by priority).
  - **Process:**
    1.  Get a list of all available seat coordinates from the layout.
    2.  Iterate through the `rules` array from highest to lowest priority.
    3.  For each rule, try to place the specified students in a way that satisfies the constraint. Once a student is placed, remove them and the seat from the available pools.
    4.  After all rules are processed, place the remaining unplaced students randomly in the remaining available seats.
  - **Output:** A `positions` object mapping each student ID to a seat coordinate.

---
