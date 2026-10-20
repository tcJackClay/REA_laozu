const $ = id => document.getElementById(id);
const get = async path => { const r = await fetch(path); if (!r.ok) throw Error(`${r.status} ${path}`); return r.json(); };
const show = (id, value) => $(id).textContent = JSON.stringify(value, null, 2);
const status = error => $('status').textContent = error?.message || String(error || '');
let activeAnalysis = [];
const host = new SourceWindow.Host($('preview'), {onAction: event => {
  // Preview actions are only recorded. Gameplay handlers must be explicitly bound by its adapter.
  status(`收到绑定事件：${event.action}`); show('snapshot', host.snapshot());
  const callback = event.action.split('.').at(-1);
  const button = activeAnalysis.flatMap(w => w.buttons).find(b => b.path === event.sourcePath && b.callback === callback);
  if (button) show('results', button);
}});
window.sourceHost = host;
async function openSelected() {
  const payload = await get('/api/layout?name=' + encodeURIComponent($('windows').value));
  host.open(payload, {bindings: JSON.parse($('bindings').value), state: JSON.parse($('state').value)});
  show('snapshot', host.snapshot());
}
async function autoBindings() {
  const windows = await get('/api/analysis/window?name=' + encodeURIComponent($('windows').value));
  if (!Array.isArray(windows)) return;
  activeAnalysis = windows;
  const candidates = windows.filter(w => Object.keys(w.bindings).length);
  // Do not silently choose between multiple same-name source classes.
  $('bindings').value = JSON.stringify(candidates.length === 1 ? candidates[0].bindings : {}, null, 2);
  show('results', windows);
}
async function analysisSummary() {
  const data = await get('/api/analysis');
  show('analysis-summary', {generatedAt:data.generatedAt,counts:data.counts,limits:data.limits});
  return data;
}
async function runAnalysis() {
  $('analyze').disabled = true;
  try {
    const response = await fetch('/api/analyze', {method:'POST'});
    if (!response.ok) throw Error('自动分析启动失败：' + response.status);
    for (;;) {
      const job = await get('/api/analysis/status');
      $('analysis-status').textContent = job.status === 'running' ? '正在扫描原版代码、关联资源与按钮…' : job.status;
      if (job.status === 'failed') throw Error(job.error);
      if (job.status !== 'running') break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await analysisSummary(); await autoBindings();
    if (host.stack.length) host.close(); await openSelected();
  } finally { $('analyze').disabled = false; }
}
$('windows').addEventListener('change', () => autoBindings().catch(status));
for (const [id, fn] of Object.entries({
  analyze: runAnalysis,
  search: async () => show('results', await get('/api/query?q=' + encodeURIComponent($('query').value))),
  open: openSelected,
  apply: async () => { if (host.stack.length) host.close(); await openSelected(); },
  back: () => { host.close(); show('snapshot', host.snapshot()); },
  update: () => { host.update(JSON.parse($('state').value)); show('snapshot', host.snapshot()); }
})) $(id).addEventListener('click', () => Promise.resolve().then(fn).catch(status));
(async () => {
  const [layouts, coverage, runs] = await Promise.all([get('/api/layouts'), get('/api/summary'), get('/api/runs')]);
  for (const row of layouts) {const o = document.createElement('option'); o.value = row.name; o.textContent = `${row.name} · ${row.nodes}`; $('windows').append(o);}
  $('windows').value = 'uibuygridconfirm';
  show('coverage', coverage); show('runs', runs);
  const analysis = await analysisSummary();
  if (analysis.status === 'not-run') { await runAnalysis(); return; }
  await autoBindings();
  await openSelected();
})().catch(status);
