import { mockViolationRecords } from './mock-data';
import { requestApi } from './http';
import { ApiState, DemoViolationRecord, DemoViolationSummary } from './types';

const APPEALED_VIOLATION_IDS_KEY = 'ibooking.appealedViolationIds';
const RESTRICTION_THRESHOLD = 3;
const SEVERE_THRESHOLD = 5;

function loadAppealedIds(): string[] {
  const stored = wx.getStorageSync<string[]>(APPEALED_VIOLATION_IDS_KEY);
  return Array.isArray(stored) ? stored : [];
}

function applyLocalAppeals(summary: DemoViolationSummary): DemoViolationSummary {
  const appealedIds = new Set(loadAppealedIds());
  return {
    ...summary,
    records: summary.records.map((record) => ({
      ...record,
      status: appealedIds.has(record.id) ? 'appealed' : record.status
    }))
  };
}

function buildSummary(records: DemoViolationRecord[]): DemoViolationSummary {
  return {
    totalCount: records.reduce((sum, record) => sum + record.count, 0),
    restrictionThreshold: RESTRICTION_THRESHOLD,
    severeThreshold: SEVERE_THRESHOLD,
    records
  };
}

export async function loadViolationSummary(): Promise<{
  summary: DemoViolationSummary;
  state: ApiState;
}> {
  try {
    const summary = await requestApi<DemoViolationSummary>('/api/v1/violations/me');
    return {
      summary: applyLocalAppeals(summary),
      state: {
        source: 'backend',
        message: '已连接后端 API'
      }
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : '后端暂不可用';
    return {
      summary: applyLocalAppeals(buildSummary(mockViolationRecords)),
      state: {
        source: 'mock',
        message: `${reason}，已切换演示数据`
      }
    };
  }
}

export function appealViolationRecord(id: string): void {
  const nextAppealedIds = Array.from(new Set([...loadAppealedIds(), id]));
  wx.setStorageSync(APPEALED_VIOLATION_IDS_KEY, nextAppealedIds);
}
