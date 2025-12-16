import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi import UploadFile
from app.routes.ocr import extract_text_from_image

@pytest.mark.asyncio
async def test_extract_text_success():
    # Mock environment variable
    with patch("os.environ.get") as mock_env:
        mock_env.return_value = "fake-key"
        
        # Mock Mistral Client
        with patch("app.routes.ocr.Mistral") as MockMistral:
            mock_client = MagicMock()
            MockMistral.return_value = mock_client
            
            # Mock OCR response
            mock_page = MagicMock()
            mock_page.markdown = "Extracted Text"
            mock_response = MagicMock()
            mock_response.pages = [mock_page]
            mock_client.ocr.process.return_value = mock_response
            
            # Mock UploadFile
            mock_file = AsyncMock(spec=UploadFile)
            mock_file.read.return_value = b"image_data"
            
            result = await extract_text_from_image(mock_file)
            
            assert result == {"markdown": "Extracted Text"}
            mock_client.ocr.process.assert_called_once()

@pytest.mark.asyncio
async def test_extract_text_no_api_key():
    with patch("os.environ.get") as mock_env:
        mock_env.return_value = None
        
        with pytest.raises(Exception) as exc:
            # We don't need a real file if it fails early
            await extract_text_from_image(AsyncMock())
        
        assert exc.value.status_code == 500
        assert "MISTRAL_API_KEY" in exc.value.detail
