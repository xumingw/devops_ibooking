import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlmAssistantClient } from '../../../src/assistant/glm-assistant.client';

describe('GlmAssistantClient', () => {
  const fetchMock = jest.fn();
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
    fetchMock.mockReset();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('使用 glm-4.7-flash 调用 BigModel 聊天补全并解析 JSON 意图', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  intent: 'seat_search',
                  dateLabel: '今天',
                  timeLabel: '今天晚上',
                  startHour: 18,
                  endHour: 22,
                  filters: { hasPower: true, nearWindow: true, quietZone: false },
                  fallbackText: ''
                })
              }
            }
          ]
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    );
    const client = new GlmAssistantClient(configServiceFixture({ BIGMODEL_API_KEY: 'test-key' }));

    const decision = await client.interpret({
      message: '今晚找靠窗有插座的座位',
      now: new Date('2026-05-30T10:00:00.000Z')
    });

    expect(decision).toMatchObject({
      intent: 'seat_search',
      dateLabel: '今天',
      timeLabel: '今天晚上',
      startHour: 18,
      endHour: 22,
      filters: { hasPower: true, nearWindow: true, quietZone: false }
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
          'Content-Type': 'application/json'
        }),
        method: 'POST'
      })
    );
    const [, request] = fetchMock.mock.calls[0];
    expect(JSON.parse(request.body as string)).toMatchObject({
      model: 'glm-4.7-flash',
      stream: false,
      thinking: {
        type: 'disabled'
      },
      messages: expect.arrayContaining([
        expect.objectContaining({ role: 'system' }),
        expect.objectContaining({
          role: 'user',
          content: expect.stringContaining('用户问题：今晚找靠窗有插座的座位')
        })
      ])
    });
  });

  it('缺少 BIGMODEL_API_KEY 时拒绝调用远端模型', async () => {
    const client = new GlmAssistantClient(configServiceFixture({}));

    await expect(
      client.interpret({
        message: '今天晚上还有空座吗',
        now: new Date('2026-05-30T10:00:00.000Z')
      })
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('远端网络错误时返回稳定的模型调用失败异常', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    const client = new GlmAssistantClient(configServiceFixture({ BIGMODEL_API_KEY: 'test-key' }));

    await expect(
      client.interpret({
        message: '今天晚上还有空座吗',
        now: new Date('2026-05-30T10:00:00.000Z')
      })
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});

function configServiceFixture(values: Record<string, string>): ConfigService {
  return {
    get: jest.fn((key: string) => values[key])
  } as unknown as ConfigService;
}
