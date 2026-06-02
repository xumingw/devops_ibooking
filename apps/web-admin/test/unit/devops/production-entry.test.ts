import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(process.cwd(), '../..');

const runDeployScript = ({
  apiPort,
  deployImagesEnvFile,
  envFile = '',
}: {
  apiPort?: string;
  deployImagesEnvFile?: string;
  envFile?: string;
}) => {
  const workdir = mkdtempSync(resolve(tmpdir(), 'deploy-api-port-'));
  const repo = resolve(workdir, 'repo');
  const github = resolve(repo, 'infra/github');
  const bin = resolve(workdir, 'bin');
  const calls = resolve(workdir, 'calls.log');

  mkdirSync(github, { recursive: true });
  mkdirSync(bin, { recursive: true });
  writeFileSync(resolve(repo, '.env'), envFile);
  if (deployImagesEnvFile !== undefined) {
    writeFileSync(resolve(repo, 'infra/.deploy-images.env'), deployImagesEnvFile);
  }
  writeFileSync(
    resolve(github, 'deploy.sh'),
    readFileSync(resolve(repoRoot, 'infra/github/deploy.sh'), 'utf8'),
  );
  chmodSync(resolve(github, 'deploy.sh'), 0o755);
  writeFileSync(
    resolve(bin, 'docker'),
    '#!/usr/bin/env sh\nprintf "docker %s\\n" "$*" >> "$DEPLOY_TEST_CALLS"\nexit 0\n',
  );
  writeFileSync(
    resolve(bin, 'curl'),
    '#!/usr/bin/env sh\nprintf "curl %s\\n" "$*" >> "$DEPLOY_TEST_CALLS"\nexit 0\n',
  );
  chmodSync(resolve(bin, 'docker'), 0o755);
  chmodSync(resolve(bin, 'curl'), 0o755);

  const env = {
    ...process.env,
    PATH: `${bin}:${process.env.PATH ?? ''}`,
    DEPLOY_TEST_CALLS: calls,
  };
  if (apiPort === undefined) delete env.API_PORT;
  else env.API_PORT = apiPort;

  const result = spawnSync('sh', [resolve(github, 'deploy.sh')], {
    cwd: repo,
    env,
    encoding: 'utf8',
  });
  const loggedCalls = existsSync(calls) ? readFileSync(calls, 'utf8') : '';
  rmSync(workdir, { recursive: true, force: true });

  return { ...result, loggedCalls };
};

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

  it('独立部署脚本用数字 API_PORT 检查本机健康接口', () => {
    const result = runDeployScript({ apiPort: '3000' });

    expect(result.status).toBe(0);
    expect(result.loggedCalls).toContain('curl -fsS http://127.0.0.1:3000/api/v1/health');
  });

  it('独立部署脚本未设置 API_PORT 时默认检查 3000 端口', () => {
    const result = runDeployScript({});

    expect(result.status).toBe(0);
    expect(result.loggedCalls).toContain('curl -fsS http://127.0.0.1:3000/api/v1/health');
  });

  it('独立部署脚本用 127.0.0.1 host:port 的端口检查本机健康接口', () => {
    const result = runDeployScript({ envFile: 'API_PORT=127.0.0.1:13000\n' });

    expect(result.status).toBe(0);
    expect(result.loggedCalls).toContain('curl -fsS http://127.0.0.1:13000/api/v1/health');
  });

  it('独立部署脚本用 localhost host:port 的端口检查本机健康接口', () => {
    const result = runDeployScript({ apiPort: 'localhost:13000' });

    expect(result.status).toBe(0);
    expect(result.loggedCalls).toContain('curl -fsS http://127.0.0.1:13000/api/v1/health');
  });

  it('独立部署脚本优先用部署镜像环境文件中的 API_PORT', () => {
    const result = runDeployScript({
      deployImagesEnvFile: 'API_PORT=127.0.0.1:13001\n',
      envFile: 'API_PORT=3000\n',
    });

    expect(result.status).toBe(0);
    expect(result.loggedCalls).toContain('curl -fsS http://127.0.0.1:13001/api/v1/health');
  });

  it('独立部署脚本拒绝非数字 API_PORT', () => {
    const result = runDeployScript({ apiPort: 'abc' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('API_PORT must be a numeric port between 1 and 65535');
    expect(result.loggedCalls).toBe('');
  });

  it('独立部署脚本拒绝 host:port 中的非数字端口', () => {
    const result = runDeployScript({ apiPort: '127.0.0.1:abc' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('API_PORT must be a numeric port between 1 and 65535');
    expect(result.loggedCalls).toBe('');
  });

  it('独立部署脚本拒绝超出范围的 API_PORT', () => {
    const result = runDeployScript({ apiPort: '70000' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('API_PORT must be between 1 and 65535');
    expect(result.loggedCalls).toBe('');
  });

  it('独立部署脚本拒绝超长数字 API_PORT', () => {
    const result = runDeployScript({ apiPort: '999999999999999999999999999999' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('API_PORT must be between 1 and 65535');
    expect(result.loggedCalls).toBe('');
  });

  it('独立部署脚本拒绝无法从本机检查的 host:port 绑定', () => {
    const result = runDeployScript({ apiPort: 'example.com:13000' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('API_PORT host must be 127.0.0.1, localhost, or 0.0.0.0');
    expect(result.loggedCalls).toBe('');
  });
});
