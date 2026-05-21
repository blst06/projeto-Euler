export function setToken(token: string) {
  (window as any).__cartivore_token = token;
}

export function getToken(): string | null {
  return (window as any).__cartivore_token || null;
}

export function clearToken() {
  (window as any).__cartivore_token = null;
}

export function isAuthenticated(): boolean {
  return !!(window as any).__cartivore_token;
}
