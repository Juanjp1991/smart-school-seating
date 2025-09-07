# 5. Core Logic & Algorithms

- **Placement Algorithm (`placementAlgorithm.js`):**
  - **Input:** A layout object, an array of student objects, a sorted array of rule objects.
  - **Process:**
    1.  Get all available seat coordinates.
    2.  Iterate through rules by priority, placing students to satisfy constraints.
    3.  Place remaining students randomly in remaining seats.
  - **Output:** A `positions` object mapping student IDs to seat coordinates.

---
