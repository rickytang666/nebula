# Nebula

**A comprehensive mobile application for creating, organizing, and sharing notes.**

Key Features:

- **Rich Text Editing**: Create notes with ease.
- **OCR Integration**: Capture text and math from images using AI.
- **Cloud Sync**: Securely store data with our deployed GCP backend.

## Important: Network & Backend Connection

> [!WARNING]
> **Localhost will not work on physical devices.**
> If running the frontend on a real device, `localhost` (127.0.0.1) cannot access the backend running on your computer.
>
> - **Option A (Recommended)**: Set `__DEV__ = true` in the frontend config to use our deployed GCP backend.
> - **Option B**: Use `ngrok` to tunnel your local backend and update the API URL.

## Prerequisites

- Python 3.8+
- Node.js & npm
- SQLite (included with Python)

## Backend

1. **Setup**:

   ```bash
   cd src/backend
   ./setup.sh
   ```

   _Creates venv, installs requirements, drafts .env._

2. **Run**:
   ```bash
   ./run.sh
   ```
   _Starts API at http://0.0.0.0:8000._

## Frontend

1. **Setup**:

   ```bash
   cd src/frontend
   npm install
   ```

2. **Run**:
   ```bash
   npx expo start
   ```
   _Press `i` for iOS simulator, `a` for Android emulator._

## Testing

Run the full suite (backend + frontend):

```bash
./run_tests.sh
```
