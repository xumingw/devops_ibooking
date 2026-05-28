import { describe, expect, it, vi } from 'vitest';

import {
  formatStudentViolationSubtitle,
  mapStudentViolationSummaryToView,
  requestStudentViolationSummary
} from '../../../src/App';
import { successfulStudentViolationsResponse } from '../helpers/api-responses';

describe('student violations api', () => {
  it('学生违约记录请求会携带学生 token', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(successfulStudentViolationsResponse());

    const summary = await requestStudentViolationSummary(
      'student-token',
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/violations/me',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer student-token' },
        method: 'GET'
      })
    );
    expect(summary.totalCount).toBe(1.5);
    expect(summary.records[0]).toMatchObject({
      id: 'violation-no-checkin',
      reason: '未签到（签到超时自动取消）'
    });
  });

  it('学生违约记录会映射为次数、阈值和申诉状态展示', () => {
    const view = mapStudentViolationSummaryToView({
      totalCount: 1.5,
      restrictionThreshold: 3,
      severeThreshold: 5,
      records: [
        {
          id: 'violation-no-checkin',
          room: '经管自习室 301 · D8',
          seat: 'D8',
          date: '5月28日',
          reason: '未签到（签到超时自动取消）',
          count: 1,
          status: 'confirmed',
          occurredAt: '2026-05-28T04:00:00.000Z'
        },
        {
          id: 'violation-appealed',
          room: '文史馆阅览室 · B14',
          seat: 'B14',
          date: '5月20日',
          reason: '提前离座超 30 分钟',
          count: 0.5,
          status: 'appealed',
          occurredAt: '2026-05-20T09:00:00.000Z'
        }
      ]
    });

    expect(view).toMatchObject({
      semesterCountLabel: '1.5',
      totalCountLabel: '1.5',
      progressPercent: 30,
      restrictionLabel: '/ 3.0 限制',
      severeProgressLabel: '1.5 / 5.0（30天限制）'
    });
    expect(view.records[0]).toMatchObject({
      countLabel: '1',
      statusLabel: '已确认'
    });
    expect(view.records[1]).toMatchObject({
      countLabel: '0.5',
      statusLabel: '申诉中'
    });
  });

  it('学生违约页副标题使用当前汇总次数', () => {
    const view = mapStudentViolationSummaryToView({
      totalCount: 1.5,
      restrictionThreshold: 3,
      severeThreshold: 5,
      records: []
    });

    expect(formatStudentViolationSubtitle(view)).toBe('本学期违约 1.5 次（累计 1.5 次）');
  });
});
