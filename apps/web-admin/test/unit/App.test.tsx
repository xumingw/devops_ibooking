import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminDashboard, App } from '../../src/App';

describe('管理端登录页', () => {
  it('渲染复旦品牌管理端登录界面', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('复旦大学');
    expect(html).toContain('自习室预约系统');
    expect(html).toContain('智慧空间管理');
    expect(html).toContain('管理入口');
    expect(html).toContain('统一身份认证');
    expect(html).toContain('管理员账号');
    expect(html).toContain('Admin123!');
    expect(html).toContain('type="button">学生入口');
    expect(html).not.toContain('localhost:5173');
    expect(html).not.toContain('I0 工程骨架');
    expect(html).not.toContain('I1 接入认证');
  });

  it('渲染登录成功后的管理仪表盘', () => {
    const html = renderToStaticMarkup(<AdminDashboard adminName="系统管理员" />);

    expect(html).toContain('管理仪表盘');
    expect(html).toContain('系统管理员');
    expect(html).toContain('自习室运行概览');
    expect(html).toContain('退出登录');
  });
});
