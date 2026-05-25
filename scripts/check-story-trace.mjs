import { readFileSync } from 'node:fs';

const storyFile = '自习座位预约系统_Story测试描述清单.md';
const content = readFileSync(storyFile, 'utf8');

const stories = (content.match(/^- \[ \] \*\*US/gm) ?? []).length;
const designRefs = (content.match(/关联设计稿：/g) ?? []).length;
const testPurposes = (content.match(/测试目的：/g) ?? []).length;

const failures = [];
if (stories < 118) failures.push(`Story count ${stories} < 118`);
if (designRefs < 118) failures.push(`关联设计稿 count ${designRefs} < 118`);
if (testPurposes < 118) failures.push(`测试目的 count ${testPurposes} < 118`);

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`story trace ok: stories=${stories}, designRefs=${designRefs}, testPurposes=${testPurposes}`);
