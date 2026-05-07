import os
from .services import WhatsAppService, EmailService, BalanceService
from .utils import verify_signature

class PingBusClient:
    def __init__(self, api_key: str = None, base_url: str = None, timeout: float = 30.0):
        self.config = {
            "api_key": api_key or os.getenv("PINGBUS_API_KEY"),
            "base_url": base_url or os.getenv("PINGBUS_BASE_URL", "https://api.pingbus.com"),
            "timeout": timeout or float(os.getenv("PINGBUS_TIMEOUT", 30.0))
        }
        
        if not self.config["api_key"]:
            raise ValueError("API Key is required")

        self.whatsapp = WhatsAppService(self.config)
        self.email = EmailService(self.config)
        self.balance = BalanceService(self.config)

    @staticmethod
    def verify_signature(body: str, signature: str, api_key: str) -> bool:
        return verify_signature(body, signature, api_key)
