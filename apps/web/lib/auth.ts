'use client';

export function saveSession(token: string, user: any) {
  localStorage.setItem('lh_token', token);
  localStorage.setItem('lh_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('lh_token');
  localStorage.removeItem('lh_user');
}

export function getUser(): any | null {
  try {
    const s = localStorage.getItem('lh_user');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function getToken(): string | null {
  return localStorage.getItem('lh_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
