export type AdminField = {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "date" | "time" | "number" | "select" | "checkbox" | "jsonList" | "mediaUpload";
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  optionEndpoint?: string;
  optionLabel?: string;
  mediaFolder?: "staff" | "rooms" | "rules" | "announcements" | "general";
  mediaRelation?: string;
  accept?: string;
};

export type AdminConfig = {
  title: string;
  listEndpoint: string;
  mutateEndpoint: string;
  searchPlaceholder: string;
  columns: Array<{ key: string; label: string }>;
  fields: AdminField[];
};

export const adminConfigs = {
  users: {
    title: "Users",
    listEndpoint: "/admin/users",
    mutateEndpoint: "/admin/users",
    searchPlaceholder: "Cari user...",
    columns: [
      { key: "name", label: "Nama" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "password" },
      { name: "role", label: "Role", type: "select", required: true, options: [{ label: "PNS", value: "PNS" }, { label: "PJLP", value: "PJLP" }] },
      { name: "status", label: "Status", type: "select", options: [{ label: "ACTIVE", value: "ACTIVE" }, { label: "INACTIVE", value: "INACTIVE" }] }
    ]
  },
  ruleCategories: {
    title: "Kategori Tata Tertib",
    listEndpoint: "/rule-categories",
    mutateEndpoint: "/admin/rule-categories",
    searchPlaceholder: "Cari kategori...",
    columns: [
      { key: "name", label: "Nama" },
      { key: "sort_order", label: "Urutan" },
      { key: "description", label: "Deskripsi" }
    ],
    fields: [
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "sort_order", label: "Urutan", type: "number" }
    ]
  },
  rules: {
    title: "Tata Tertib",
    listEndpoint: "/rules",
    mutateEndpoint: "/admin/rules",
    searchPlaceholder: "Cari tata tertib...",
    columns: [
      { key: "title", label: "Judul" },
      { key: "category.name", label: "Kategori" },
      { key: "created_at", label: "Dibuat" }
    ],
    fields: [
      { name: "title", label: "Judul", type: "text", required: true },
      { name: "category_id", label: "Kategori", type: "select", required: true, optionEndpoint: "/rule-categories", optionLabel: "name" },
      { name: "content", label: "Isi", type: "textarea", required: true },
      { name: "attachment_media_id", label: "Lampiran", type: "mediaUpload", mediaFolder: "rules", mediaRelation: "attachmentMedia", accept: "image/*,application/pdf" }
    ]
  },
  announcements: {
    title: "Pengumuman",
    listEndpoint: "/announcements",
    mutateEndpoint: "/admin/announcements",
    searchPlaceholder: "Cari pengumuman...",
    columns: [
      { key: "title", label: "Judul" },
      { key: "announcement_date", label: "Tanggal" },
      { key: "impact", label: "Impact" }
    ],
    fields: [
      { name: "title", label: "Judul", type: "text", required: true },
      { name: "announcement_date", label: "Tanggal", type: "date", required: true },
      { name: "start_time", label: "Waktu Mulai", type: "time" },
      { name: "end_time", label: "Waktu Selesai", type: "time" },
      { name: "impact", label: "Impact", type: "text" },
      { name: "content", label: "Isi", type: "textarea", required: true }
    ]
  },
  activities: {
    title: "Agenda",
    listEndpoint: "/activities",
    mutateEndpoint: "/admin/activities",
    searchPlaceholder: "Cari agenda...",
    columns: [
      { key: "title", label: "Judul" },
      { key: "activity_date", label: "Tanggal" },
      { key: "room_name", label: "Ruangan" },
      { key: "pic_name", label: "PJ" }
    ],
    fields: [
      { name: "title", label: "Judul", type: "text", required: true },
      { name: "activity_date", label: "Tanggal", type: "date", required: true },
      { name: "start_time", label: "Waktu Mulai", type: "time" },
      { name: "end_time", label: "Waktu Selesai", type: "time" },
      { name: "room_id", label: "Ruangan", type: "select", optionEndpoint: "/rooms", optionLabel: "name" },
      { name: "room_name", label: "Nama Ruangan", type: "text" },
      { name: "pic_name", label: "PJ", type: "text" },
      { name: "participant_count", label: "Jumlah Peserta", type: "number" },
      { name: "institution", label: "Instansi", type: "text" },
      { name: "preparation_note", label: "Catatan Persiapan", type: "textarea" },
      { name: "description", label: "Deskripsi", type: "textarea" }
    ]
  },
  staffOfMonth: {
    title: "Staff of The Month",
    listEndpoint: "/staff-of-month",
    mutateEndpoint: "/admin/staff-of-month",
    searchPlaceholder: "Cari penghargaan...",
    columns: [
      { key: "staff.name", label: "Staff" },
      { key: "award_title", label: "Penghargaan" },
      { key: "period_month", label: "Bulan" },
      { key: "period_year", label: "Tahun" }
    ],
    fields: [
      { name: "staff_id", label: "Staff", type: "select", required: true, optionEndpoint: "/staff", optionLabel: "name" },
      { name: "period_month", label: "Bulan", type: "number", required: true },
      { name: "period_year", label: "Tahun", type: "number", required: true },
      { name: "award_title", label: "Judul Penghargaan", type: "text", required: true },
      { name: "description", label: "Deskripsi", type: "textarea" }
    ]
  },
  todayOfficer: {
    title: "Today Officer",
    listEndpoint: "/today-officer",
    mutateEndpoint: "/admin/today-officer",
    searchPlaceholder: "Cari catatan...",
    columns: [
      { key: "staff.name", label: "Staff" },
      { key: "officer_date", label: "Tanggal" },
      { key: "note", label: "Catatan" }
    ],
    fields: [
      { name: "staff_id", label: "Staff", type: "select", required: true, optionEndpoint: "/staff", optionLabel: "name" },
      { name: "officer_date", label: "Tanggal", type: "date", required: true },
      { name: "note", label: "Catatan", type: "textarea" }
    ]
  },
  staff: {
    title: "Profil Pegawai",
    listEndpoint: "/staff",
    mutateEndpoint: "/admin/staff",
    searchPlaceholder: "Cari pegawai...",
    columns: [
      { key: "name", label: "Nama" },
      { key: "position", label: "Jabatan" },
      { key: "employee_type", label: "Tipe" }
    ],
    fields: [
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "position", label: "Jabatan", type: "text", required: true },
      { name: "employee_type", label: "Tipe Pegawai", type: "select", required: true, options: [{ label: "PNS", value: "PNS" }, { label: "PJLP", value: "PJLP" }] },
      { name: "photo_media_id", label: "Foto Pegawai", type: "mediaUpload", mediaFolder: "staff", mediaRelation: "photoMedia", accept: "image/*" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "is_active", label: "Aktif", type: "checkbox" }
    ]
  },
  rooms: {
    title: "Profil Ruangan",
    listEndpoint: "/rooms",
    mutateEndpoint: "/admin/rooms",
    searchPlaceholder: "Cari ruangan...",
    columns: [
      { key: "name", label: "Nama" },
      { key: "type", label: "Tipe" },
      { key: "capacity", label: "Kapasitas" }
    ],
    fields: [
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "type", label: "Tipe", type: "text", required: true },
      { name: "capacity", label: "Kapasitas", type: "number" },
      { name: "facilities", label: "Fasilitas per baris", type: "jsonList" },
      { name: "photo_media_id", label: "Foto Ruangan", type: "mediaUpload", mediaFolder: "rooms", mediaRelation: "photoMedia", accept: "image/*" },
      { name: "description", label: "Deskripsi", type: "textarea", required: true }
    ]
  }
} satisfies Record<string, AdminConfig>;
