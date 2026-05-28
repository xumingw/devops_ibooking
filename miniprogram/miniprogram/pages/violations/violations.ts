import { appealViolationRecord, loadViolationSummary } from '../../services/violations';
import { restoreSession } from '../../services/session';
import { DemoViolationRecord, DemoViolationSummary } from '../../services/types';

type ViolationRecordView = DemoViolationRecord & {
  countLabel: string;
  statusLabel: string;
};

const EMPTY_SUMMARY: DemoViolationSummary = {
  totalCount: 0,
  restrictionThreshold: 3,
  severeThreshold: 5,
  records: []
};

function formatCount(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatTotalCount(value: number): string {
  return value.toFixed(1);
}

function toRecordView(record: DemoViolationRecord): ViolationRecordView {
  return {
    ...record,
    countLabel: formatCount(record.count),
    statusLabel: record.status === 'appealed' ? '申诉中' : '已确认'
  };
}

function getProgressPercent(summary: DemoViolationSummary): number {
  if (summary.severeThreshold <= 0) return 0;
  return Math.min(100, Math.round((summary.totalCount / summary.severeThreshold) * 100));
}

Page({
  data: {
    summary: EMPTY_SUMMARY,
    records: [] as ViolationRecordView[],
    semesterCountLabel: '0',
    totalCountLabel: '0',
    progressPercent: 0,
    loading: false
  },
  onShow() {
    if (!restoreSession()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    void this.loadViolations();
  },
  async loadViolations() {
    this.setData({ loading: true });
    const result = await loadViolationSummary();
    this.setData({
      summary: result.summary,
      records: result.summary.records.map(toRecordView),
      semesterCountLabel: formatCount(result.summary.totalCount),
      totalCountLabel: formatTotalCount(result.summary.totalCount),
      progressPercent: getProgressPercent(result.summary),
      loading: false
    });
  },
  applyAppeal(event: { currentTarget: { dataset: { id?: string } } }) {
    const id = event.currentTarget.dataset.id;
    if (!id) return;
    appealViolationRecord(id);
    void this.loadViolations();
    wx.showToast({ title: '已提交申诉', icon: 'none' });
  }
});
