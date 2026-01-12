<div align="center">
  <img src="./frontend/public/logo.svg" alt="Nebula Logo" width="120" height="120" />
  <h1>Nebula</h1>
  <p><strong>Mobile notes for the modern mind. AI-powered. Cloud-synced. Fast.</strong></p>


![GitHub stars](https://img.shields.io/github/stars/rickytang666/nebula?style=social)
![GitHub forks](https://img.shields.io/github/forks/rickytang666/nebula?style=social)
![GitHub repo size](https://img.shields.io/github/repo-size/rickytang666/nebula)
![GitHub top language](https://img.shields.io/github/languages/top/rickytang666/nebula)
![GitHub last commit](https://img.shields.io/github/last-commit/rickytang666/nebula?color=red)


</div>

---

## Key Features

- **Rich Text**: Effortless, markdown-based note-taking.
- **AI OCR**: Extract text & math from images/camera instantly.
- **Improve Search**: Semantic search for notes, quick note lookup.
- **AI Chat**: Chat with Gemini about your notes.
- **Sync**: Real-time cloud storage via **Supabase**.
- **Secure**: Modern-level Auth & Backend on **GCP Cloud Run**.

## Quick Start

**Prerequisites:** `Python 3.8+`, `Node.js 20+`, `gcloud` CLI.

### Backend

```bash
cd backend
./setup.sh
./run.sh
```

(Requires `.env` with Supabase & OpenAI/Mistral keys. See `backend/README.md`)

### Frontend

```bash
cd frontend
./setup.sh
./run.sh
```

(Press `i` for iOS Simulator, `a` for Android Emulator)

> [!WARNING]
> `localhost` won't work on your phone. To test on a real device, point `EXPO_PUBLIC_API_URL` to your deployed backend or use `ngrok` to convert `localhost` to a public URL.

## Testing

```bash
./run_tests.sh
```

## Architecture

- **Frontend**: React Native / Expo
- **Backend**: FastAPI
- **Database**: Supabase (PostgreSQL)
- **Infra**: GCP Cloud Run
