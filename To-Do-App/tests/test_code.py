import pytest
from datetime import date

from src.backend.db import get_connection


# Helper function to clear the table before and after each test
def clear_table():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM tasks")
        conn.commit()
    finally:
        conn.close()

def fetch_task(item: str):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM tasks WHERE title=%s", (item,))
            return cursor.fetchone()
    finally:
        conn.close()

@pytest.fixture(autouse=True)
def run_before_tests():
    # Clear DB before each test
    clear_table()
    yield
    clear_table()



# export PYTHONPATH=$PYTHONPATH:$(pwd)/src
# pytest