import httpx
from .utils import with_retry
from .models import Notification, EmailLog, Transaction, PushTarget

class BaseService:
    def __init__(self, config):
        self.config = config

    async def _request(self, method: str, path: str, json=None, params=None, use_path_token=False):
        url = f"{self.config['base_url']}{path}"
        headers = {"Content-Type": "application/json"}
        if not use_path_token:
            headers["Authorization"] = f"Bearer {self.config['api_key']}"

        async with httpx.AsyncClient(timeout=self.config['timeout']) as client:
            async def do_req():
                resp = await client.request(method, url, json=json, params=params, headers=headers)
                if resp.status_code >= 400:
                    raise Exception(f"HTTP {resp.status_code}: {resp.text}")
                return resp.json()
            return await with_retry(do_req)

class WhatsAppService(BaseService):
    async def send_message(self, instance_id: str, chat_id: str, message: str):
        return await self._request("POST", f"/waInstance{instance_id}/sendMessage/{self.config['api_key']}", json={"chatId": chat_id, "message": message}, use_path_token=True)
    
    async def send_file_by_url(self, instance_id, chat_id, url, name=None, caption=None):
        return await self._request("POST", f"/waInstance{instance_id}/sendFileByUrl/{self.config['api_key']}", json={"chatId": chat_id, "urlFile": url, "fileName": name, "caption": caption}, use_path_token=True)

    async def receive(self, instance_id):
        return await self._request("GET", f"/waInstance{instance_id}/receiveNotification/{self.config['api_key']}", use_path_token=True)

class EmailService(BaseService):
    async def send(self, to, subject, body, options=None):
        payload = {"to": to, "subject": subject, "body": body}
        if options: payload.update(options)
        return await self._request("POST", "/api/channels/email/send", json=payload)
    
    async def list_logs(self, limit=50, offset=0):
        return await self._request("GET", "/api/channels/email/logs", params={"limit": limit, "offset": offset})

class PushService(BaseService):
    async def send(self, target: PushTarget, notification: dict, data: dict = None):
        return await self._request("POST", "/api/channels/push/send", json={"target": target.dict(), "notification": notification, "data": data})

class AccountService(BaseService):
    async def get_profile(self): return await self._request("GET", "/api/account")
    async def list_keys(self): return await self._request("GET", "/api/account/keys")

class ProxyService(BaseService):
    async def provision(self): return await self._request("POST", "/api/proxies")
    async def attach(self, proxy_id, instance_id): return await self._request("POST", f"/api/proxies/{proxy_id}/attach", json={"instanceId": instance_id})
