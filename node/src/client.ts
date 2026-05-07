import { PingBusConfig } from './types';
import { WhatsAppService } from './services/whatsapp';
import { 
  EmailService, PushService, SmsService, 
  AccountService, BalanceService, ProxyService 
} from './services';
import { verifySignature } from './utils/crypto';

export class PingBusClient {
  public whatsapp: WhatsAppService;
  public email: EmailService;
  public push: PushService;
  public sms: SmsService;
  public account: AccountService;
  public balance: BalanceService;
  public proxies: ProxyService;

  constructor(config: PingBusConfig) {
    const finalConfig: PingBusConfig = {
      apiKey: config.apiKey || process.env.PINGBUS_API_KEY || '',
      baseUrl: config.baseUrl || process.env.PINGBUS_BASE_URL || 'https://api.pingbus.com',
      timeout: config.timeout || (process.env.PINGBUS_TIMEOUT ? parseInt(process.env.PINGBUS_TIMEOUT) : 30000),
    };

    if (!finalConfig.apiKey) {
      throw new Error('PingBus API Key is required. Set it in config or PINGBUS_API_KEY env var.');
    }

    this.whatsapp = new WhatsAppService(finalConfig);
    this.email = new EmailService(finalConfig);
    this.push = new PushService(finalConfig);
    this.sms = new SmsService(finalConfig);
    this.account = new AccountService(finalConfig);
    this.balance = new BalanceService(finalConfig);
    this.proxies = new ProxyService(finalConfig);
  }

  static verifySignature = verifySignature;
}
