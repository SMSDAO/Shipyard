/**
 * Real Telegram Bot API Adapter
 * Directly calls https://api.telegram.org using real Fetch API
 */

export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

export interface TelegramAdapterResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

const TELEGRAM_API_BASE = 'https://api.telegram.org';

export async function verifyTelegramBot(botToken: string): Promise<TelegramAdapterResponse<TelegramBotInfo>> {
  if (!botToken || !botToken.includes(':')) {
    return {
      ok: false,
      description: 'Invalid Telegram bot token format (must be <bot_id>:<token>)',
    };
  }

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/getMe`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    const data = (await res.json()) as TelegramAdapterResponse<TelegramBotInfo>;
    return data;
  } catch (err: any) {
    return {
      ok: false,
      description: `Telegram connection error: ${err.message || 'Network unreachable'}`,
    };
  }
}

export async function setTelegramWebhook(
  botToken: string,
  webhookUrl: string,
  secretToken?: string
): Promise<TelegramAdapterResponse<boolean>> {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secretToken,
        allowed_updates: ['message', 'callback_query'],
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = (await res.json()) as TelegramAdapterResponse<boolean>;
    return data;
  } catch (err: any) {
    return {
      ok: false,
      description: `Webhook setup error: ${err.message}`,
    };
  }
}

export async function sendTelegramMiniAppButton(
  botToken: string,
  chatId: string | number,
  appName: string,
  appUrl: string,
  customText?: string
): Promise<TelegramAdapterResponse<any>> {
  try {
    const text = customText || `🚀 *${appName}* is ready!\nTap below to launch the onchain miniapp:`;
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `🎮 Open ${appName}`,
                web_app: { url: appUrl },
              },
            ],
          ],
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    return data as TelegramAdapterResponse<any>;
  } catch (err: any) {
    return {
      ok: false,
      description: `Failed to send Telegram message: ${err.message}`,
    };
  }
}
