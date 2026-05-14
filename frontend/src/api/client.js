import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL:         BASE_URL,
  timeout:         15_000,
  withCredentials: false,
});

// ── Token storage ─────────────────────────────────────────────────────────────

const TOKEN_KEY   = 'mx_access';
const REFRESH_KEY = 'mx_refresh';

export const tokenStore = {
  getAccess:     () => localStorage.getItem(TOKEN_KEY),
  setAccess:     (t) => localStorage.setItem(TOKEN_KEY, t),
  getRefresh:    () => localStorage.getItem(REFRESH_KEY),
  setRefresh:    (t) => localStorage.setItem(REFRESH_KEY, t),
  clearAll:      () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY); },
};

// ── Request interceptor — attach Bearer token ─────────────────────────────────

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — silent token refresh on 401 ───────────────────────

let refreshing = null; // singleton promise to avoid multiple concurrent refreshes

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retried &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      original._retried = true;

      if (!refreshing) {
        refreshing = api
          .post('/auth/refresh', { refreshToken: tokenStore.getRefresh() })
          .then(({ data }) => {
            tokenStore.setAccess(data.accessToken);
            tokenStore.setRefresh(data.refreshToken);
            refreshing = null;
            return data.accessToken;
          })
          .catch((err) => {
            refreshing = null;
            tokenStore.clearAll();
            window.dispatchEvent(new Event('mx:logout')); // trigger auth context cleanup
            return Promise.reject(err);
          });
      }

      try {
        const newToken = await refreshing;
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ── Convenience wrappers ──────────────────────────────────────────────────────

export const authApi = {
  login:          (data)         => api.post('/auth/login', data),
  refresh:        (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout:         (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me:             ()             => api.get('/auth/me'),
  changePassword: (data)         => api.post('/auth/change-password', data),
};

export const projectsApi = {
  list:   (params)  => api.get('/projects', { params }),
  get:    (id)      => api.get(`/projects/${id}`),
  create: (data)    => api.post('/projects', data),
  update: (id, d)   => api.patch(`/projects/${id}`, d),
  delete: (id)      => api.delete(`/projects/${id}`),
};

export const clientsApi = {
  list:   (params)  => api.get('/clients', { params }),
  get:    (id)      => api.get(`/clients/${id}`),
  create: (data)    => api.post('/clients', data),
  update: (id, d)   => api.patch(`/clients/${id}`, d),
  addContact: (id, d) => api.post(`/clients/${id}/contacts`, d),
};

export const pipelineApi = {
  list:      (params)           => api.get('/pipeline', { params }),
  create:    (data)             => api.post('/pipeline', data),
  moveStage: (id, stage, prob)  => api.patch(`/pipeline/${id}/stage`, { stage, prob }),
  update:    (id, d)            => api.patch(`/pipeline/${id}`, d),
  markLost:  (id, reason)       => api.post(`/pipeline/${id}/lost`, { reason }),
  convert:   (id, d)            => api.post(`/pipeline/${id}/convert`, d),
};

export const wellsApi = {
  list:    (params) => api.get('/wells', { params }),
  get:     (id)     => api.get(`/wells/${id}`),
  create:  (data)   => api.post('/wells', data),
  update:  (id, d)  => api.patch(`/wells/${id}`, d),
  addLog:  (id, d)  => api.post(`/wells/${id}/logs`, d),
  addCore: (id, d)  => api.post(`/wells/${id}/cores`, d),
};

export const hseApi = {
  incidents:        (params)  => api.get('/hse/incidents', { params }),
  createIncident:   (data)    => api.post('/hse/incidents', data),
  updateIncident:   (id, d)   => api.patch(`/hse/incidents/${id}`, d),
  permits:          (params)  => api.get('/hse/permits', { params }),
  createPermit:     (data)    => api.post('/hse/permits', data),
  updatePermit:     (id, d)   => api.patch(`/hse/permits/${id}`, d),
  certifications:   ()        => api.get('/hse/certifications'),
};

export const fleetApi = {
  list:         (params)  => api.get('/fleet', { params }),
  get:          (id)      => api.get(`/fleet/${id}`),
  create:       (data)    => api.post('/fleet', data),
  update:       (id, d)   => api.patch(`/fleet/${id}`, d),
  addMaintenance: (id, d) => api.post(`/fleet/${id}/maintenance`, d),
};

export const personnelApi = {
  list:             (params)  => api.get('/personnel', { params }),
  get:              (id)      => api.get(`/personnel/${id}`),
  invite:           (data)    => api.post('/personnel', data),
  update:           (id, d)   => api.patch(`/personnel/${id}`, d),
  addCertification: (id, d)   => api.post(`/personnel/${id}/certifications`, d),
};

export const visitsApi = {
  list:   (params) => api.get('/visits', { params }),
  get:    (id)     => api.get(`/visits/${id}`),
  create: (data)   => api.post('/visits', data),
  update: (id, d)  => api.patch(`/visits/${id}`, d),
};

export const filesApi = {
  presign: (data)         => api.post('/files/presign', data),
  confirm: (data)         => api.post('/files/confirm', data),
  getUrl:  (id)           => api.get(`/files/${id}/url`),
  list:    (params)       => api.get('/files', { params }),
  delete:  (id)           => api.delete(`/files/${id}`),

  // Upload a file end-to-end (presign → PUT to S3 → confirm)
  async upload(file, meta) {
    const { data: presign } = await api.post('/files/presign', {
      filename: file.name,
      mimeType: file.type,
      size:     file.size,
      category: meta.category || 'document',
    });

    await fetch(presign.uploadUrl, {
      method:  'PUT',
      headers: { 'Content-Type': file.type },
      body:    file,
    });

    const { data: record } = await api.post('/files/confirm', {
      key:      presign.key,
      bucket:   presign.bucket,
      filename: file.name,
      mimeType: file.type,
      size:     file.size,
      ...meta,
    });

    return record;
  },
};

export const dashboardApi = {
  summary: () => api.get('/dashboard'),
};

export const webhooksApi = {
  list:   ()          => api.get('/api/webhooks/outbound'),
  create: (data)      => api.post('/api/webhooks/outbound', data),
  update: (id, d)     => api.patch(`/api/webhooks/outbound/${id}`, d),
  delete: (id)        => api.delete(`/api/webhooks/outbound/${id}`),
  test:   (id)        => api.post(`/api/webhooks/outbound/${id}/test`),
};
