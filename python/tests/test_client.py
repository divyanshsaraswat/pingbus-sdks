import pytest
import os
from pingbus import PingBusClient

def test_client_initialization_defaults(monkeypatch):
    monkeypatch.delenv("PINGBUS_API_KEY", raising=False)
    monkeypatch.delenv("PINGBUS_BASE_URL", raising=False)
    
    with pytest.raises(ValueError, match="API Key is required"):
        PingBusClient()
        
    client = PingBusClient(api_key="pk_test_direct")
    assert client.config["api_key"] == "pk_test_direct"
    assert client.config["base_url"] == "https://www.pingbus.live"

def test_client_initialization_env(monkeypatch):
    monkeypatch.setenv("PINGBUS_API_KEY", "pk_env_123")
    monkeypatch.setenv("PINGBUS_BASE_URL", "https://api.custom.com")
    
    client = PingBusClient()
    assert client.config["api_key"] == "pk_env_123"
    assert client.config["base_url"] == "https://api.custom.com"
