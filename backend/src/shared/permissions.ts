// Katalog hak akses — satu-satunya sumber daftar permission, dipakai backend & frontend
// (frontend import lewat alias "@shared/permissions"). Jangan import apa pun di file ini.
//
// Role & mapping role -> permission disimpan di DB dan diatur dari menu Role & Hak Akses.
// Menambah permission baru cukup di sini; salah ketik key di kode akan error saat compile.

type PermissionGroupDef = {
  module: string;
  label: string;
  permissions: readonly { key: string; label: string }[];
};

export const PERMISSION_GROUPS = [
  {
    module: "jemaat",
    label: "Data Jemaat",
    permissions: [
      { key: "jemaat.view", label: "Lihat data jemaat" },
      { key: "jemaat.manage", label: "Tambah, ubah & hapus jemaat" },
    ],
  },
  {
    module: "organization",
    label: "BPMJ & Pelsus",
    permissions: [{ key: "organization.manage", label: "Kelola BPMJ & Pelsus" }],
  },
  {
    module: "warta",
    label: "Warta",
    permissions: [{ key: "warta.manage", label: "Kelola warta" }],
  },
  {
    module: "events",
    label: "Kegiatan",
    permissions: [{ key: "events.manage", label: "Kelola kegiatan" }],
  },
  {
    module: "berita_acara",
    label: "Berita Acara Keuangan",
    permissions: [
      { key: "berita_acara.view", label: "Lihat berita acara" },
      { key: "berita_acara.manage", label: "Buat, ubah, submit & hapus berita acara" },
      { key: "berita_acara.approve", label: "Approve / tolak berita acara" },
    ],
  },
  {
    module: "access",
    label: "Pengaturan Akses",
    permissions: [
      { key: "users.manage", label: "Kelola user" },
      { key: "roles.manage", label: "Kelola role & hak akses" },
    ],
  },
] as const satisfies readonly PermissionGroupDef[];

export type PermissionGroup = (typeof PERMISSION_GROUPS)[number];
export type Permission = PermissionGroup["permissions"][number]["key"];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));

export const isValidPermission = (key: string): key is Permission =>
  (ALL_PERMISSIONS as string[]).includes(key);

export const permissionLabel = (key: string): string =>
  PERMISSION_GROUPS.flatMap((g) => g.permissions as readonly { key: string; label: string }[]).find((p) => p.key === key)
    ?.label ?? key;
