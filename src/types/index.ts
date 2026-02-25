export interface Prompt {
  id: number;
  title: string;
  description: string;
  content: string;
  tags: string[];
  popularity: number;
  creator_ip?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  prompt_id: number;
  content: string;
  type: 'user' | 'system';
  user_ip?: string;
  created_at: string;
}

export interface PromptListResponse {
  data: Prompt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePromptDto {
  title: string;
  description: string;
  content: string;
  tags: string[];
}

export interface UpdatePromptDto {
  content: string;
}

export interface CreateCommentDto {
  content: string;
}
