import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(process.cwd(), '../..');
const scriptUrl = pathToFileURL(resolve(repoRoot, 'scripts/check-story-trace.mjs')).href;

describe('story trace checker', () => {
  it('统计 Story 时同时包含未完成和已完成的复选框', async () => {
    const { countStoryTrace } = await import(scriptUrl);

    const trace = countStoryTrace(`
- [ ] **US1.1.1** 学生登录
  - 关联设计稿：s01
  - 测试目的：验证学生登录
- [x] **US1.1.2** 管理员登录
  - 关联设计稿：s01
  - 测试目的：验证管理员登录
- [X] **US1.1.3** 会话退出
  - 关联设计稿：s01
  - 测试目的：验证会话退出
`);

    expect(trace.stories).toBe(3);
    expect(trace.designRefs).toBe(3);
    expect(trace.testPurposes).toBe(3);
  });
});
