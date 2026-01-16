import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Types
export interface Application {
  id: string | number;
  company_name: string;
  company_details?: { name?: string; website?: string | null; industry?: string | null; notes?: string | null };
  position: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  job_url?: string;
  application_url?: string;
  location?: string;
  salary_range?: string;
  date_applied: string;
  date_saved?: string;
  date_interview?: string;
  date_offer?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationFormData {
  company_name: string;
  position: string;
  status: string;
  job_url: string;
  location: string;
  salary_range: string;
  date_saved?: string | null;
  date_applied?: string | null;
  date_interview?: string | null;
  date_offer?: string | null;
  date_rejected?: string | null;
  notes: string;
}

// Document types
export interface Document {
  id: number;
  user_id: number;
  application?: number;
  document_type: 'resume' | 'cover_letter' | 'other';
  file: string;
  file_name: string;
  is_master: boolean;
  file_url: string;
  created_at: string;
}

// Company types
export interface Company {
  id: number;
  name: string;
  website?: string;
  industry?: string;
  notes?: string;
  created_at: string;
}

// AI Generation types
export interface AIGeneration {
  id: number;
  user_id: number;
  application?: number;
  generation_type: 'tailored_resume' | 'cover_letter' | 'interview_prep' | 'match_score';
  generation_type_display: string;
  input_resume: string;
  job_description: string;
  job_url?: string;
  output_text: string;
  model_used: string;
  tokens_used?: number;
  created_at: string;
}

export interface User {
  username: string;
  email: string;
  full_name?: string;
  skills?: string;
}

export interface UserProfile {
  username: string;
  email: string;
  full_name?: string;
  skills?: string;
}

export interface AnalyticsOverview {
  total_applications: number;
  applications_applied?: number;
  saved_applications?: number;
  interviews?: number;
  offers?: number;
  rejected?: number;
  response_rate?: number;
  avg_days_to_response: number;
}

export interface ChartsData {
  applications_by_date?: Array<{ date: string; count: number }>;
  top_companies?: Array<{ company_name: string; count: number }>;
  response_trends?: Array<{ month: string; rate: number }>;
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
const authAPI = {
  login: async (username: string, password: string) => {
    const response = await axiosInstance.post('/auth/login/', { username, password });
    return response.data;
  },
  
  register: async (username: string, email: string, password: string) => {
    const response = await axiosInstance.post('/auth/register/', { username, email, password });
    return response.data;
  },
  
  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/profile/');
    return response.data;
  },
  
  updateProfile: async (data: { full_name: string; skills: string }) => {
    const response = await axiosInstance.put('/auth/profile/', data);
    return response.data;
  },
  
  changePassword: async (data: { old_password: string; new_password: string }) => {
    const response = await axiosInstance.post('/auth/change-password/', data);
    return response.data;
  },
};

// Applications endpoints
const applicationsAPI = {
  getAll: async (): Promise<Application[]> => {
    const response = await axiosInstance.get('/applications/');
    return response.data;
  },
  
  getById: async (id: string | number): Promise<Application> => {
    const response = await axiosInstance.get(`/applications/${id}/`);
    return response.data;
  },
  
  create: async (data: ApplicationFormData): Promise<Application> => {
    // Ensure all date fields are either YYYY-MM-DD or null
    const fixDate = (d: string | null | undefined) => d && d.length >= 10 ? d.slice(0, 10) : null;
    const payload = {
      ...data,
      application_url: data.job_url,
      location: data.location,
      job_url: undefined,
      date_saved: fixDate(data.date_saved),
      date_applied: fixDate(data.date_applied),
      date_interview: fixDate(data.date_interview),
      date_offer: fixDate(data.date_offer),
      date_rejected: fixDate((data as any).date_rejected),
    } as any;
    const response = await axiosInstance.post('/applications/', payload);
    return response.data;
  },

  update: async (id: string | number, data: ApplicationFormData): Promise<Application> => {
    const fixDate = (d: string | null | undefined) => d && d.length >= 10 ? d.slice(0, 10) : null;
    const payload = {
      ...data,
      application_url: data.job_url,
      location: data.location,
      job_url: undefined,
      date_saved: fixDate(data.date_saved),
      date_applied: fixDate(data.date_applied),
      date_interview: fixDate(data.date_interview),
      date_offer: fixDate(data.date_offer),
      date_rejected: fixDate((data as any).date_rejected),
    } as any;
    const response = await axiosInstance.put(`/applications/${id}/`, payload);
    return response.data;
  },
  
  delete: async (id: string | number): Promise<void> => {
    await axiosInstance.delete(`/applications/${id}/`);
  },
};

// Analytics endpoints
const analyticsAPI = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await axiosInstance.get('/analytics/overview/');
    return response.data;
  },

  getCharts: async (): Promise<ChartsData> => {
    const response = await axiosInstance.get('/analytics/charts/');
    return response.data;
  },
};

// Helper function for streaming fetch
async function streamingFetch(
  endpoint: string,
  body: Record<string, string>
): Promise<string> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No reader available');
  }

  const decoder = new TextDecoder();
  let result = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    result += chunk;
  }

  return result;
}

// AI Services - File upload with streaming endpoints
const aiServicesAPI = {
  tailorResume: async (
    file: File,
    jobDescription: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    const response = await fetch(`${API_BASE_URL}/ai/tailor-resume/`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      if (onChunk) onChunk(chunk);
    }

    return result;
  },

  generateCoverLetter: async (
    file: File,
    jobDescription: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    const response = await fetch(`${API_BASE_URL}/ai/generate-cover-letter/`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      if (onChunk) onChunk(chunk);
    }

    return result;
  },

  interviewPrep: async (
    file: File,
    jobDescription: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    const response = await fetch(`${API_BASE_URL}/ai/generate-interview-prep/`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      if (onChunk) onChunk(chunk);
    }

    return result;
  },

  matchScore: async (
    file: File,
    jobDescription: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    const response = await fetch(`${API_BASE_URL}/ai/match-score/`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      if (onChunk) onChunk(chunk);
    }

    return result;
  },
  
  scrapeJobDetails: async (jobUrl: string) => {
    const response = await axiosInstance.post('/ai/scrape-job/', { job_url: jobUrl });
    return response.data;
  },
};

// Documents endpoints
const documentsAPI = {
  getAll: async (): Promise<Document[]> => {
    const response = await axiosInstance.get('/documents/');
    return response.data;
  },

  getById: async (id: number): Promise<Document> => {
    const response = await axiosInstance.get(`/documents/${id}/`);
    return response.data;
  },

  upload: async (
    file: File,
    documentType: 'resume' | 'cover_letter' | 'other',
    isMaster?: boolean,
    applicationId?: number
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    if (isMaster) formData.append('is_master', 'true');
    if (applicationId) formData.append('application', applicationId.toString());

    const response = await axiosInstance.post('/documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/documents/${id}/`);
  },
};

// Companies endpoints
const companiesAPI = {
  getAll: async (): Promise<Company[]> => {
    const response = await axiosInstance.get('/companies/');
    return response.data;
  },

  getById: async (id: number): Promise<Company> => {
    const response = await axiosInstance.get(`/companies/${id}/`);
    return response.data;
  },

  create: async (data: {
    name: string;
    website?: string;
    industry?: string;
    notes?: string;
  }): Promise<Company> => {
    const response = await axiosInstance.post('/companies/', data);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      name?: string;
      website?: string;
      industry?: string;
      notes?: string;
    }
  ): Promise<Company> => {
    const response = await axiosInstance.put(`/companies/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/companies/${id}/`);
  },
};

// AI Generations history endpoints
const aiGenerationsAPI = {
  getAll: async (params?: {
    type?: string;
    application_id?: number;
  }): Promise<AIGeneration[]> => {
    const response = await axiosInstance.get('/ai/generations/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<AIGeneration> => {
    const response = await axiosInstance.get(`/ai/generations/${id}/`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/ai/generations/${id}/`);
  },
};

// Export as grouped object
export const api = {
  authAPI,
  applicationsAPI,
  analyticsAPI,
  aiServicesAPI,
  documentsAPI,
  companiesAPI,
  aiGenerationsAPI,
};
