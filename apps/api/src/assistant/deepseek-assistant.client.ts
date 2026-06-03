import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorCode, StudentAssistantIntent } from '@ibooking/shared-types';
import {
  AssistantModelClient,
  AssistantModelDecision,
  AssistantModelInput,
  AssistantSeatFilters
} from './assistant.service';

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type RawAssistantDecision = Partial<
  Omit<AssistantModelDecision, 'filters'> & {
    filters?: Partial<AssistantSeatFilters>;
  }
>;

const ASSISTANT_INTENTS: StudentAssistantIntent[] = [
  'availability',
  'seat_search',
  'my_bookings',
  'fallback'
];

const SYSTEM_PROMPT = `你是复旦大学自习室预约系统的智能助手意图解析器。
请只输出 JSON，不要输出 Markdown、解释或额外文字。
JSON schema:
{
  "intent": "availability" | "seat_search" | "my_bookings" | "fallback",
  "dateLabel": "今天" | "明天",
  "timeLabel": "今天晚上" | "今天下午" | "今天全天" | "明天上午" | "明天下午" | "明天晚上" | string,
  "startHour": 0-24 整数,
  "endHour": 1-24 整数,
  "filters": { "hasPower": boolean, "nearWindow": boolean, "quietZone": boolean },
  "fallbackText": string
}
规则:
- 用户问空座/空位/有没有座，intent=availability。
- 用户提到靠窗、插座、电源、安静等偏好，intent=seat_search，并设置 filters。
- 用户问“我今天定了哪里”“我的预约”，intent=my_bookings。
- 无关问题 intent=fallback，fallbackText 给出简短引导。
- 没有明确日期时 dateLabel=今天；没有明确时间时使用 8-22 全天。`;

@Injectable()
export class DeepSeekAssistantClient implements AssistantModelClient {
  constructor(private readonly configService: ConfigService) {}

  async interpret(input: AssistantModelInput): Promise<AssistantModelDecision> {
    const apiKey =
      this.configService.get<string>('DEEPSEEK_API_KEY')?.trim() ||
      this.configService.get<string>('LLM_API_KEY')?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException({
        code: ErrorCode.INTERNAL_ERROR,
        message: '智能助手模型未配置'
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.resolveTimeoutMs());
    let response: Response;
    try {
      response = await fetch(this.resolveEndpoint(), {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model:
            this.configService.get<string>('DEEPSEEK_MODEL')?.trim() ||
            this.configService.get<string>('LLM_MODEL')?.trim() ||
            'deepseek-v4-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `当前时间：${input.now.toISOString()}\n用户问题：${input.message}`
            }
          ],
          response_format: {
            type: 'json_object'
          },
          thinking: {
            type: 'disabled'
          },
          temperature: 0.1,
          max_tokens: 500,
          stream: false
        })
      });
    } catch {
      throw this.modelCallFailed();
    } finally {
      clearTimeout(timeout);
    }

    const payload = (await response.json().catch(() => null)) as DeepSeekChatResponse | null;
    const content = payload?.choices?.[0]?.message?.content;
    if (!response.ok || !content) {
      throw new BadGatewayException({
        code: ErrorCode.INTERNAL_ERROR,
        message: '智能助手模型调用失败'
      });
    }

    return this.normalizeDecision(this.parseJsonContent(content));
  }

  private resolveEndpoint(): string {
    const baseUrl =
      this.configService.get<string>('DEEPSEEK_BASE_URL')?.trim() ||
      this.configService.get<string>('LLM_BASE_URL')?.trim() ||
      'https://api.deepseek.com';
    return `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
  }

  private resolveTimeoutMs(): number {
    const value = Number(
      this.configService.get<string>('DEEPSEEK_TIMEOUT_MS')?.trim() ||
        this.configService.get<string>('LLM_TIMEOUT_MS')?.trim()
    );
    return Number.isFinite(value) && value > 0 ? value : 15000;
  }

  private parseJsonContent(content: string): RawAssistantDecision {
    const trimmed = content.trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonText = fenced?.[1]?.trim() || trimmed;
    try {
      return JSON.parse(jsonText) as RawAssistantDecision;
    } catch {
      throw new BadGatewayException({
        code: ErrorCode.INTERNAL_ERROR,
        message: '智能助手模型返回格式异常'
      });
    }
  }

  private modelCallFailed(): BadGatewayException {
    return new BadGatewayException({
      code: ErrorCode.INTERNAL_ERROR,
      message: '智能助手模型调用失败'
    });
  }

  private normalizeDecision(raw: RawAssistantDecision): AssistantModelDecision {
    const intent = ASSISTANT_INTENTS.includes(raw.intent as StudentAssistantIntent)
      ? (raw.intent as StudentAssistantIntent)
      : 'fallback';
    const dateLabel = raw.dateLabel === '明天' ? '明天' : '今天';
    const startHour = this.normalizeHour(raw.startHour, 8);
    const endHour = this.normalizeHour(raw.endHour, 22);
    const timeLabel =
      typeof raw.timeLabel === 'string' && raw.timeLabel.trim()
        ? raw.timeLabel.trim()
        : `${dateLabel}全天`;

    return {
      intent,
      dateLabel,
      timeLabel,
      startHour,
      endHour: endHour > startHour ? endHour : 22,
      filters: {
        hasPower: raw.filters?.hasPower === true,
        nearWindow: raw.filters?.nearWindow === true,
        quietZone: raw.filters?.quietZone === true
      },
      fallbackText: typeof raw.fallbackText === 'string' ? raw.fallbackText.trim() : ''
    };
  }

  private normalizeHour(value: unknown, fallback: number): number {
    return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 24
      ? Number(value)
      : fallback;
  }
}
