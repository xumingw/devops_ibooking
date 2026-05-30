import { describe, expect, it, vi } from 'vitest';

import { requestStudentAssistantMessage, resolveStudentAssistantSuggestionAction } from '../../../src/App';
import { successfulStudentAssistantResponse } from '../helpers/api-responses';

describe('student assistant api', () => {
  it('学生发送助手消息时携带 token 和文本内容', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulStudentAssistantResponse());

    const reply = await requestStudentAssistantMessage(
      'student-token',
      '今天晚上还有空座吗？',
      fetcher,
      'http://localhost:3000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/assistant/me/messages',
      expect.objectContaining({
        body: JSON.stringify({ message: '今天晚上还有空座吗？' }),
        credentials: 'include',
        headers: {
          Authorization: 'Bearer student-token',
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })
    );
    expect(reply.intent).toBe('availability');
    expect(reply.seats[0]).toMatchObject({
      room: '经管自习室 301',
      seat: 'C3',
      tags: ['插座', '靠窗']
    });
  });

  it('助手建议按钮会区分发送消息和页面跳转', () => {
    expect(resolveStudentAssistantSuggestionAction('去选座页筛选')).toBe('select');
    expect(resolveStudentAssistantSuggestionAction('去签到')).toBe('checkin');
    expect(resolveStudentAssistantSuggestionAction('查看我的预约')).toBe('bookings');
    expect(resolveStudentAssistantSuggestionAction('今晚还有空座吗')).toBe('send');
  });
});
