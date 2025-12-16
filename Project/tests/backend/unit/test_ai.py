import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from app.routes.ai import process_ai_request, AIProcessRequest
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_process_ai_request_success():
    # Patch the global variable 'api_key' in the module
    # Patch the global variable 'api_key' in the module
    with patch("app.routes.ai.api_key", "fake-api-key"):
        
        # Mock GenAI
        with patch("app.routes.ai.genai") as mock_genai:
            mock_model = MagicMock()
            mock_genai.GenerativeModel.return_value = mock_model
            
            mock_response = MagicMock()
            mock_response.text = "AI Result"
            mock_model.generate_content.return_value = mock_response
            
            request = AIProcessRequest(
                noteTitle="Title", 
                noteContent="Content", 
                userPrompt="Summarize"
            )
            
            result = await process_ai_request(request)
            
            assert result.result == "AI Result"
            assert result.modelUsed == "gemini-2.0-flash"

@pytest.mark.asyncio
async def test_process_ai_request_no_key():
    # Since api_key is read at module level, we might need to reload or patch safely.
    # The route checks `if not api_key`.
    # However, `api_key` in the logged code is a global variable from `os.environ.get`.
    # If the test runner already imported it, patching os.environ now won't change the global var.
    # We'll rely on the logic inside the function, but wait, the function refers to the global `api_key`.
    # Let's see: `if not api_key: raise HTTPException`.
    # We can try to patch `app.routes.ai.api_key`.
    
    with patch("app.routes.ai.api_key", None):
        request = AIProcessRequest(
            noteTitle="Title", 
            noteContent="Content", 
            userPrompt="Summarize"
        )
        with pytest.raises(HTTPException) as exc:
            await process_ai_request(request)
        assert exc.value.status_code == 503
