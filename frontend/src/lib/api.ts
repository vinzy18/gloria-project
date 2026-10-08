import axios from "axios";
import type { AuthUser, RoleRef } from "./auth";

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
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
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

export type Warta = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  authorId: number | null;
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
  createdAt: string | null;
  createdBy: string | null;
};

export type Bpmj = {
  id: number;
  name: string;
  positionId: number | null;
  positionName: string | null;
  photoUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
};

export type Pelsus = {
  id: number;
  name: string;
  positionId: number | null;
  positionName: string | null;
  pelsus: string | null;
  pelayanan: string | null;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

export type OrganizationData = {
  bpmj: Bpmj[];
  pelsus: Pelsus[];
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

// ─── Berita Acara Keuangan ───────────────────────────────────────────────────

export type BeritaAcaraStatus = "draft" | "submitted" | "posted" | "rejected";
export type PengeluaranStatus = "pending" | "confirmed" | "dikembalikan";

export type MasterPemasukanLain = { id: number; name: string };

export type MasterPengeluaran = {
  id: number;
  name: string;
  isRequired: boolean;
  isMultiple: boolean;
  displayOrder: number;
};

export type PemasukanLainItem = {
  id?: number;
  masterId: number;
  masterName?: string;
  jumlah: number;
  keterangan: string | null;
};

export type PengeluaranItem = {
  id?: number;
  masterId: number;
  masterName?: string;
  isMultiple?: boolean;
  nomor?: number;
  nama: string | null;
  jumlah: number;
  signature: string | null;
  signedAt: string | null;
  status: PengeluaranStatus;
  statusAt: string | null;
};

export type BeritaAcaraKeuanganSummary = {
  id: number;
  jenisIbadah: string;
  tanggalIbadah: string;
  khadim: string;
  jumlahPemasukan: number;
  jumlahPengeluaran: number;
  totalSaldo: number;
  status: BeritaAcaraStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  updatedAt: string;
};

export type BeritaAcaraKeuangan = BeritaAcaraKeuanganSummary & {
  kantongPersembahan: number;
  kotakPersembahan: number;
  kotakPembangunan: number;
  keteranganPemasukan: string | null;
  terbilangPemasukan: string | null;
  keteranganPengeluaran: string | null;
  catatanBendahara: string | null;
  rejectedAt: string | null;
  createdAt: string;
  createdByName: string | null;
  submittedByName: string | null;
  approvedByName: string | null;
  rejectedByName: string | null;
  pemasukanLain: PemasukanLainItem[];
  pengeluaran: PengeluaranItem[];
};

export type BeritaAcaraKeuanganPayload = {
  jenisIbadah: string;
  tanggalIbadah: string;
  khadim: string;
  kantongPersembahan: number;
  kotakPersembahan: number;
  kotakPembangunan: number;
  keteranganPemasukan: string | null;
  keteranganPengeluaran: string | null;
  pemasukanLain: Pick<PemasukanLainItem, "masterId" | "jumlah" | "keterangan">[];
  pengeluaran: Pick<PengeluaranItem, "masterId" | "nama" | "jumlah" | "signature" | "signedAt" | "status" | "statusAt">[];
  submit: boolean;
};

// ─── API calls ───────────────────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string; user: AuthUser }>("/auth/login", { username, password }),
  me: () => api.get<AuthUser>("/auth/me"),
};

export const jemaatApi = {
  list: (params?: { search?: string; isActive?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Jemaat>>("/jemaat", { params }),
  get: (id: number) => api.get<Jemaat>(`/jemaat/${id}`),
  create: (data: Partial<Jemaat>) => api.post<Jemaat>("/jemaat", data),
  update: (id: number, data: Partial<Jemaat>) => api.put<Jemaat>(`/jemaat/${id}`, data),
  delete: (id: number) => api.delete(`/jemaat/${id}`),
};

export const wartaApi = {
  list: () => api.get<Warta[]>("/warta"),
  getBySlug: (slug: string) => api.get<Warta>(`/warta/${slug}`),
  adminList: (params?: { search?: string; isPublish?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Warta>>("/warta/admin/all", { params }),
  create: (data: Partial<Warta>) => api.post<Warta>("/warta", data),
  update: (id: number, data: Partial<Warta>) => api.put<Warta>(`/warta/${id}`, data),
  delete: (id: number) => api.delete(`/warta/${id}`),
};

export const eventsApi = {
  list: () => api.get<Event[]>("/events"),
  get: (id: number) => api.get<Event>(`/events/${id}`),
  adminList: (params?: { search?: string; isPublish?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Event>>("/events/admin/all", { params }),
  create: (data: Partial<Event>) => api.post<Event>("/events", data),
  update: (id: number, data: Partial<Event>) => api.put<Event>(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
};

export const organizationApi = {
  list: () => api.get<OrganizationData>("/organization"),
};

export const bpmjApi = {
  adminList: (params?: { search?: string; isActive?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Bpmj>>("/organization/admin/bpmj", { params }),
  create: (data: Partial<Bpmj>) => api.post<Bpmj>("/organization/admin/bpmj", data),
  update: (id: number, data: Partial<Bpmj>) =>api.put<Bpmj>(`/organization/admin/bpmj/${id}`, data),
  delete: (id:number) => api.delete(`/organization/admin/bpmj/${id}`)
}

export const pelsusApi = {
  adminList: (params?: { search?: string; isActive?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Pelsus>>("/organization/admin/pelsus", { params }),
  create: (data: Partial<Pelsus>) => api.post<Pelsus>("/organization/admin/pelsus", data),
  update: (id: number, data: Partial<Pelsus>) =>api.put<Pelsus>(`/organization/admin/pelsus/${id}`, data),
  delete: (id:number) => api.delete(`/organization/admin/pelsus/${id}`)
}

export const beritaAcaraApi = {
  masterPemasukanLain: () => api.get<MasterPemasukanLain[]>("/berita-acara/master/pemasukan-lain"),
  masterPengeluaran: () => api.get<MasterPengeluaran[]>("/berita-acara/master/pengeluaran"),
  list: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<BeritaAcaraKeuanganSummary>>("/berita-acara/keuangan", { params }),
  get: (id: number) => api.get<BeritaAcaraKeuangan>(`/berita-acara/keuangan/${id}`),
  create: (data: BeritaAcaraKeuanganPayload) => api.post<BeritaAcaraKeuangan>("/berita-acara/keuangan", data),
  update: (id: number, data: BeritaAcaraKeuanganPayload) =>
    api.put<BeritaAcaraKeuangan>(`/berita-acara/keuangan/${id}`, data),
  approve: (id: number) => api.post(`/berita-acara/keuangan/${id}/approve`),
  reject: (id: number, catatan: string) => api.post(`/berita-acara/keuangan/${id}/reject`, { catatan }),
  delete: (id: number) => api.delete(`/berita-acara/keuangan/${id}`),
};

// ─── RBAC ────────────────────────────────────────────────────────────────────

export type Role = {
  id: number;
  name: string;
  label: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  userCount: number;
  permissions: string[];
};

export type RolePayload = {
  name?: string;
  label: string;
  description: string | null;
  permissions: string[];
};

export type AdminUser = {
  id: number;
  username: string;
  fullName: string | null;
  roles: RoleRef[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserPayload = {
  username: string;
  fullName: string | null;
  // Kode role (Role.name)
  roles: string[];
  isActive: boolean;
  password?: string;
};

export const rbacApi = {
  roles: () => api.get<Role[]>("/rbac/roles"),
  createRole: (data: RolePayload) => api.post<Role>("/rbac/roles", data),
  updateRole: (id: number, data: RolePayload) => api.put<Role>(`/rbac/roles/${id}`, data),
  deleteRole: (id: number) => api.delete(`/rbac/roles/${id}`),
  users: (params?: { search?: string; role?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<AdminUser>>("/rbac/users", { params }),
  createUser: (data: AdminUserPayload) => api.post("/rbac/users", data),
  updateUser: (id: number, data: AdminUserPayload) => api.put(`/rbac/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/rbac/users/${id}`),
};

// Ambil pesan error dari response API (string biasa atau error validasi Zod dari zValidator)
export function getApiError(err: unknown, fallback = "Terjadi kesalahan"): string {
  const error = (err as {
    response?: { data?: { error?: string | { issues?: { message?: string }[] } } };
  })?.response?.data?.error;
  if (typeof error === "string") return error;
  return error?.issues?.[0]?.message ?? fallback;
}
