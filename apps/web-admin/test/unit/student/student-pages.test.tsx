import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { StudentHomePreview } from '../../../src/App';

describe('student pages', () => {
  it('渲染学生首页概览页面', () => {
    const html = renderToStaticMarkup(<StudentHomePreview studentName="林晓明" />);

    expect(html).toContain('复旦大学');
    expect(html).toContain('自习预约系统');
    expect(html).toContain('首页概览');
    expect(html).toContain('林晓明');
    expect(html).toContain('21307001');
    expect(html).toContain('下一场预约');
    expect(html).toContain('经管自习室 301');
    expect(html).toContain('今日 14:00 – 17:00');
    expect(html).toContain('立即签到');
    expect(html).toContain('今日全校空座');
    expect(html).toContain('今日我的预约');
    expect(html).toContain('推荐自习室');
    expect(html).toContain('立即找座');
    expect(html).toContain('本周学习记录');
    expect(html).not.toContain('学生首页');
    expect(html).not.toContain('查看自习室');
  });

  it('渲染学生自习室列表页面', () => {
    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="rooms" />
    );

    expect(html).toContain('自习室列表');
    expect(html).toContain('共 6 个自习室');
    expect(html).toContain('筛选');
    expect(html).toContain('列表视图');
    expect(html).toContain('全部楼栋');
    expect(html).toContain('全校开放');
    expect(html).toContain('有空位');
    expect(html).toContain('有插座');
    expect(html).toContain('靠窗');
    expect(html).toContain('今日 08:00 – 22:00 · 明日可预约');
    expect(html).toContain('经管自习室 301');
    expect(html).toContain('08:00–22:00');
    expect(html).toContain('开放中');
    expect(html).toContain('新闻学院研讨室');
    expect(html).toContain('仅新闻学院');
    expect(html).toContain('加入候补');
    expect(html).toContain('立即预约');
    expect(html).not.toContain('下一场预约');
  });

  it('渲染学生选座预约页面', () => {
    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="select" />
    );

    expect(html).toContain('选座预约');
    expect(html).toContain('光华楼 A座 · 3楼 · 经管自习室 301');
    expect(html).toContain('筛选条件');
    expect(html).toContain('今天');
    expect(html).toContain('14:00');
    expect(html).toContain('17:00');
    expect(html).toContain('座位属性');
    expect(html).toContain('插座');
    expect(html).toContain('靠窗');
    expect(html).toContain('应用筛选');
    expect(html).toContain('重置条件');
    expect(html).toContain('入 口');
    expect(html).toContain('靠窗排');
    expect(html).toContain('空闲');
    expect(html).toContain('已占');
    expect(html).toContain('已选');
    expect(html).toContain('C3');
    expect(html).toContain('预约信息');
    expect(html).toContain('2026年4月24日（周四）');
    expect(html).toContain('14:00 – 17:00（3小时）');
    expect(html).toContain('请在开始时间后');
    expect(html).toContain('15 分钟内');
    expect(html).toContain('确认预约');
    expect(html).toContain('收藏该座位');
    expect(html).toContain('可用时段');
    expect(html).not.toContain('下一场预约');
  });

  it('渲染学生确认预约页面', () => {
    const html = renderToStaticMarkup(
      <StudentHomePreview studentName="林晓明" initialActive="confirm" />
    );

    expect(html).toContain('确认预约');
    expect(html).toContain('请仔细核对信息后提交');
    expect(html).toContain('选择时间');
    expect(html).toContain('选择座位');
    expect(html).toContain('确认信息');
    expect(html).toContain('完成');
    expect(html).toContain('预约详情');
    expect(html).toContain('自习室');
    expect(html).toContain('经管自习室 301');
    expect(html).toContain('座位编号');
    expect(html).toContain('C3（插座 · 安静区）');
    expect(html).toContain('预约日期');
    expect(html).toContain('2026年4月24日（周四）');
    expect(html).toContain('17:00（共3小时）');
    expect(html).toContain('使用规则与违约须知');
    expect(html).toContain('签到规则');
    expect(html).toContain('开始时间后 15 分钟内扫码/输码签到');
    expect(html).toContain('取消规则');
    expect(html).toContain('本学期累计 3 次违约');
    expect(html).toContain('提醒方式');
    expect(html).toContain('微信服务通知');
    expect(html).toContain('邮件提醒');
    expect(html).toContain('返回修改');
    expect(html).toContain('确认提交预约');
    expect(html).not.toContain('下一场预约');
  });
});
