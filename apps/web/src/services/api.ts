import { ApiResponse, Employee360DTO, JourneyEventDTO, GoalDTO, AIChatMessage, ProjectDTO } from '@ejc/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const getAuthToken = () => localStorage.getItem('ejc_token');
export const setAuthToken = (token: string) => localStorage.setItem('ejc_token', token);
export const removeAuthToken = () => localStorage.removeItem('ejc_token');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data: ApiResponse<T> = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || data.message || 'API request failed');
    }
    return data.data as T;
  } catch (err: any) {
    throw err;
  }
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string; organizationSlug?: string }) =>
      request<{ tokens: { accessToken: string; refreshToken: string }; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: {
      email: string;
      password: string;
      organizationName: string;
      firstName: string;
      lastName: string;
      role?: string;
    }) =>
      request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    registerUser: (data: {
      email: string;
      password: string;
      organizationSlug: string;
      firstName: string;
      lastName: string;
      jobTitle?: string;
    }) =>
      request<any>('/auth/register-user', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<any>('/auth/me'),
  },
  organizations: {
    getPublicStatus: (slug: string) => request<any>(`/organizations/public-status/${slug}`),
    getCurrent: () => request<any>('/organizations/current'),
    updateCurrent: (data: any) =>
      request<any>('/organizations/current', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  employees: {
    list: (params: { search?: string; departmentId?: string; status?: string } = {}) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ total: number; items: any[] }>(`/employees?${q}`);
    },
    get360: (id: string) => request<Employee360DTO>(`/employees/${id}`),
    create: (data: any) => request<any>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  },
  journey: {
    getTimeline: (employeeId: string) => request<JourneyEventDTO[]>(`/journey/${employeeId}`),
    getStats: (employeeId: string) => request<any>(`/journey/${employeeId}/stats`),
    addMilestone: (data: any) => request<JourneyEventDTO>('/journey', { method: 'POST', body: JSON.stringify(data) }),
  },
  onboarding: {
    getProgress: (employeeId: string) => request<any>(`/onboarding/employee/${employeeId}`),
    updateTask: (taskId: string, status: string, notes?: string) =>
      request<any>(`/onboarding/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      }),
    getWizard: () => request<any>('/onboarding/wizard'),
    saveWizardStep: (step: number, data: any) =>
      request<any>('/onboarding/wizard/save', {
        method: 'POST',
        body: JSON.stringify({ step, data }),
      }),
    submitWizard: (data: any) =>
      request<any>('/onboarding/wizard/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  projects: {
    list: () => request<ProjectDTO[]>('/projects'),
    get: (id: string) => request<ProjectDTO>(`/projects/${id}`),
    create: (data: any) =>
      request<ProjectDTO>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<ProjectDTO>(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    addMember: (id: string, data: { employeeId: string; role?: string }) =>
      request<any>(`/projects/${id}/members`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    removeMember: (id: string, employeeId: string) =>
      request<any>(`/projects/${id}/members/${employeeId}`, {
        method: 'DELETE',
      }),
    delete: (id: string) =>
      request<any>(`/projects/${id}`, {
        method: 'DELETE',
      }),
  },
  performance: {
      getCycles: () => request<any>('/performance/cycles'),
  getReviews: () => request<any[]>('/performance/reviews'),
    getGoals: (employeeId: string) => request<GoalDTO[]>(`/performance/goals/employee/${employeeId}`),
    createGoal: (data: any) => request<any>('/performance/goals', { method: 'POST', body: JSON.stringify(data) }),
    updateGoal: (goalId: string, progressPercent: number, status?: string) =>
      request<any>(`/performance/goals/${goalId}`, {
        method: 'PATCH',
        body: JSON.stringify({ progressPercent, status }),
      }),
    submitReview: (data: any) =>
      request<any>('/performance/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  skills: {
    getEmployeeSkills: (employeeId: string) => request<any[]>(`/skills/employee/${employeeId}`),
    getCatalog: () => request<any[]>('/skills'),
    verify: (employeeSkillId: string) => request<any>(`/skills/verify/${employeeSkillId}`, { method: 'POST' }),
  },
learning: {
  getCourses: () => request<any[]>('/learning/courses'),

  enroll: (employeeId: string, courseId: string) =>
    request<any>('/learning/enroll', {
      method: 'POST',
      body: JSON.stringify({ employeeId, courseId }),
    }),

  complete: (enrollmentId: string) =>
    request<any>(`/learning/enrollments/${enrollmentId}/complete`, {
      method: 'POST',
    }),
},
  career: {
    getReadiness: (employeeId: string) => request<any>(`/career/readiness/${employeeId}`),
    promote: (data: { employeeId: string; newTitle: string; newLevel: string }) =>
      request<any>('/career/promote', { method: 'POST', body: JSON.stringify(data) }),
  },
  analytics: {
    getHR: () => request<any>('/analytics/hr'),
    getManager: () => request<any>('/analytics/manager'),
  },
  ai: {
    chat: (message: string, employeeId?: string) =>
      request<{ content: string; sources?: any[]; contextPills?: string[]; suggestedActions?: string[] }>(
        '/ai/chat',
        {
          method: 'POST',
          body: JSON.stringify({ message, employeeId }),
        }
      ),
  },
  documents: {
    list: () => request<any[]>('/documents'),
    ingest: (data: { title: string; content: string; category?: string; accessLevel?: string }) =>
      request<any>('/documents/ingest', { method: 'POST', body: JSON.stringify(data) }),
  },
  notifications: {
    list: () => request<any[]>('/notifications'),
  },
  audit: {
    list: () => request<any[]>('/audit'),
  },
};
