const $ = id => document.getElementById(id);
const get = async path => { const r = await fetch(path); if (!r.ok) throw Error(`${r.status} ${path}`); return r.json(); };
const show = (id, value) => $(id).textContent = JSON.stringify(value, null, 2);
const status = error => $('status').textContent = error?.message || String(error || '');
const host = new SourceWindow.Host($('preview'), {onAction: event => {
  // Preview actions are only recorded. Gameplay handlers must be explicitly bound by its adapter.
  status(`收到绑定事件：${event.action}`); show('snapshot', host.snapshot());
}});
window.sourceHost = host;
async function openSelected() {
  const payload = await get('/api/layout?name=' + encodeURIComponent($('windows').value));
  host.open(payload, {bindings: JSON.parse($('bindings').value), state: JSON.parse($('state').value)});
  show('snapshot', host.snapshot());
}
for (const [id, fn] of Object.entries({
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
  await openSelected();
  $('search').click();
})().catch(status);
