import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const storyFile = '自习座位预约系统_Story测试描述清单.md';

export function countStoryTrace(content) {
  return {
    stories: (content.match(/^- \[[ xX]\] \*\*US/gm) ?? []).length,
    designRefs: (content.match(/关联设计稿：/g) ?? []).length,
    testPurposes: (content.match(/测试目的：/g) ?? []).length
  };
}

export function findStoryTraceFailures(trace, minimum = 118) {
  const failures = [];
  if (trace.stories < minimum) failures.push(`Story count ${trace.stories} < ${minimum}`);
  if (trace.designRefs < minimum) failures.push(`关联设计稿 count ${trace.designRefs} < ${minimum}`);
  if (trace.testPurposes < minimum) {
    failures.push(`测试目的 count ${trace.testPurposes} < ${minimum}`);
  }
  return failures;
}

export function runStoryTraceCheck(file = storyFile) {
  const content = readFileSync(file, 'utf8');
  const trace = countStoryTrace(content);
  const failures = findStoryTraceFailures(trace);
  return { trace, failures };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { trace, failures } = runStoryTraceCheck();

  if (failures.length > 0) {
    console.error(failures.join('\n'));
    process.exit(1);
  }

  console.log(
    `story trace ok: stories=${trace.stories}, designRefs=${trace.designRefs}, testPurposes=${trace.testPurposes}`
  );
}
