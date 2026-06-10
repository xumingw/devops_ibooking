import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const styles = readFileSync(resolve(__dirname, '../../../src/styles.css'), 'utf8');

describe('user management layout', () => {
  it('用户表格操作按钮保持单行展示', () => {
    expect(styles).toMatch(/\.user-management-actions\s*\{[^}]*flex-wrap:\s*nowrap/s);
    expect(styles).toMatch(/\.user-management-actions\s*\{[^}]*white-space:\s*nowrap/s);
    expect(styles).toMatch(/\.user-management-actions button\s*\{[^}]*flex:\s*0 0 auto/s);
    expect(styles).toMatch(/\.user-management-actions button\s*\{[^}]*white-space:\s*nowrap/s);
    expect(styles).toMatch(/grid-template-columns:[^;]*minmax\(234px,\s*234px\)/s);
  });
});
