const API_URL = 'http://localhost:3000';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_URL + path, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} - ${res.statusText}\n${text}`);
  }
  return res.json() as Promise<T>;
}

export async function requestWithMeta<T>(path: string, init?: RequestInit): Promise<{ data: T; total?: number; headers: Headers }> {
  const res = await fetch(API_URL + path, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} - ${res.statusText}\n${text}`);
  }
  const totalHeader = res.headers.get('X-Total-Count') || undefined;
  const total = totalHeader ? Number(totalHeader) : undefined;
  const data = await res.json();
  return { data, total, headers: res.headers };
}