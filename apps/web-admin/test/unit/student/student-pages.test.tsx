import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { StudentHomePreview } from '../../../src/App';

describe('student pages', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('渲染学生首页概览页面', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));

    const html = renderToStaticMarkup(<StudentHomePreview studentName="林晓明" />);

    expect(html).toContain('复旦大学');
    expect(html).toContain('自习预约系统');
    expect(html).toContain('首页概览');
    expect(html).toContain('林晓明');
    expect(html).toContain('21307001');
    expect(html).toContain('2026年6月2日 · 学习空间实时状态');
    expect(html).toContain('下一场预约');
    expect(html).toContain('经管自习室 301');
    expect(html).toContain('今日 14:00 – 17:00');
    expect(html).toContain('距开始还有');
    expect(html).toContain('2小时18分');
    expect(html).toContain('立即签到');
    expect(html).toContain('今日全校空座');
    expect(html).toContain('今日我的预约');
    expect(html).toContain('推荐自习室');
    expect(html).toContain('立即找座');
    expect(html).toContain('本周学习记录');
    expect(html).not.toContain('学生首页');
    expect(html).not.toContain('查看自习室');
  });

  it('首页预约已结束后不再显示错误开始倒计时', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T11:07:00.000Z'));

    const html = renderToStaticMarkup(<StudentHomePreview studentName="林晓明" />);

    expect(html).toContain('最近预约');
    expect(html).toContain('今日 14:00 – 17:00');
    expect(html).toContain('已于 17:00 结束');
    expect(html).not.toContain('距开始还有');
  });

  it('渲染学生自习室列表页面', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));

    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="rooms" />
    );

    expect(html).toContain('自习室列表');
    expect(html).toContain('共 6 个自习室');
    expect(html).toContain('搜索条件');
    expect(html).toContain('刷新列表');
    expect(html).toContain('日期');
    expect(html).toContain('开始时间');
    expect(html).toContain('结束时间');
    expect(html).toContain('楼栋');
    expect(html).toContain('楼层');
    expect(html).toContain('教室');
    expect(html).toContain('搜索可预约自习室');
    expect(html).toContain('全部楼栋');
    expect(html).toContain('全校开放');
    expect(html).toContain('有空位');
    expect(html).toContain('有插座');
    expect(html).toContain('靠窗');
    expect(html).toContain('今天 14:00 – 17:00（3小时）');
    expect(html).toContain('经管自习室 301');
    expect(html).toContain('08:00–22:00');
    expect(html).toContain('开放中');
    expect(html).toContain('新闻学院研讨室');
    expect(html).toContain('仅新闻学院');
    expect(html).toContain('加入候补');
    expect(html).toContain('预约');
    expect(html).not.toContain('当前自习室');
    expect(html).not.toContain('预约信息');
    expect(html).not.toContain('确认预约');
    expect(html).not.toContain('下一场预约');
  });

  it('旧选座预约入口渲染到自习室列表', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));

    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="select" />
    );

    expect(html).toContain('自习室列表');
    expect(html).not.toContain('选座预约');
    expect(html).toContain('经管自习室 301');
    expect(html).toContain('光华楼 A座 · 3楼');
    expect(html).toContain('搜索可预约自习室');
    expect(html).toContain('今天');
    expect(html).toContain('14:00');
    expect(html).toContain('17:00');
    expect(html).not.toContain('预约信息');
    expect(html).not.toContain('入 口');
    expect(html).not.toContain('确认预约');
    expect(html).not.toContain('下一场预约');
  });

  it('旧确认预约入口渲染到自习室列表', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T03:42:00.000Z'));

    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="confirm" />
    );

    expect(html).toContain('自习室列表');
    expect(html).toContain('经管自习室 301');
    expect(html).toContain('搜索可预约自习室');
    expect(html).not.toContain('当前自习室');
    expect(html).not.toContain('确认预约');
    expect(html).not.toContain('请仔细核对信息后提交');
    expect(html).not.toContain('确认提交预约');
    expect(html).not.toContain('下一场预约');
  });
});
