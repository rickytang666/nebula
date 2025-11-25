# backend

fastapi backend for notes app

## setup

1. create virtual environment

```bash
python -m venv venv
source venv/bin/activate  # on mac/linux
# or
venv\Scripts\activate  # on windows
```

2. install dependencies

```bash
pip install -r requirements.txt
```

3. create `.env` file

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

4. run database schema in supabase sql editor

```bash
# copy and paste schema.sql content into supabase sql editor
```

5. run server

```bash
uvicorn app.main:app --reload
```

server runs on `http://localhost:8000`

## api docs

- swagger ui: `http://localhost:8000/docs`
- redoc: `http://localhost:8000/redoc`

## endpoints

- `GET /` - health check
- `GET /health` - health check
- `GET /notes` - list notes
- `GET /notes/{id}` - get note
- `POST /notes` - create note
- `PUT /notes/{id}` - update note
- `DELETE /notes/{id}` - delete note
- `GET /notes/search?q=...` - search notes
- `GET /users/me` - get current user

all endpoints (except `/` and `/health`) require authentication (bearer token)

## testing authentication

1. get a test jwt token

```bash
python scripts/get_test_token.py
```

2. test jwt verification

```bash
python scripts/test_auth.py <your_jwt_token>
```

3. test with curl

```bash
# health check (no auth required)
curl http://localhost:8000/health

# get current user (requires auth)
curl -H "Authorization: Bearer <your_jwt_token>" \
     http://localhost:8000/users/me
```
