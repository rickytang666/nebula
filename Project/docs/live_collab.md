# real-time collaboration via sockets

## overview
to allow multiple users to edit notes simultaneously, we need a **real-time engine** (websockets) and a **conflict resolution strategy** (crdt). standard request/response (http) is too slow and causes overwrite issues.

## core technologies

### 1. protocol: websockets
- **why**: enables persistent, bidirectional communication. server pushes updates to clients immediately.
- **implementation**: 
  - **backend**: fastapi has native websocket support (`@app.websocket("/ws/{note_id}")`).
  - **frontend**: react native has built-in `WebSocket` api.

### 2. data consistency: yjs (crdt)
- **why**: "last write wins" results in lost data. crdts (conflict-free replicated data types) merge changes mathematically, ensuring all users see the same result eventually.
- **library**: `yjs` is the industry standard.
  - **frontend**: `yjs` + `y-websocket` (client provider).
  - **backend**: `ypy-websocket` (python bindings) or simply relaying binary blobs.

## architecture approach

### node.js (recommended for yjs) vs. python (current stack)
since our backend is python (fastapi), we have two options:
1.  **python native (harder)**: use `ypy-websocket` in fastapi to decode yjs updates and save to supabase.
2.  **relay only (easier)**: backend blindly forwards binary messages between clients. one client is "authoritative" and saves to db (risky if client drops).

### proposed flow (python native)
1.  **connect**: client opens ws connection `ws://api.com/notes/{id}`.
2.  **load**: server fetches latest compressed yjs state from supabase, sends to client.
3.  **sync**: client edits -> sends incremental update (binary) -> server merges -> broadcasts to others.
4.  **save**: server debounces updates and saves snapshot to supabase `notes` table (blob column).

## frontend challenge: text editor
**current implementation**: `src/frontend/app/(app)/note/[id].tsx` uses a standard `<TextInput />`.
**the problem**: if user A types, user B receives the update. if we blindly update user B's `value` prop in `<TextInput>`, their cursor will jump to the end of the text. this effectively breaks typing.

**solutions**:
1.  **webview editor (recommended)**: replace `<TextInput />` with a webview wrapping **tiptap** or **quill**. these have native `yjs` bindings that handle cursors correctly.
2.  **custom native binding (very hard)**: write a custom logic to reconciling cursor position after every remote update. not recommended for short timelines.

## complexity rating: high (8/10)
- **backend**: moderate. stateful websockets are harder to scale/deploy than stateless http.
- **frontend**: very high. integrating crdt into a mobile text input is complex.

## action plan
1.  **backend**: add `ypy-websocket` to `requirements.txt`. creates websocket route.
2.  **database**: add `document_state` (binary) column to `notes` table.
3.  **frontend**: install `yjs`, `y-websocket`.
4.  **editor**: decide on webview editor (recommended) vs native input.
