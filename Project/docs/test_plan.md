# Test Plan

## 1. Introduction
This document outlines the testing strategy for the SE101 Team Project. The goal is to ensure code reliability, prevent regressions, and meet the requirement of >= 70% code coverage.

## 2. Testing Scope

### 2.1 Backend (Python / FastAPI)
*   **Target Directory**: `src/backend`
*   **Test Directory**: `tests/backend`
*   **Framework**: `pytest`
*   **Types of Tests**:
    *   **Unit Tests**: Testing individual functions, Pydantic models, and utility classes in isolation.
    *   **Integration Tests**: Testing API endpoints (`routes`) using `TestClient` to verify request/response cycles and error handling. We will mock external dependencies (Supabase, AI APIs) where appropriate to keep tests fast and deterministic.

### 2.2 Frontend (React Native / Expo)
*   **Target Directory**: `src/frontend`
*   **Test Directory**: `tests/frontend`
*   **Framework**: `jest` (standard for React Native)
*   **Types of Tests**:
    *   **Unit Tests**: Testing utility functions, hooks, and state logic.
    *   **Component Tests**: Verifying component rendering and user interactions using `react-test-renderer` or `@testing-library/react-native`.
    *   **Snapshot Tests**: Capturing UI states to detect unintended visual changes.

## 3. Tools & Dependencies

### Backend
*   `pytest`: Main testing framework.
*   `pytest-cov`: For measuring code coverage.
*   `httpx`: Required for FastAPI `TestClient`.

### Frontend
*   `jest`: Main testing runner.
*   `jest-expo`: Preset for Expo projects.
*   `@testing-library/react-native`: (Recommended) for user-centric component testing.

## 4. Directory Structure
The `tests` directory at the project root will be organized as follows:
```
tests/
├── backend/
│   ├── conftest.py          # Fixtures (client, mock env)
│   ├── unit/
│   │   ├── test_models.py
│   │   └── test_utils.py
│   └── integration/
│       ├── test_auth_routes.py
│       └── test_notes_routes.py
└── frontend/
    ├── component_tests/
    └── unit_tests/
```

## 5. Execution Plan
1.  **Setup**: Install testing dependencies for both backend and frontend.
2.  **Backend Implementation**:
    *   Configure `pytest`.
    *   Write tests for core models (User, Note).
    *   Write integration tests for `auth` and `notes` endpoints.
3.  **Frontend Implementation**:
    *   Ensure `jest` configuration is correct.
    *   Write unit tests for critical helper functions.
    *   Add snapshot tests for main screens.
4.  **CI/CD**: Configure `pytest` and `jest` to run on push (if CI pipeline is set up).

## 6. Requirements Coverage
Tests will address the functionality defined in `docs/user_stories.md`, specifically:
*   US-001 to US-004 (Auth)
*   US-006 to US-013 (Notes CRUD)
