import os
from .services import WhatsAppService, EmailService, BalanceService, PushService, SmsService, AccountService, ProxyService, DispatchService
from .utils import verify_signature

class PingBusClient:
    def __init__(self, api_key: str = None, base_url: str = None, timeout: float = 30.0):
        self.config = {
            "api_key": api_key or os.getenv("PINGBUS_API_KEY"),
            "base_url": base_url or os.getenv("PINGBUS_BASE_URL", "https://www.pingbus.live"),
            "timeout": timeout or float(os.getenv("PINGBUS_TIMEOUT", 30.0))
        }
        
        if not self.config["api_key"]:
            raise ValueError("API Key is required")

        self.whatsapp = WhatsAppService(self.config)
        self.email = EmailService(self.config)
        self.push = PushService(self.config)
        self.sms = SmsService(self.config)
        self.account = AccountService(self.config)
        self.balance = BalanceService(self.config)
        self.proxies = ProxyService(self.config)
        self.dispatch = DispatchService(self.config)

    @staticmethod
    def verify_signature(body: str, signature: str, api_key: str) -> bool:
        return verify_signature(body, signature, api_key)
