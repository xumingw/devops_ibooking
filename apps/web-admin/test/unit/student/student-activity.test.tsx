import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { StudentHomePreview } from '../../../src/App';

describe('student activity pages', () => {
  it('渲染学生我的预约页面', () => {
    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="bookings" />
    );

    expect(html).toContain('我的预约');
    expect(html).toContain('本学期共 5 次预约 · 2 次完成');
    expect(html).toContain('筛选状态');
    expect(html).toContain('导出记录');
    expect(html).toContain('全部');
    expect(html).toContain('待签到');
    expect(html).toContain('使用中');
    expect(html).toContain('已完成');
    expect(html).toContain('已取消');
    expect(html).toContain('违约');
    expect(html).toContain('今日 14:00–17:00');
    expect(html).toContain('C3');
    expect(html).toContain('经管自习室 301');
    expect(html).toContain('光华楼 A座');
    expect(html).toContain('立即签到');
    expect(html).toContain('取消');
    expect(html).toContain('F12');
    expect(html).toContain('再次预约');
    expect(html).toContain('D8');
    expect(html).toContain('查看原因');
    expect(html).toContain('B3');
    expect(html).not.toContain('下一场预约');
  });

  it('渲染学生签到页面', () => {
    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="checkin" />
    );

    expect(html).toContain('签到');
    expect(html).toContain('输入动态码或扫码完成签到');
    expect(html).toContain('9:22');
    expect(html).toContain('剩余签到时间');
    expect(html).toContain('经管自习室 301 · C3 座 · 今日 14:00–17:00');
    expect(html).toContain('请查看教室屏幕上的 6 位动态码');
    expect(html).toContain('274');
    expect(html).toContain('确 认 签 到');
    expect(html).toContain('无法输入？');
    expect(html).toContain('扫描教室二维码');
    expect(html).toContain('联系管理员');
    expect(html).not.toContain('下一场预约');
  });

  it('渲染学生智能助手页面', () => {
    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="assistant" />
    );

    expect(html).toContain('智能助手');
    expect(html).toContain('自然语言找座 · 预约管理 · 政策咨询');
    expect(html).toContain('今天下午有空位吗？我想要有插座的座位');
    expect(html).toContain('根据您的偏好，今天下午（14:00 后）共找到 3 个合适选项');
    expect(html).toContain('经管自习室 301 · C3');
    expect(html).toContain('图书馆自习区 · B22');
    expect(html).toContain('立即预约');
    expect(html).toContain('帮我预约第一个，时间 14:00 到 17:00');
    expect(html).toContain('确认预约');
    expect(html).toContain('今天晚上还有空座吗');
    expect(html).toContain('找靠窗座位');
    expect(html).toContain('我今天定了哪里');
    expect(html).toContain('最近对话');
    expect(html).toContain('能力示例');
    expect(html).toContain('输入问题，例如“明天上午有没有靠窗且安静的座位”');
    expect(html).not.toContain('下一场预约');
  });

  it('渲染学生通知中心页面', () => {
    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="notify" />
    );

    expect(html).toContain('通知中心');
    expect(html).toContain('3 条未读');
    expect(html).toContain('全部已读');
    expect(html).toContain('今天');
    expect(html).toContain('签到成功');
    expect(html).toContain('经管自习室 301 · C3 · 14:02 签到成功，使用至 17:00');
    expect(html).toContain('预约提醒');
    expect(html).toContain('您今日 14:00 在经管自习室 301 的预约将在 15 分钟后开始');
    expect(html).toContain('预约成功');
    expect(html).toContain('座位 C3 已成功预约，2026年4月24日 14:00–17:00');
    expect(html).toContain('昨天');
    expect(html).toContain('未签到提醒');
    expect(html).toContain('您在理工自习室 201 的预约（F8）开始后 10 分钟仍未签到');
    expect(html).toContain('使用结束');
    expect(html).toContain('系统公告');
    expect(html).toContain('五一假期安排');
    expect(html).toContain('标记全部已读');
    expect(html).not.toContain('下一场预约');
  });

  it('渲染学生违约记录页面', () => {
    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="violation" />
    );

    expect(html).toContain('违约记录');
    expect(html).toContain('本学期违约 2.0 次（累计 2.0 次）');
    expect(html).toContain('本学期已违约 2.0 次');
    expect(html).toContain('累计达 3 次将被限制预约 7 天');
    expect(html).toContain('/ 3.0 限制');
    expect(html).toContain('违约进度');
    expect(html).toContain('2.0 / 5.0（30天限制）');
    expect(html).toContain('3次 限7天');
    expect(html).toContain('5次 限30天');
    expect(html).toContain('经管自习室 301 · D8');
    expect(html).toContain('未签到（签到超时自动取消）');
    expect(html).toContain('文史馆阅览室 · B14');
    expect(html).toContain('提前离座超 30 分钟');
    expect(html).toContain('理工自习室 201 · A3');
    expect(html).toContain('1小时内取消预约');
    expect(html).toContain('已确认');
    expect(html).toContain('申诉中');
    expect(html).toContain('申请申诉');
    expect(html).not.toContain('下一场预约');
  });
});
