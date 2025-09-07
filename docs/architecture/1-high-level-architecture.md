# 1. High-Level Architecture

- **Approach:** **Local-First Architecture**. All user data (layouts, students, rules) is stored exclusively in the user's browser via **IndexedDB**. The server is stateless.
- **Frontend:** **React** (using Next.js).
- **Backend:** **Node.js** (using Express) - To serve the static application files.
- **Data Portability:** The app will include **Import/Export functionality** (JSON).

---
