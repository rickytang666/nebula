import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add src/backend to python path so we can import 'app'
# This path is relative to Project/tests/backend/conftest.py
# We need to go up 3 levels: backend -> tests -> Project -> then down to src/backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src/backend')))

from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
