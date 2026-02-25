import type { 
  Prompt, 
  PromptListResponse, 
  CreatePromptDto, 
  UpdatePromptDto,
  Comment,
  CreateCommentDto
} from '@/types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  prompts: {
    list: (params: { page?: number; limit?: number; search?: string; sort?: string }) => {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.search) query.append('search', params.search);
      if (params.sort) query.append('sort', params.sort);
      return fetchJson<PromptListResponse>(`/prompts?${query.toString()}`);
    },
    
    get: (id: number) => fetchJson<Prompt>(`/prompts/${id}`),
    
    create: (data: CreatePromptDto) => fetchJson<{ id: number; message: string }>('/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id: number, data: UpdatePromptDto) => fetchJson<{ message: string }>(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    copy: (id: number) => fetchJson<{ message: string }>(`/prompts/${id}/copy`, {
      method: 'POST',
    }),
  },
  
  comments: {
    list: (promptId: number) => fetchJson<Comment[]>(`/prompts/${promptId}/comments`),
    
    create: (promptId: number, data: CreateCommentDto) => fetchJson<{ id: number; message: string }>(`/prompts/${promptId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  }
};
