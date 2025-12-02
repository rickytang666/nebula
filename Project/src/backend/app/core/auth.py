from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.database import get_supabase
from supabase import Client

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify JWT token and return current user.
    Uses Supabase to verify JWT tokens and extract user information.
    
    Returns:
        dict: User information including id, email, and other auth metadata
        
    Raises:
        HTTPException: 401 if token is invalid, expired, or malformed
    """
    token = credentials.credentials
    
    try:
        # Create Supabase client and verify token
        supabase: Client = get_supabase()
        
        # Verify token and get user info
        # This validates the JWT signature, expiry, and returns user data
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Extract user data
        user = user_response.user
        
        # Return user data as dict
        user_dict = {
            "id": str(user.id),
            "email": user.email,
            "aud": user.aud if hasattr(user, 'aud') else None,
            "role": user.role if hasattr(user, 'role') else None,
            "created_at": str(user.created_at) if hasattr(user, 'created_at') else None,
        }
        
        return user_dict
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except AttributeError as e:
        # Handle missing Supabase client or auth attribute
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service not configured",
        )
    except Exception as e:
        # Handle any other errors (expired token, invalid signature, etc.)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_authenticated_client(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Client:
    """
    Get a Supabase client authenticated as the current user.
    This ensures RLS policies are applied correctly.
    """
    token = credentials.credentials
    client = get_supabase()
    client.postgrest.auth(token)
    return client
