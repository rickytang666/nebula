"""
Simple test script to verify JWT authentication.
Run this after setting up your .env file with Supabase credentials.

Usage:
    python scripts/test_auth.py <your_jwt_token>
"""

import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Add backend directory to path for imports
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Load .env from backend directory
load_dotenv(backend_dir / ".env")

from app.core.database import get_supabase

def test_jwt_verification(token: str):
    """Test JWT token verification"""
    try:
        print("Testing JWT verification...")
        print(f"Token: {token[:20]}...")
        
        # Get Supabase client
        supabase = get_supabase()
        print("✓ Supabase client created")
        
        # Verify token
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            print("✗ Token verification failed: No user returned")
            return False
        
        user = user_response.user
        print(f"✓ Token verified successfully")
        print(f"  User ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  Role: {getattr(user, 'role', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_auth.py <jwt_token>")
        print("\nTo get a token:")
        print("1. Run: python scripts/get_test_token.py")
        print("2. Copy the access_token from the output")
        print("3. Run: python scripts/test_auth.py <token>")
        sys.exit(1)
    
    token = sys.argv[1]
    success = test_jwt_verification(token)
    sys.exit(0 if success else 1)

