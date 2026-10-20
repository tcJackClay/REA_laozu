/* Data-driven source window host; no game/account state, eval or inferred handlers. */
window.SourceWindow = (() => {
  function prepare(layout, sprites, bindings, state, width, height) {
    const overrides = new Map(), warnings = [];
    const components = new Map(layout.nodes.flatMap(n => n.components.map(c => [String(c.pathID), n])));
    for (const n of layout.nodes) {
      const binding = bindings[n.path] || bindings[n.id];
      if (binding) {
        const read = key => binding[key] && typeof binding[key] === 'object'
          ? state[binding[key].state] : binding[key];
        overrides.set(n.id, Object.fromEntries(
          ['text', 'visible', 'image', 'fill', 'action', 'label', 'rect']
            .filter(k => k in binding).map(k => [k, read(k)])));
      }
      for (const c of n.components) {
        const sid = c.m_Sprite?.m_PathID;
        if (sid && String(sid) !== '0' && !sprites[String(sid)])
          warnings.push({kind: 'missing-sprite', path: n.path, id: sid});
      }
    }
    // Normalized window root; prefab authoring offsets are not screen placement.
    for (const n of layout.nodes.filter(n => !n.parentID)) {
      const o = overrides.get(n.id) || {};
      overrides.set(n.id, {...o, rect: {
        m_AnchorMin: {x: 0, y: 0}, m_AnchorMax: {x: 1, y: 1},
        m_SizeDelta: {x: 0, y: 0}, m_AnchoredPosition: {x: 0, y: 0},
        ...o.rect
      }});
    }
    const solved = UnityRect.solve(layout.nodes, width, height, overrides);
    for (const parent of layout.nodes) {
      const grid = parent.components.find(c => c.m_Enabled !== 0 && c.m_CellSize && c.m_Spacing);
      if (!grid) continue;
      const pr = solved.get(parent.id), pad = grid.m_Padding || {};
      const cell = grid.m_CellSize, gap = grid.m_Spacing;
      const children = layout.nodes.filter(n => n.parentID === parent.id && (overrides.get(n.id)?.visible ?? n.active));
      const constraint = grid.m_Constraint, count = Math.max(1, grid.m_ConstraintCount || 1);
      const cols = constraint === 1 ? count : constraint === 2 ? Math.ceil(children.length / count)
        : Math.max(1, Math.floor((pr.width - (pad.m_Left || 0) - (pad.m_Right || 0) + gap.x) / (cell.x + gap.x)));
      const rows = Math.ceil(children.length / cols);
      const startAxis = grid.fields?.m_StartAxis || 0, corner = grid.fields?.m_StartCorner || 0;
      children.forEach((n, i) => {
        let x = startAxis === 1 ? Math.floor(i / rows) : i % cols;
        let y = startAxis === 1 ? i % rows : Math.floor(i / cols);
        if (corner & 1) x = cols - 1 - x;
        if (corner & 2) y = rows - 1 - y;
        const o = overrides.get(n.id) || {};
        overrides.set(n.id, {...o, rect: {
          m_AnchorMin: {x: 0, y: 1}, m_AnchorMax: {x: 0, y: 1},
          m_Pivot: {x: 0, y: 1}, m_SizeDelta: cell,
          m_AnchoredPosition: {x: (pad.m_Left || 0) + x * (cell.x + gap.x),
            y: -(pad.m_Top || 0) - y * (cell.y + gap.y)}
        }});
      });
    }
    return {overrides, warnings, components};
  }

  class Host {
    constructor(container, {onAction = () => {}, width = 1080, height = 1920} = {}) {
      this.container = container; this.onAction = onAction; this.width = width; this.height = height;
      this.stack = []; this.events = [];
      this.observer = new ResizeObserver(() => this.fit());
      this.observer.observe(container);
      this.click = e => {
        const b = e.target.closest('[data-original-action]');
        if (!b || !container.contains(b)) return;
        const event = {action: b.dataset.originalAction, sourcePath: b.dataset.sourcePath, at: performance.now()};
        this.events.push(event); this.onAction(event, this);
      };
      container.addEventListener('click', this.click);
    }
    open(payload, {bindings = {}, state = {}, states = {}} = {}) {
      this.stack.push({payload, bindings, state: {...state}, states: {...states}});
      this.render(); return this;
    }
    close() { this.stack.pop(); this.render(); }
    update(values) { if (this.stack.length) Object.assign(this.stack.at(-1).state, values); this.render(); }
    setSwitcher(id, index) { if (this.stack.length) this.stack.at(-1).states[id] = index; this.render(); }
    render() {
      const active = this.stack.at(-1); this.container.replaceChildren();
      if (!active) { this.warnings = []; return; }
      const {layout, sprites} = active.payload;
      const p = prepare(layout, sprites, active.bindings, active.state, this.width, this.height);
      this.warnings = p.warnings;
      const node = UnityRect.render(layout, sprites, {
        width: this.width, height: this.height,
        states: new Map(Object.entries(active.states)), node: n => p.overrides.get(n.id) || {}
      });
      node.classList.add('source-window');
      node.style.width = this.width + 'px'; node.style.height = this.height + 'px';
      const elements = new Map([...node.querySelectorAll('[data-source-id]')].map(el => [el.dataset.sourceId, el]));
      for (const row of layout.nodes) for (const c of row.components) {
        const f = c.fields || {};
        if (f.m_Viewport && f.m_Content) {
          const viewport = p.components.get(String(f.m_Viewport.m_PathID));
          const el = elements.get(viewport?.id);
          if (el) { el.style.overflow = 'auto'; el.style.touchAction = 'pan-y'; el.setAttribute('tabindex', '0'); }
        }
        if (f.m_OnClick && !(active.bindings[row.path] || active.bindings[row.id])?.action)
          this.warnings.push({kind: 'unbound-button', path: row.path});
      }
      // Preserve Unity raycast intent; explicit binding always opts into input.
      for (const row of layout.nodes) {
        const el = elements.get(row.id);
        if (el && !el.dataset.originalAction && !row.components.some(c => c.m_RaycastTarget))
          el.style.pointerEvents = 'none';
      }
      this.container.append(node); this.fit();
    }
    fit() {
      const node = this.container.querySelector('.source-window');
      if (!node) return;
      const scale = Math.min(this.container.clientWidth / this.width, this.container.clientHeight / this.height);
      node.style.transformOrigin = 'top left';
      node.style.transform = `scale(${scale})`;
      node.style.left = ((this.container.clientWidth - this.width * scale) / 2) + 'px';
    }
    snapshot() {
      return {stack: this.stack.map(s => s.payload.layout.nodes[0]?.path),
        state: {...this.stack.at(-1)?.state}, warnings: this.warnings || [], events: [...this.events]};
    }
    destroy() { this.observer.disconnect(); this.container.removeEventListener('click', this.click); this.container.replaceChildren(); }
  }
  return {Host, prepare};
})();
