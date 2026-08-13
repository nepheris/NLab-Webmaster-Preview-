import fs from 'node:fs';

const [htmlPath, contractPath] = process.argv.slice(2);
if (!htmlPath || !contractPath) {
  throw new Error('usage: node smoke_test_gantt_hierarchy.mjs <index.html> <project-hierarchy.json>');
}

const html = fs.readFileSync(htmlPath, 'utf8');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const match = html.match(/<script id="hierarchyData" type="application\/json">([\s\S]*?)<\/script>/);
if (!match) throw new Error('embedded hierarchyData missing');
const data = JSON.parse(match[1]);

if (data.schema !== 'project-hierarchy-v0.2') throw new Error('unexpected embedded schema');
if (contract.schema !== data.schema) throw new Error('contract and embedded schema differ');
if (!Array.isArray(data.projects) || data.projects.length < 1) throw new Error('projects missing');

const contractIds = new Set((contract.projects || []).map(project => project.id));
const seen = new Set();
const validTypes = new Set(['project', 'subproject', 'task', 'subtask']);
let maxLevel = 0;

function visit(node, level, inheritedType = 'project') {
  const type = node.type || inheritedType;
  if (!node.id || seen.has(node.id)) throw new Error(`missing or duplicate id: ${node.id}`);
  if (!validTypes.has(type)) throw new Error(`invalid type for ${node.id}: ${type}`);
  if (!Number.isInteger(node.start) || node.start < 1 || node.start > 12) throw new Error(`invalid start for ${node.id}`);
  if (!Number.isInteger(node.span) || node.span < 1 || node.start + node.span - 1 > 12) throw new Error(`invalid span for ${node.id}`);
  if (!Number.isFinite(node.progress) || node.progress < 0 || node.progress > 100) throw new Error(`invalid progress for ${node.id}`);
  seen.add(node.id);
  maxLevel = Math.max(maxLevel, level);
  for (const child of node.children || []) visit(child, level + 1, child.type);
}

for (const project of data.projects) {
  if (!contractIds.has(project.id)) throw new Error(`project absent from contract: ${project.id}`);
  visit(project, 1);
}
if (contractIds.size !== data.projects.length) throw new Error('contract project count differs');
if (maxLevel < 4) throw new Error('four hierarchy levels are not exercised');

const markers = [
  'role="treegrid"', 'role="rowgroup"', 'role="rowheader"', 'role="gridcell"',
  'aria-level="${n.level}"', 'aria-expanded="${expanded.has(n.id)}"',
  'aria-label="${action} ${esc(n.name)}"', 'history.pushState',
  "new URLSearchParams(location.search).get('project')", 'data-project="${p.id}"'
];
for (const marker of markers) if (!html.includes(marker)) throw new Error(`behavior marker missing: ${marker}`);
if (/\bfetch\s*\(|XMLHttpRequest|setInterval\s*\(/.test(html)) throw new Error('unexpected automatic network or polling primitive');

console.log(JSON.stringify({
  status: 'PASS', schema: data.schema, projects: data.projects.length,
  nodes: seen.size, hierarchy_levels_exercised: maxLevel, network_requests_on_load: 0
}));
