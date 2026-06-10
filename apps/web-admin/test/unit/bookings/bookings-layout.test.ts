import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const styles = readFileSync(resolve(__dirname, '../../../src/styles.css'), 'utf8');

describe('booking records layout', () => {
  it('预约记录操作按钮保持横向排列且不换行', () => {
    expect(styles).toMatch(/\.booking-records-actions\s*\{[^}]*flex-wrap:\s*nowrap/s);
    expect(styles).toMatch(/\.booking-records-actions button\s*\{[^}]*white-space:\s*nowrap/s);
    expect(styles).toMatch(/\.booking-records-actions button\s*\{[^}]*flex:\s*0 0 auto/s);
    expect(styles).toMatch(/grid-template-columns:[^;]*minmax\(136px,\s*136px\)/s);
  });
});
