"""
Quick script to create a test user and get a JWT token.
This creates a user via Supabase auth and returns a valid JWT token for testing.

Usage:
    python scripts/get_test_token.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

# Load .env from backend directory
backend_dir = Path(__file__).parent.parent
load_dotenv(backend_dir / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")

def create_test_user():
    """Create a test user and return JWT token"""
    
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY not found in .env")
        return None
    
    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    # Test credentials
    test_email = "test@example.com"
    test_password = "testpassword123"
    
    print(f"Creating test user: {test_email}")
    print("-" * 50)
    
    try:
        # Try to sign up (create new user)
        print("Attempting to sign up new user...")
        response = supabase.auth.sign_up({
            "email": test_email,
            "password": test_password
        })
        
        if response.user:
            print(f"✅ User created: {response.user.email}")
            print(f"   User ID: {response.user.id}")
            
            if response.session:
                print(f"\n✅ JWT Token obtained!")
                print("-" * 50)
                print(f"Access Token:\n{response.session.access_token}")
                print("-" * 50)
                print(f"\nTest this token:")
                print(f"python scripts/test_auth.py {response.session.access_token}")
                return response.session.access_token
            else:
                print("\n⚠️  User created but no session returned.")
                print("   This might mean email verification is required.")
                print("   Check your Supabase dashboard -> Authentication -> Providers")
                print("   Make sure 'Confirm email' is disabled for testing.")
                
    except Exception as e:
        error_msg = str(e)
        if "User already registered" in error_msg or "already been registered" in error_msg:
            print("⚠️  User already exists, trying to sign in instead...")
            try:
                # User exists, sign in
                response = supabase.auth.sign_in_with_password({
                    "email": test_email,
                    "password": test_password
                })
                
                if response.session:
                    print(f"✅ Signed in successfully!")
                    print(f"   User ID: {response.user.id}")
                    print(f"   Email: {response.user.email}")
                    print("-" * 50)
                    print(f"Access Token:\n{response.session.access_token}")
                    print("-" * 50)
                    print(f"\nTest this token:")
                    print(f"python scripts/test_auth.py {response.session.access_token}")
                    return response.session.access_token
            except Exception as signin_error:
                print(f"❌ Sign in failed: {signin_error}")
        else:
            print(f"❌ Error: {error_msg}")
    
    return None

if __name__ == "__main__":
    print("=" * 50)
    print("Supabase Test Token Generator")
    print("=" * 50)
    print()
    
    token = create_test_user()
    
    if token:
        print("\n✅ Success! You can now test authentication.")
        print("\nNext steps:")
        print("1. Copy the access token above")
        print("2. Run: python scripts/test_auth.py <token>")
        print("3. Or test with curl:")
        print(f'   curl -H "Authorization: Bearer {token[:30]}..." \\')
        print("        http://localhost:8000/users/me")
    else:
        print("\n❌ Failed to get token.")
        print("\nTroubleshooting:")
        print("1. Check your .env file has correct SUPABASE_URL and SUPABASE_KEY")
        print("2. Go to Supabase dashboard -> Authentication -> Providers")
        print("3. Make sure Email provider is enabled")
        print("4. Disable 'Confirm email' for testing")

