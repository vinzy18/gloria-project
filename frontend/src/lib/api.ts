import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gloria_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("gloria_token");
      localStorage.removeItem("gloria_user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// ─── Types ───────────────────────────────────────────────────────────────────

export type Jemaat = {
  id: number;
  idJemaat: string | null;
  nama: string;
  nik: string | null;
  gender: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  alamat: string | null;
  phone: string | null;
  email: string | null;
  statusPernikahan: string | null;
  tanggalPernikahan: string | null;
  tanggalBaptis: string | null;
  kolom: string | null;
  pekerjaan: string | null;
  keluarga: string | null;
  bipra: string | null;
  joinDate: string | null;
  photoUrl: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type News = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
};

export type Event = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  coverImage: string | null;
  isActive: boolean;
};

export type OrgMember = {
  id: number;
  name: string;
  position: string;
  department: string | null;
  photoUrl: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

// ─── API calls ───────────────────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string; user: { id: number; username: string; role: string } }>("/auth/login", { username, password }),
  me: () => api.get("/auth/me"),
};

export const jemaatApi = {
  list: (params?: { search?: string; isActive?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Jemaat>>("/jemaat", { params }),
  get: (id: number) => api.get<Jemaat>(`/jemaat/${id}`),
  create: (data: Partial<Jemaat>) => api.post<Jemaat>("/jemaat", data),
  update: (id: number, data: Partial<Jemaat>) => api.put<Jemaat>(`/jemaat/${id}`, data),
  delete: (id: number) => api.delete(`/jemaat/${id}`),
};

export const newsApi = {
  list: () => api.get<News[]>("/news"),
  getBySlug: (slug: string) => api.get<News>(`/news/${slug}`),
  adminList: () => api.get<News[]>("/news/admin/all"),
  create: (data: Partial<News>) => api.post<News>("/news", data),
  update: (id: number, data: Partial<News>) => api.put<News>(`/news/${id}`, data),
  delete: (id: number) => api.delete(`/news/${id}`),
};

export const eventsApi = {
  list: () => api.get<Event[]>("/events"),
  get: (id: number) => api.get<Event>(`/events/${id}`),
  adminList: () => api.get<Event[]>("/events/admin/all"),
  create: (data: Partial<Event>) => api.post<Event>("/events", data),
  update: (id: number, data: Partial<Event>) => api.put<Event>(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
};

export const organizationApi = {
  list: () => api.get<OrgMember[]>("/organization"),
  adminList: () => api.get<OrgMember[]>("/organization/admin/all"),
  create: (data: Partial<OrgMember>) => api.post<OrgMember>("/organization", data),
  update: (id: number, data: Partial<OrgMember>) => api.put<OrgMember>(`/organization/${id}`, data),
  delete: (id: number) => api.delete(`/organization/${id}`),
};
