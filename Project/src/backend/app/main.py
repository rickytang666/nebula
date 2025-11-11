from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Add this import
from app.routes.users import router as user_router
#from .. import router as ...

app = FastAPI()

# CORS for your frontend (uncomment this)
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers - remove the prefix since it's already defined in auth.py
app.include_router(user_router)

@app.get("/")
def root():
    return {"message": "Backend is running!"}

