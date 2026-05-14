// Store reactivo global — persiste en localStorage, notifica a React via CustomEvent
window.Store = (() => {
  const KEY = 'mx_store_v1';

  // Cargar adiciones previas del usuario (NO los datos de MX para evitar duplicados)
  let additions = { projects: [], clients: [], opportunities: [], incidents: [], wells: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (saved.projects)     additions.projects     = saved.projects;
    if (saved.clients)      additions.clients      = saved.clients;
    if (saved.opportunities) additions.opportunities = saved.opportunities;
    if (saved.incidents)    additions.incidents    = saved.incidents;
    if (saved.wells)        additions.wells        = saved.wells;
  } catch (_) {}

  // Estado mutable: datos MX + adiciones del usuario
  const state = {
    projects:      [...MX.projects,      ...additions.projects],
    clients:       [...MX.clients,       ...additions.clients],
    opportunities: [...MX.opportunities, ...additions.opportunities],
    incidents:     [...MX.incidents,     ...additions.incidents],
    wells:         [...MX.wells,         ...additions.wells],
  };

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(additions)); } catch (_) {}
    window.dispatchEvent(new Event('store:update'));
  }

  // ---- CRUD ----
  function addProject(p) {
    additions.projects.push(p);
    state.projects.push(p);
    persist();
  }

  function addClient(c) {
    additions.clients.push(c);
    state.clients.push(c);
    persist();
  }

  function addOpportunity(o) {
    additions.opportunities.push(o);
    state.opportunities.push(o);
    persist();
  }

  function moveOpportunity(id, stage) {
    const o = state.opportunities.find((x) => x.id === id);
    if (o) {
      o.stage = stage;
      // Actualizar en additions si está ahí
      const ao = additions.opportunities.find((x) => x.id === id);
      if (ao) ao.stage = stage;
    }
    persist();
  }

  function addIncident(i) {
    additions.incidents.push(i);
    state.incidents.push(i);
    persist();
  }

  function addWell(w) {
    additions.wells.push(w);
    state.wells.push(w);
    persist();
  }

  // ---- Hooks React ----
  function useProjects() {
    const [data, setData] = React.useState(() => [...state.projects]);
    React.useEffect(() => {
      const sync = () => setData([...state.projects]);
      window.addEventListener('store:update', sync);
      return () => window.removeEventListener('store:update', sync);
    }, []);
    return data;
  }

  function useClients() {
    const [data, setData] = React.useState(() => [...state.clients]);
    React.useEffect(() => {
      const sync = () => setData([...state.clients]);
      window.addEventListener('store:update', sync);
      return () => window.removeEventListener('store:update', sync);
    }, []);
    return data;
  }

  function useOpportunities() {
    const [data, setData] = React.useState(() => [...state.opportunities]);
    React.useEffect(() => {
      const sync = () => setData([...state.opportunities]);
      window.addEventListener('store:update', sync);
      return () => window.removeEventListener('store:update', sync);
    }, []);
    return data;
  }

  function useIncidents() {
    const [data, setData] = React.useState(() => [...state.incidents]);
    React.useEffect(() => {
      const sync = () => setData([...state.incidents]);
      window.addEventListener('store:update', sync);
      return () => window.removeEventListener('store:update', sync);
    }, []);
    return data;
  }

  function useWells() {
    const [data, setData] = React.useState(() => [...state.wells]);
    React.useEffect(() => {
      const sync = () => setData([...state.wells]);
      window.addEventListener('store:update', sync);
      return () => window.removeEventListener('store:update', sync);
    }, []);
    return data;
  }

  return {
    // Getters síncronos (para uso fuera de React)
    get projects()      { return state.projects; },
    get clients()       { return state.clients; },
    get opportunities() { return state.opportunities; },
    get incidents()     { return state.incidents; },
    get wells()         { return state.wells; },

    // CRUD
    addProject,
    addClient,
    addOpportunity,
    moveOpportunity,
    addIncident,
    addWell,

    // Hooks
    useProjects,
    useClients,
    useOpportunities,
    useIncidents,
    useWells,
  };
})();
