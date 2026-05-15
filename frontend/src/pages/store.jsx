// Store reactivo global — API real cuando hay JWT, localStorage+MX cuando demo
window.Store = (() => {
  const KEY = 'mx_store_v1';

  // ─── Normalización API → formato MX ────────────────────────────────────────
  const norm = {
    st: (s) => (s || 'active').toLowerCase(),

    project: (p) => ({
      ...p,
      status:        norm.st(p.status),
      contractValue: Number(p.contractValue) || 0,
      billed:        Number(p.billed) || 0,
      progress:      Number(p.progress) || 0,
      start:         p.startDate ? p.startDate.slice(0, 10) : '',
      end:           p.endDate   ? p.endDate.slice(0, 10)   : '',
      color:         p.coverColor,
    }),

    client: (c) => ({
      ...c,
      ltv:            Number(c.ltv) || 0,
      activeProjects: Number(c.activeProjects) || 0,
    }),

    opportunity: (o) => ({
      ...o,
      amount: Number(o.amount) || 0,
    }),

    // API IncidentType → tipo pantalla
    incType: { NEAR_MISS:'cuasi', ACCIDENT:'leve', ENVIRONMENTAL:'leve', PROPERTY_DAMAGE:'leve', SECURITY:'grave' },
    // severity upgrade: ACCIDENT+HIGH → grave, ACCIDENT+CRITICAL → fatal
    incident: (i) => {
      let type = norm.incType[i.type] || 'cuasi';
      if (i.type === 'ACCIDENT') {
        if (i.severity === 'HIGH')     type = 'grave';
        if (i.severity === 'CRITICAL') type = 'fatal';
      }
      return { ...i, type, status: norm.st(i.status), date: i.occurredAt || i.createdAt };
    },

    well: (w) => ({
      ...w,
      status:   norm.st(w.status),
      depthCur: w.depthCurrent,
    }),

    // tipo pantalla → IncidentType para POST al API
    mxTypeToApi: { cuasi:'NEAR_MISS', leve:'ACCIDENT', grave:'ACCIDENT', fatal:'ACCIDENT' },
    mxTypeToSev: { cuasi:'LOW', leve:'LOW', grave:'HIGH', fatal:'CRITICAL' },
  };

  // ─── Estado local (fallback cuando no hay API) ────────────────────────────
  let additions = { projects: [], clients: [], opportunities: [], incidents: [], wells: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    Object.keys(additions).forEach((k) => { if (saved[k]) additions[k] = saved[k]; });
  } catch (_) {}

  const state = {
    projects:      [...MX.projects,      ...additions.projects],
    clients:       [...MX.clients,       ...additions.clients],
    opportunities: [...MX.opportunities, ...additions.opportunities],
    incidents:     [...MX.incidents,     ...additions.incidents],
    wells:         [...MX.wells,         ...additions.wells],
    personnel:     [...(MX.people || [])],
  };

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(additions)); } catch (_) {}
    window.dispatchEvent(new Event('store:update'));
  }

  // ─── Helpers de API ───────────────────────────────────────────────────────
  function hasToken() { return !!(window.Auth && Auth.getAccessToken()); }

  async function apiFetch(url, opts = {}) {
    if (!hasToken()) return null;
    try {
      const r = await Auth.apiFetch(url, opts);
      if (!r.ok) return null;
      return r.json();
    } catch (_) { return null; }
  }

  async function syncProjects() {
    const res = await apiFetch('/api/projects?limit=200');
    if (res && res.items) { state.projects = res.items.map(norm.project); window.dispatchEvent(new Event('store:update')); }
  }
  async function syncClients() {
    const res = await apiFetch('/api/clients?limit=200');
    if (res && res.items) { state.clients = res.items.map(norm.client); window.dispatchEvent(new Event('store:update')); }
  }
  async function syncOpportunities() {
    const res = await apiFetch('/api/pipeline');
    if (res && res.columns) {
      state.opportunities = Object.values(res.columns).flat().map(norm.opportunity);
      window.dispatchEvent(new Event('store:update'));
    }
  }
  async function syncIncidents() {
    const res = await apiFetch('/api/hse/incidents?limit=200');
    if (Array.isArray(res)) { state.incidents = res.map(norm.incident); window.dispatchEvent(new Event('store:update')); }
  }
  async function syncWells() {
    const res = await apiFetch('/api/wells?limit=200');
    if (Array.isArray(res)) { state.wells = res.map(norm.well); window.dispatchEvent(new Event('store:update')); }
  }
  async function syncPersonnel() {
    const res = await apiFetch('/api/personnel?limit=200');
    if (Array.isArray(res)) { state.personnel = res; window.dispatchEvent(new Event('store:update')); }
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────
  async function addProject(p) {
    if (hasToken()) {
      const body = {
        code: p.code, name: p.name, service: p.service, region: p.region,
        startDate: p.start || p.startDate, endDate: p.end || p.endDate,
        clientId: p.clientId, contractValue: Number(p.contractValue) || 0,
        ownerId: p.ownerId, status: 'ACTIVE', description: p.desc || '',
      };
      await apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(body) });
      await syncProjects();
    } else {
      additions.projects.push(p); state.projects.push(p); persist();
    }
  }

  async function addClient(c) {
    if (hasToken()) {
      await apiFetch('/api/clients', { method: 'POST', body: JSON.stringify({ ...c, tier: c.tier || 'C' }) });
      await syncClients();
    } else {
      additions.clients.push(c); state.clients.push(c); persist();
    }
  }

  async function addOpportunity(o) {
    if (hasToken()) {
      const body = {
        name: o.name, clientId: o.clientId, amount: Number(o.amount) || 0,
        prob: Number(o.prob) || 50, stage: o.stage || 'prospect',
        closeDate: o.closeDate || new Date().toISOString().slice(0, 10),
        nextAction: o.next || o.nextAction || '',
      };
      await apiFetch('/api/pipeline', { method: 'POST', body: JSON.stringify(body) });
      await syncOpportunities();
    } else {
      additions.opportunities.push(o); state.opportunities.push(o); persist();
    }
  }

  async function moveOpportunity(id, stage) {
    if (hasToken()) {
      await apiFetch(`/api/pipeline/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) });
      await syncOpportunities();
    } else {
      const o = state.opportunities.find((x) => x.id === id);
      if (o) { o.stage = stage; const ao = additions.opportunities.find((x) => x.id === id); if (ao) ao.stage = stage; }
      persist();
    }
  }

  async function addIncident(i) {
    if (hasToken()) {
      const body = {
        type:        norm.mxTypeToApi[i.type] || 'NEAR_MISS',
        severity:    norm.mxTypeToSev[i.type] || 'LOW',
        description: i.desc || i.description || '',
        projectId:   i.projectId || null,
        occurredAt:  i.date || i.occurredAt || new Date().toISOString(),
        location:    i.location || '',
        reportedBy:  i.investigatorId || '',
        status:      'OPEN',
      };
      await apiFetch('/api/hse/incidents', { method: 'POST', body: JSON.stringify(body) });
      await syncIncidents();
    } else {
      additions.incidents.push(i); state.incidents.push(i); persist();
    }
  }

  async function addWell(w) {
    if (hasToken()) {
      const body = {
        code: w.code, projectId: w.projectId, type: w.type,
        utmE: Number(w.utm?.e) || 0, utmN: Number(w.utm?.n) || 0, utmZ: Number(w.utm?.z) || 0,
        azimuth: Number(w.azimuth) || 0, dip: Number(w.dip) || 0,
        depthTarget: Number(w.depthTarget) || 0, status: 'ACTIVE',
        bit: w.bit || '',
      };
      await apiFetch('/api/wells', { method: 'POST', body: JSON.stringify(body) });
      await syncWells();
    } else {
      additions.wells.push(w); state.wells.push(w); persist();
    }
  }

  // ─── Hooks React ─────────────────────────────────────────────────────────
  function makeHook(getArr, syncFn) {
    return function() {
      const [data, setData] = React.useState(() => [...getArr()]);
      React.useEffect(() => {
        syncFn(); // cargar desde API si hay token
        const sync = () => setData([...getArr()]);
        window.addEventListener('store:update', sync);
        return () => window.removeEventListener('store:update', sync);
      }, []);
      return data;
    };
  }

  const useProjects      = makeHook(() => state.projects,      syncProjects);
  const useClients       = makeHook(() => state.clients,       syncClients);
  const useOpportunities = makeHook(() => state.opportunities, syncOpportunities);
  const useIncidents     = makeHook(() => state.incidents,     syncIncidents);
  const useWells         = makeHook(() => state.wells,         syncWells);
  const usePersonnel     = makeHook(() => state.personnel,     syncPersonnel);

  return {
    get projects()      { return state.projects; },
    get clients()       { return state.clients; },
    get opportunities() { return state.opportunities; },
    get incidents()     { return state.incidents; },
    get wells()         { return state.wells; },
    get personnel()     { return state.personnel; },
    addProject, addClient, addOpportunity, moveOpportunity, addIncident, addWell,
    useProjects, useClients, useOpportunities, useIncidents, useWells, usePersonnel,
    syncProjects, syncClients, syncOpportunities, syncIncidents, syncWells, syncPersonnel,
  };
})();
