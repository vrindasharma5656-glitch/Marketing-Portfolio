const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function adminFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function uploadFile(file: File, folder: string = 'projects'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch(`${SUPABASE_URL}/functions/v1/upload`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY },
    body: formData,
  });

  const data = await res.json();
  if (data.url) return data.url;
  throw new Error(data.error || 'Upload failed');
}

export async function deleteFile(path: string, token: string): Promise<void> {
  await adminFetch(`/storage/${encodeURIComponent(path)}`, token, { method: 'DELETE' });
}

export async function getProjects(token: string) {
  return adminFetch('/projects', token);
}

export async function createProject(token: string, project: { title: string; description: string; images: string[]; pdf_url?: string; category_ids: string[] }) {
  return adminFetch('/projects', token, { method: 'POST', body: JSON.stringify(project) });
}

export async function deleteProject(token: string, id: string) {
  return adminFetch(`/projects/${id}`, token, { method: 'DELETE' });
}

export async function getCategories(token: string) {
  return adminFetch('/categories', token);
}

export async function createCategory(token: string, name: string) {
  return adminFetch('/categories', token, { method: 'POST', body: JSON.stringify({ name }) });
}

export async function deleteCategory(token: string, id: string) {
  return adminFetch(`/categories/${id}`, token, { method: 'DELETE' });
}

export async function getAbout(token: string) {
  return adminFetch('/about', token);
}

export async function updateAbout(token: string, data: { headline?: string; biography?: string; photo_url?: string }) {
  return adminFetch('/about', token, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function getSections(token: string) {
  return adminFetch('/sections', token);
}

export async function updateSection(token: string, id: string, data: { visible?: boolean; section_label?: string; sort_order?: number }) {
  return adminFetch(`/sections/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteSection(token: string, id: string) {
  return adminFetch(`/sections/${id}`, token, { method: 'DELETE' });
}
