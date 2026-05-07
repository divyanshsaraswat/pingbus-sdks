from typing import List, Optional, Dict, Union, Literal
from pydantic import BaseModel, Field

class Notification(BaseModel):
    id: str
    chat_id: str = Field(alias="chatId")
    message: str
    sender_name: str = Field(alias="senderName")
    timestamp: int
    type_webhook: str = Field(alias="typeWebhook")

class EmailLog(BaseModel):
    id: str
    to: str
    subject: str
    status: Literal['queued', 'sent', 'failed']
    sent_at: str = Field(alias="sentAt")
    error: Optional[str] = None

class Transaction(BaseModel):
    id: str
    date: str
    description: str
    amount: float
    status: Literal['completed', 'pending', 'failed']
    type: Literal['credit', 'debit']

class SMTPConfig(BaseModel):
    name: str
    host: str
    port: int
    secure: bool
    user: str
    pass_: str = Field(alias="pass")
    from_email: str = Field(alias="fromEmail")
    from_name: str = Field(alias="fromName")

class PushTarget(BaseModel):
    type: Literal['user', 'topic', 'token']
    user_id: Optional[str] = Field(None, alias="userId")
    token: Optional[str] = None
    topic: Optional[str] = None
