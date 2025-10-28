from typing import Optional, Tuple
from datetime import date
from dotenv import load_dotenv
import pymysql
import os

#Task = Tuple[int, str, str, Optional[str], date, str]

# Load environment variables for DB
load_dotenv()


# Database connection settings
DB_CONFIG = {
    "host": os.environ.get("DB_HOST"),
    "user": os.environ.get("DB_USER"),
    "password": os.environ.get("DB_PASSWORD"),
    "database": os.environ.get("DB_NAME"),
    "cursorclass": pymysql.cursors.DictCursor
}

# --- Database Connection ---
def get_connection():
    return pymysql.connect(**DB_CONFIG)

'''
  id SERIAL PRIMARY KEY,
  userid VARCHAR(255),
  title TEXT,
  description TEXT,
  due_date DATE,
  status TEXT
'''
