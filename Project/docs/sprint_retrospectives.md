# Sprint Retrospectives

## Sprint 1: Foundation & Authentication
**Dates:** Oct 28 - Nov 11
**Goal:** Initialize React Native, FastAPI, and Supabase Auth.

### What went well?
- **Rapid Setup:** We successfully established the backbone for both Frontend (ID #14) and Backend (ID #16) in the first week.
- **Supabase Integration:** Switching to Supabase for Auth (ID #50, #59) saved us significant time compared to building a custom JWT solution. We managed to get the Signup and Login flows working by Nov 26.
- **Academic Feedback:** We received an "A+" on our initial sprint deliverables (ID #58), confirming our architecture choices were solid.

### What didn't go well?
- **RLS Complexity:** Setting up Row Level Security (RLS) policies for the `notes` and `profiles` tables (ID #60) was trickier than expected, requiring multiple schema revisions to ensure users could only access their own data.
- **Scope Ambiguity:** We initially had some confusion distinguishing between "User" and "Profile" data, which delayed the profile management endpoints slightly.

### Action Items
- Standardize the `.env` setup for all team members to prevent connection issues.
- Document the RLS policies in `schema.sql` clearly for future reference.

---

## Sprint 2: Core Functionality (CRUD)
**Dates:** Nov 12 - Nov 25
**Goal:** Implement Note CRUD, Search, and connect Frontend to Backend.

### What went well?
- **Frontend Velocity:** The team crushed the UI tasks, delivering the Notes List (ID #49), Search Bar (ID #52), and Filter/Sort controls (ID #53) ahead of schedule.
- **Visual Polish:** The "Masonry/Sliding" view for notes (ID #51) gave the app a unique look early on, separating it from standard list-based apps.
- **Feedback:** Continued strong performance with another "A+" grade for this sprint (ID #70).

### What didn't go well?
- **Auth Guard Delays:** The "Auth Guard" (ID #15) to protect routes took longer than expected to stabilize (closed Nov 25), meaning we had to manually test protected routes for a while.
- **Data Migration:** Moving from local storage to the real Backend API (ID #72) exposed several bugs in how we handled date formats between Python and JavaScript.

### Action Items
- Implement a dedicated `api.ts` service to centralize all backend calls.
- Fix the "Sign Out" bug (ID #73) that wasn't properly clearing the session state.

---

## Sprint 3: AI Features & Vector Search
**Dates:** Nov 26 - Dec 9
**Goal:** Implement Gemini AI, Vector Database, and Profile UI.

### What went well?
- **AI Integration:** We successfully researched and implemented the Gemini API backend (ID #66) and the corresponding Frontend UI (ID #67) without hitting major blockers.
- **Vector DB:** We chose and implemented a Vector Database solution (ID #65) that enables our semantic search feature, a key differentiator for the project.
- **Profile Page:** The Profile UI (ID #61) was completed smoothly, allowing users to update their information.

### What didn't go well?
- **Real-Time Complexity:** We spent time investigating WebSockets for real-time collaboration (ID #68), but realized the complexity (CRDTs, conflict resolution) was too high for our remaining timeline. We decided to deprioritize "Shared Editing" (US-024) to focus on AI.

### Action Items
- Pivot fully to AI-centric features (OCR, Summarization) instead of Real-Time collaboration.
- Refine the "Content Explanation" (US-018) prompts to give better results.

---

## Sprint 4: Polish, OCR & Testing
**Dates:** Dec 10 - Dec 18
**Goal:** Implement OCR, Finalize Testing, and Rebranding.

### What went well?
- **OCR Delivery:** We successfully implemented the "Scan to Note" feature (ID #75) using Mistral OCR, satisfying US-017.
- **Rebranding:** We officially renamed the app to "Nebula" (ID #76, #78) and updated the UI to match the new identity.
- **Testing:** We crunched the unit and integration tests (ID #77) in the final week to ensure we met the coverage requirements.

### What didn't go well?
- **Testing Crunch:** Leaving the bulk of test writing (ID #77) until the very end created a stressful final few days. Ideally, we should have written tests alongside features throughout the semester.
- **Priority Tags:** Feedback from Sprint 3 mentioned we needed "more priority tags" (ID #74), which we scrambled to retroactively apply to our issue board.

### Action Items
- Complete the final demo video and presentation.
- Merge the `issue-#78-enhance-ui` branch as the final polish before submission.