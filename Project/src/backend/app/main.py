from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import notes, users, profiles, embeddings

app = FastAPI(
    title="Notes App API",
    description="API for the Notes App",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(notes.router)
app.include_router(users.router)
app.include_router(profiles.router)
app.include_router(embeddings.router)

@app.get("/")
def root():
    return {"message": "Notes App API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

