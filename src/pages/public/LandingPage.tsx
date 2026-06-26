import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  DoorOpen,
  ExternalLink,
  LogIn,
  MapPin,
  Megaphone,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  Users
} from "lucide-react";
import { DecorativeDots } from "../../components/landing/DecorativeDots";
import { HeroIllustration } from "../../components/landing/HeroIllustration";
import { PublicNavbar } from "../../components/layout/PublicNavbar";
import { apiFetch, buildQuery, listFetch } from "../../services/api";
import { APP_TAGLINE } from "../../lib/app-info";
import { displayText, formatDate } from "../../lib/format";

type MediaRef = {
  file_url: string;
};

type StaffRef = {
  name: string;
  slug?: string;
  position?: string;
  photoMedia?: MediaRef;
};

type PublicItem = {
  id: string;
  slug?: string;
  title?: string;
  name?: string;
  content?: string;
  description?: string;
  bio?: string;
  award_title?: string;
  announcement_date?: string;
  activity_date?: string;
  start_time?: string;
  end_time?: string;
  room_name?: string;
  pic_name?: string;
  participant_count?: number;
  institution?: string;
  preparation_note?: string;
  period_month?: number;
  period_year?: number;
  position?: string;
  employee_type?: string;
  type?: string;
  capacity?: number;
  facilities?: unknown;
  category?: { name?: string };
  room?: { name?: string };
  staff?: StaffRef;
  attachmentMedia?: MediaRef;
  photoMedia?: MediaRef;
  created_at?: string;
};

type PublicSummary = {
  date: string;
  menu: Array<{ title: string; path: string; description: string }>;
  todayOfficer: Array<{ staff?: StaffRef; officer_date?: string; note?: string }>;
  todayActivities: PublicItem[];
  latestAnnouncements: PublicItem[];
  staffOfMonth: PublicItem[];
  counts: Record<string, number>;
};

type PublicTabKey = "rules" | "announcements" | "activities" | "staffOfMonth" | "rooms" | "staff";

type PublicTab = {
  key: PublicTabKey;
  label: string;
  shortLabel: string;
  endpoint: string;
  detailEndpoint: (item: PublicItem) => string;
  countKey: string;
  icon: LucideIcon;
  description: string;
  searchPlaceholder: string;
};

const publicTabs: PublicTab[] = [
  {
    key: "rules",
    label: "Tata Tertib",
    shortLabel: "Tata Tertib",
    endpoint: "/public/rules",
    detailEndpoint: (item) => `/public/rules/${item.slug || item.id}`,
    countKey: "rules",
    icon: BookOpen,
    description: "Tata tertib pengunjung, peminjaman, dan aturan layanan perpustakaan.",
    searchPlaceholder: "Cari tata tertib"
  },
  {
    key: "activities",
    label: "Kalender Aktivitas",
    shortLabel: "Agenda",
    endpoint: "/public/activities",
    detailEndpoint: (item) => `/public/activities/${item.id}`,
    countKey: "activities",
    icon: CalendarDays,
    description: "Agenda kegiatan, kunjungan, dan penggunaan ruangan.",
    searchPlaceholder: "Cari agenda"
  },
  {
    key: "announcements",
    label: "Pengumuman",
    shortLabel: "Pengumuman",
    endpoint: "/public/announcements",
    detailEndpoint: (item) => `/public/announcements/${item.slug || item.id}`,
    countKey: "announcements",
    icon: Megaphone,
    description: "Pengumuman operasional yang perlu diketahui pengunjung.",
    searchPlaceholder: "Cari pengumuman"
  },
  {
    key: "staffOfMonth",
    label: "Staff of The Month",
    shortLabel: "Staff Terbaik",
    endpoint: "/public/staff-of-month",
    detailEndpoint: (item) => `/public/staff-of-month/${item.id}`,
    countKey: "staff",
    icon: Star,
    description: "Apresiasi pegawai dan PJLP berprestasi.",
    searchPlaceholder: "Cari staff terbaik"
  },
  {
    key: "rooms",
    label: "Profil Ruangan",
    shortLabel: "Ruangan",
    endpoint: "/public/rooms",
    detailEndpoint: (item) => `/public/rooms/${item.slug || item.id}`,
    countKey: "rooms",
    icon: DoorOpen,
    description: "Informasi ruangan, kapasitas, fasilitas, dan dokumentasi.",
    searchPlaceholder: "Cari ruangan"
  },
  {
    key: "staff",
    label: "Profil Pegawai",
    shortLabel: "Pegawai",
    endpoint: "/public/staff",
    detailEndpoint: (item) => `/public/staff/${item.slug || item.id}`,
    countKey: "staff",
    icon: UserRound,
    description: "Profil pegawai yang tampil di layanan INFOBASE.",
    searchPlaceholder: "Cari pegawai"
  }
];

function itemKey(item: PublicItem) {
  return item.slug || item.id;
}

function itemTitle(item?: PublicItem | null) {
  if (!item) return "Informasi belum tersedia";
  return item.title || item.name || item.staff?.name || item.award_title || "Tanpa judul";
}

function itemImage(item?: PublicItem | null) {
  return item?.attachmentMedia?.file_url || item?.photoMedia?.file_url || item?.staff?.photoMedia?.file_url || "";
}

function itemBody(item?: PublicItem | null) {
  return item?.content || item?.description || item?.bio || item?.preparation_note || "";
}

function itemDate(tab: PublicTab, item: PublicItem) {
  if (tab.key === "announcements") return item.announcement_date;
  if (tab.key === "activities") return item.activity_date;
  if (tab.key === "staffOfMonth" && item.period_month && item.period_year) {
    return `${item.period_month}/${item.period_year}`;
  }
  return item.created_at;
}

function countFor(summary: PublicSummary | undefined, tab: PublicTab) {
  return summary?.counts?.[tab.countKey] || 0;
}

function compactPage(meta?: { page: number; totalPages: number }) {
  if (!meta || meta.totalPages <= 1) return "";
  const end = Math.min(meta.totalPages, 3);
  const first = Array.from({ length: end }, (_, index) => index + 1).join(" | ");
  return `${first}${meta.totalPages > 3 ? ` | .....${meta.totalPages}` : ""}`;
}

function htmlOrFallback(value: string, fallback: string) {
  return value.trim() ? value : fallback;
}

function metaRows(tab: PublicTab, item: PublicItem) {
  if (tab.key === "rules") {
    return [
      ["Kategori", item.category?.name || "-"],
      ["Dokumen", item.attachmentMedia?.file_url ? "Tersedia" : "Tidak ada lampiran"]
    ];
  }

  if (tab.key === "announcements") {
    return [
      ["Tanggal", formatDate(item.announcement_date)],
      ["Waktu", item.start_time || item.end_time ? `${item.start_time || "-"} - ${item.end_time || "-"}` : "-"]
    ];
  }

  if (tab.key === "activities") {
    return [
      ["Tanggal", formatDate(item.activity_date)],
      ["Waktu", `${item.start_time || "-"} - ${item.end_time || "-"}`],
      ["Ruangan", item.room_name || item.room?.name || "-"],
      ["PJ", item.pic_name || "-"]
    ];
  }

  if (tab.key === "staffOfMonth") {
    return [
      ["Nama", item.staff?.name || "-"],
      ["Jabatan", item.staff?.position || "-"],
      ["Periode", item.period_month && item.period_year ? `${item.period_month}/${item.period_year}` : "-"]
    ];
  }

  if (tab.key === "rooms") {
    return [
      ["Tipe", item.type || "-"],
      ["Kapasitas", item.capacity ? `${item.capacity} orang` : "-"],
      ["Fasilitas", displayText(item.facilities)]
    ];
  }

  return [
    ["Jabatan", item.position || "-"],
    ["Tipe", item.employee_type || "-"]
  ];
}

function PublicHero({ summary }: { summary?: PublicSummary }) {
  const totalInfo = summary
    ? (summary.counts.rules || 0) + (summary.counts.announcements || 0) + (summary.counts.activities || 0) + (summary.counts.rooms || 0)
    : 0;

  return (
    <section id="home" className="relative overflow-hidden bg-infobase-dark text-infobase-white">
      <DecorativeDots />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_0.75fr] lg:items-center lg:px-10 lg:py-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-md border border-infobase-white/20 bg-infobase-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-infobase-white">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Pusat Informasi
          </div>
          <h1 className="mt-5 max-w-[12ch] text-4xl font-black uppercase leading-[0.95] text-infobase-white sm:text-5xl lg:text-6xl xl:text-7xl">
            INFOBASE UPPJPDS
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-infobase-white/78 sm:text-lg">
            {APP_TAGLINE}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-infobase-white/12 bg-infobase-white/10 p-4">
              <p className="text-2xl font-black">{totalInfo}</p>
              <p className="mt-1 text-xs font-bold text-infobase-white/65">informasi</p>
            </div>
            <div className="rounded-lg border border-infobase-white/12 bg-infobase-white/10 p-4">
              <p className="text-2xl font-black">{summary?.todayActivities.length || 0}</p>
              <p className="mt-1 text-xs font-bold text-infobase-white/65">agenda terbaru</p>
            </div>
            <div className="rounded-lg border border-infobase-white/12 bg-infobase-white/10 p-4">
              <p className="text-2xl font-black">{summary?.todayOfficer.length || 0}</p>
              <p className="mt-1 text-xs font-bold text-infobase-white/65">petugas</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#infobase"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-infobase-accent px-5 text-sm font-black text-infobase-white shadow-panel transition hover:bg-infobase-white hover:text-infobase-dark focus:outline-none focus:ring-4 focus:ring-infobase-white/30"
            >
              Buka Infobase
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              to="/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-infobase-white/25 px-5 text-sm font-bold text-infobase-white transition hover:bg-infobase-white hover:text-infobase-dark"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Login Petugas
            </Link>
          </div>
        </div>

        <div className="pb-8 lg:pb-0">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

function SummaryStrip({ summary }: { summary?: PublicSummary }) {
  const officer = summary?.todayOfficer[0]?.staff;
  const latest = summary?.latestAnnouncements[0];

  return (
    <section className="border-b border-emerald-900/10 bg-white px-5 py-5 text-infobase-black sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg bg-[#f4fbf8] p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-infobase-dark text-infobase-white">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Petugas Hari Ini</p>
            <p className="truncate text-sm font-black text-infobase-black">{officer?.name || "Belum ada jadwal"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-[#f4fbf8] p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-infobase-dark text-infobase-white">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Agenda</p>
            <p className="truncate text-sm font-black text-infobase-black">{summary?.todayActivities[0]?.title || "Belum ada agenda"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-[#f4fbf8] p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-infobase-dark text-infobase-white">
            <Megaphone className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Pengumuman</p>
            <p className="truncate text-sm font-black text-infobase-black">{latest?.title || "Belum ada pengumuman"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicInfobaseSection({ summary }: { summary?: PublicSummary }) {
  const [activeKey, setActiveKey] = useState<PublicTabKey>("rules");
  const [queryText, setQueryText] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const activeTab = useMemo(() => publicTabs.find((tab) => tab.key === activeKey) || publicTabs[0], [activeKey]);
  const listLimit = activeTab.key === "activities" ? 8 : 6;

  const listQuery = useQuery({
    queryKey: ["public-infobase", activeTab.key, submittedQuery, page],
    queryFn: () => listFetch<PublicItem>(`${activeTab.endpoint}${buildQuery({ q: submittedQuery, page, limit: listLimit })}`, { auth: false })
  });

  const items = listQuery.data?.data || [];

  useEffect(() => {
    if (!items.length) {
      setSelectedKey(null);
      return;
    }

    if (!selectedKey || !items.some((item) => itemKey(item) === selectedKey)) {
      setSelectedKey(itemKey(items[0]));
    }
  }, [items, selectedKey]);

  const selectedItem = items.find((item) => itemKey(item) === selectedKey) || items[0] || null;
  const detailItem = selectedItem;
  const detailImage = itemImage(detailItem);
  const body = htmlOrFallback(itemBody(detailItem), "Informasi lengkap belum tersedia.");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(queryText.trim());
    setPage(1);
    setSelectedKey(null);
  }

  function changeTab(key: PublicTabKey) {
    setActiveKey(key);
    setQueryText("");
    setSubmittedQuery("");
    setPage(1);
    setSelectedKey(null);
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    setSelectedKey(null);
  }

  return (
    <section id="infobase" className="bg-[#f6fbf8] px-5 py-12 text-infobase-black sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-infobase-primary">Infobase</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-black leading-tight text-infobase-dark sm:text-4xl">
              Temukan agenda, pengumuman, tata tertib, pegawai, dan ruangan UPPJPDS.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:justify-self-end">
            {publicTabs.slice(0, 3).map((tab) => (
              <div key={tab.key} className="rounded-lg border border-emerald-900/10 bg-white p-4 shadow-sm">
                <p className="text-2xl font-black text-infobase-dark">{countFor(summary, tab)}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{tab.shortLabel}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {publicTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.key === activeTab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => changeTab(tab.key)}
                className={`group flex min-h-[92px] items-start gap-3 rounded-lg border p-4 text-left shadow-sm transition ${
                  active
                    ? "border-infobase-primary bg-infobase-dark text-infobase-white"
                    : "border-emerald-900/10 bg-white text-infobase-black hover:border-infobase-primary"
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${active ? "bg-infobase-white text-infobase-dark" : "bg-infobase-pale text-infobase-primary"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-black">{tab.label}</span>
                  <span className={`mt-1 block text-xs font-semibold leading-5 ${active ? "text-infobase-white/70" : "text-slate-500"}`}>
                    {tab.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[390px_1fr] xl:items-start">
          <aside className="rounded-lg border border-emerald-900/10 bg-white p-4 shadow-sm">
            <form onSubmit={submitSearch}>
              <label className="sr-only" htmlFor="public-infobase-search">
                Cari
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="public-infobase-search"
                  value={queryText}
                  onChange={(event) => setQueryText(event.target.value)}
                  placeholder={activeTab.searchPlaceholder}
                  className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-20 text-sm font-semibold text-infobase-black outline-none transition placeholder:text-slate-400 focus:border-infobase-primary focus:ring-4 focus:ring-emerald-900/10"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 h-9 -translate-y-1/2 rounded-md bg-infobase-dark px-4 text-xs font-black text-white transition hover:bg-infobase-primary"
                >
                  Cari
                </button>
              </div>
            </form>

            <div className="mt-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">{activeTab.label}</p>
                <p className="text-sm font-semibold text-slate-500">Ditemukan ({listQuery.data?.meta.total || 0})</p>
              </div>
              <span className="rounded-full bg-infobase-pale px-3 py-1 text-xs font-black text-infobase-primary">
                {compactPage(listQuery.data?.meta) || "1"}
              </span>
            </div>

            <div className="mt-2 grid gap-1">
              {listQuery.isLoading ? (
                <div className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">Memuat data...</div>
              ) : null}
              {listQuery.isError ? (
                <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {(listQuery.error as Error).message}
                </div>
              ) : null}
              {!listQuery.isLoading && !items.length ? (
                <div className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">Informasi belum tersedia.</div>
              ) : null}

              {items.map((item) => {
                const selected = selectedKey === itemKey(item);
                const date = itemDate(activeTab, item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedKey(itemKey(item))}
                    className={`rounded-md px-3 py-3 text-left transition ${
                      selected ? "bg-infobase-pale text-infobase-dark" : "text-infobase-black hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-black leading-5">{itemTitle(item)}</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">
                      {date ? (activeTab.key === "staffOfMonth" ? date : formatDate(date)) : activeTab.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {listQuery.data ? (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 transition hover:border-infobase-primary hover:text-infobase-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <p className="text-xs font-bold text-slate-500">
                  {listQuery.data.meta.page} / {listQuery.data.meta.totalPages || 1}
                </p>
                <button
                  type="button"
                  disabled={page >= listQuery.data.meta.totalPages}
                  onClick={() => changePage(page + 1)}
                  className="rounded-md border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 transition hover:border-infobase-primary hover:text-infobase-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            ) : null}
          </aside>

          <article className="min-h-[520px] overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-infobase-primary">{activeTab.label}</p>
                  <h3 className="mt-2 text-2xl font-black leading-tight text-infobase-dark sm:text-3xl">
                    {itemTitle(detailItem)}
                  </h3>
                </div>
                <span className="rounded-full bg-[#fff7e6] px-3 py-1 text-xs font-black text-[#9a5b00]">
                  Bisa dibaca
                </span>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_290px]">
              <div className="p-5 sm:p-6">
                {detailImage ? (
                  <div className="mb-5 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                    <img src={detailImage} alt={itemTitle(detailItem)} className="max-h-[430px] w-full object-contain" />
                  </div>
                ) : null}

                <div
                  className="content-html text-sm font-medium leading-7 text-slate-700"
                  dangerouslySetInnerHTML={{ __html: body }}
                />

                {detailItem?.attachmentMedia?.file_url ? (
                  <a
                    href={detailItem.attachmentMedia.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-infobase-dark px-4 py-2 text-sm font-black text-white transition hover:bg-infobase-primary"
                  >
                    Buka Lampiran
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
              </div>

              <aside className="border-t border-slate-100 bg-[#fbfdfc] p-5 lg:border-l lg:border-t-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-infobase-primary">Ringkasan</p>
                <dl className="mt-4 grid gap-3">
                  {detailItem
                    ? metaRows(activeTab, detailItem).map(([label, value]) => (
                        <div key={label} className="rounded-md border border-slate-100 bg-white p-3">
                          <dt className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</dt>
                          <dd className="mt-1 break-words text-sm font-bold text-infobase-black">{value}</dd>
                        </div>
                      ))
                    : null}
                </dl>
              </aside>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function PublicContactSection({ summary }: { summary?: PublicSummary }) {
  const officer = summary?.todayOfficer[0]?.staff;
  const fallbackStaff = summary?.staffOfMonth[0]?.staff;
  const person = officer || fallbackStaff;
  const photo = person?.photoMedia?.file_url;

  return (
    <section id="contact" className="bg-infobase-dark px-5 py-10 text-infobase-white sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-infobase-accent">Kontak</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
            Kontak layanan UPPJPDS.
          </h2>
          <a
            href="https://dispusip.jakarta.go.id/cikini"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-infobase-white/78 transition hover:text-infobase-accent"
          >
            dispusip.jakarta.go.id/cikini
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex min-h-[112px] gap-3 rounded-lg border border-infobase-white/25 bg-infobase-white/10 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-infobase-accent/16 text-infobase-accent">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.14em] text-infobase-accent">Unit</span>
                <span className="mt-2 block text-sm font-bold leading-6 text-infobase-white">
                  UPT Perpustakaan Jakarta dan PDS H.B. Jassin
                </span>
              </span>
            </div>
            <div className="flex min-h-[112px] gap-3 rounded-lg border border-infobase-white/25 bg-infobase-white/10 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-infobase-accent/16 text-infobase-accent">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.14em] text-infobase-accent">Akses</span>
                <span className="mt-2 block text-sm font-bold leading-6 text-infobase-white">
                  Cikini, Jakarta Pusat
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="w-full rounded-lg border border-infobase-white/15 bg-white p-5 text-infobase-black shadow-panel lg:justify-self-end">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-infobase-pale text-2xl font-black text-infobase-primary">
              {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <Users className="h-8 w-8" aria-hidden="true" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Petugas Hari Ini</p>
              <h3 className="mt-1 truncate text-xl font-black text-infobase-dark">{person?.name || "Belum ada petugas"}</h3>
              <p className="truncate text-sm font-semibold text-slate-500">{person?.position || "UPPJPDS"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const summaryQuery = useQuery({
    queryKey: ["public-infobase-summary"],
    queryFn: async () => (await apiFetch<PublicSummary>("/public/infobase/summary", { auth: false })).data
  });

  return (
    <main className="min-h-screen bg-[#f6fbf8] text-infobase-black">
      <PublicNavbar />
      <PublicHero summary={summaryQuery.data} />
      <SummaryStrip summary={summaryQuery.data} />
      <PublicInfobaseSection summary={summaryQuery.data} />
      <PublicContactSection summary={summaryQuery.data} />
    </main>
  );
}
