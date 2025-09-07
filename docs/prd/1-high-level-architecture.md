# 1. High-Level Architecture

- **Approach:** **Local-First Architecture**. All user data is stored exclusively in the user's browser via **IndexedDB**. The server is stateless and only serves the application files.
- **Frontend:** **React** (using Next.js framework).
- **Backend:** **Node.js** (using Express) - A minimal server for serving the static frontend application.
- **Data Portability:** App data can be backed up and restored via a user-controlled **JSON Import/Export** feature.

---
