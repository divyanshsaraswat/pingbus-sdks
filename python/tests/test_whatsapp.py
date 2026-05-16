import pytest
import respx
import httpx
from pingbus import PingBusClient

@pytest.fixture
def client():
    return PingBusClient(api_key="pk_test_123", base_url="https://api.test.pingbus.com")

@pytest.mark.asyncio
@respx.mock
async def test_send_message(client):
    instance_id = "4256253175"
    chat_id = "123456@c.us"
    message = "Hello test"

    # Mock the exact URL without the api key in the path
    mock_route = respx.post(f"https://api.test.pingbus.com/api/waInstance{instance_id}/sendMessage").mock(
        return_value=httpx.Response(200, json={"idMessage": "msg_abc123"})
    )

    result = await client.whatsapp.send_message(instance_id, chat_id, message)
    
    assert mock_route.called
    request = mock_route.calls.last.request
    
    # Assert headers contain the Bearer token
    assert request.headers["Authorization"] == "Bearer pk_test_123"
    assert request.headers["Content-Type"] == "application/json"
    
    # Assert body contains the expected payload
    payload = _parse_json(request)
    assert payload["chatId"] == chat_id
    assert payload["message"] == message

    # Assert response
    assert result["idMessage"] == "msg_abc123"

@pytest.mark.asyncio
@respx.mock
async def test_receive_notification(client):
    instance_id = "4256253175"
    
    # Mock URL
    mock_route = respx.get(f"https://api.test.pingbus.com/api/waInstance{instance_id}/receiveNotification").mock(
        return_value=httpx.Response(200, json={"receiptId": 12345, "body": {"message": "hi"}})
    )

    result = await client.whatsapp.receive(instance_id)
    
    assert mock_route.called
    request = mock_route.calls.last.request
    
    assert request.headers["Authorization"] == "Bearer pk_test_123"
    assert result["receiptId"] == 12345

def _parse_json(request):
    import json
    return json.loads(request.content.decode("utf-8"))
