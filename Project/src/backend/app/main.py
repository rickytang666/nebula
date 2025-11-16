from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import notes, users, profiles

app = FastAPI(
    title="Notes App API",
    description="API for the Notes App",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:19006",  # Expo default
    "http://localhost:8081",   # Expo Metro
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(notes.router)
app.include_router(users.router)
app.include_router(profiles.router)

@app.get("/")
def root():
    return {"message": "Notes App API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

