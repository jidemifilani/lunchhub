const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function token() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lh_token');
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const t = token();
  const res = await fetch(`${BASE}/api${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      req<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => req<any>('/auth/me'),
  },
  menu: {
    items: (categoryId?: string) => req<any[]>(`/menu/items${categoryId ? `?categoryId=${categoryId}` : ''}`),
    categories: () => req<any[]>('/menu/categories'),
    daily: (date?: string) => req<any>(`/menu/daily?date=${date || today()}`),
    createItem: (data: any) => req<any>('/menu/items', { method: 'POST', body: JSON.stringify(data) }),
    updateItem: (id: string, data: any) => req<any>(`/menu/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    upsertDaily: (data: any) => req<any>('/menu/daily', { method: 'POST', body: JSON.stringify(data) }),
    setDaily: (data: any) => req<any>('/menu/daily', { method: 'POST', body: JSON.stringify(data) }),
    publishDaily: (date: string) => req<any>('/menu/daily/publish', { method: 'POST', body: JSON.stringify({ date }) }),
  },
  orders: {
    list: (status?: string) => req<any[]>(`/orders${status ? `?status=${status}` : ''}`),
    get: (id: string) => req<any>(`/orders/${id}`),
    create: (data: any) => req<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id: string) => req<any>(`/orders/${id}/cancel`, { method: 'POST' }),
    stats: () => req<any>('/orders/stats/today'),
  },
  kitchen: {
    queue: (status?: string) => req<any[]>(`/kitchen${status ? `?status=${status}` : ''}`),
    stats: () => req<any[]>('/kitchen/stats'),
    start: (id: string) => req<any>(`/kitchen/${id}/start`, { method: 'POST' }),
    done: (id: string) => req<any>(`/kitchen/${id}/done`, { method: 'POST' }),
    serve: (id: string) => req<any>(`/kitchen/${id}/serve`, { method: 'POST' }),
  },
  planner: {
    get: (weekStart?: string) => req<any>(`/planner${weekStart ? `?weekStart=${weekStart}` : ''}`),
    upsert: (data: any) => req<any>('/planner', { method: 'POST', body: JSON.stringify(data) }),
    save: (data: any) => req<any>('/planner', { method: 'POST', body: JSON.stringify(data) }),
    nutrition: (weekStart?: string) => req<any>(`/planner/nutrition${weekStart ? `?weekStart=${weekStart}` : ''}`),
  },
  deliveries: {
    list: (status?: string) => req<any[]>(`/deliveries${status ? `?status=${status}` : ''}`),
    get: (id: string) => req<any>(`/deliveries/${id}`),
    vendors: () => req<any[]>('/deliveries/vendors'),
    create: (data: any) => req<any>('/deliveries', { method: 'POST', body: JSON.stringify(data) }),
    receive: (id: string, lines: any[]) => req<any>(`/deliveries/${id}/receive`, { method: 'POST', body: JSON.stringify({ lines }) }),
    collect: (itemId: string, data: any) => req<any>(`/deliveries/items/${itemId}/collect`, { method: 'POST', body: JSON.stringify(data) }),
  },
  wallet: {
    balance: () => req<any>('/wallet'),
    history: () => req<any[]>('/wallet/history'),
    topUp: (amount: number, ref?: string) => req<any>('/wallet/top-up', { method: 'POST', body: JSON.stringify({ amount, ref }) }),
    allBalances: () => req<any[]>('/wallet/balances'),
  },
  users: {
    list: () => req<any[]>('/users'),
    get: (id: string) => req<any>(`/users/${id}`),
    create: (data: any) => req<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => req<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
};

function today() {
  return new Date().toISOString().split('T')[0];
}
