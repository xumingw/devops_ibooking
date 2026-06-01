import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(process.cwd(), '../..');

describe('production entry', () => {
  it('生产 CI/CD 只构建和部署统一 Web 入口', () => {
    const workflow = readFileSync(resolve(repoRoot, '.github/workflows/ci.yml'), 'utf8');
    const compose = readFileSync(resolve(repoRoot, 'infra/docker-compose.prod.yml'), 'utf8');
    const deploy = readFileSync(resolve(repoRoot, 'infra/github/deploy.sh'), 'utf8');

    expect(workflow).not.toContain('web-student');
    expect(workflow).not.toContain('WEB_STUDENT');
    expect(compose).not.toContain('web-student');
    expect(compose).not.toContain('WEB_STUDENT');
    expect(deploy).not.toContain('web-student');
    expect(deploy).not.toContain('WEB_STUDENT');
  });

  it('生产部署未配置 workflow CORS 变量时保留服务器白名单配置', () => {
    const workflow = readFileSync(resolve(repoRoot, '.github/workflows/ci.yml'), 'utf8');
    const compose = readFileSync(resolve(repoRoot, 'infra/docker-compose.prod.yml'), 'utf8');

    expect(workflow).toContain('PROD_CORS_ALLOWED_ORIGINS');
    expect(workflow).toContain('unset CORS_ALLOWED_ORIGINS');
    expect(workflow).toContain('if [ -n "${CORS_ALLOWED_ORIGINS:-}" ]; then');
    expect(compose).toContain('CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS:-}');
  });
});
