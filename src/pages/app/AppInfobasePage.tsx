import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarDays, DoorOpen, Megaphone, Star, UserCheck, UsersRound } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/StateViews";
import { apiFetch } from "../../services/api";
import { formatDate } from "../../lib/format";

type SummaryMenu = {
  title: string;
  path: string;
  description: string;
};

type Summary = {
  date: string;
  menu: SummaryMenu[];
  todayOfficer: Array<{
    id: string;
    staff?: {
      name: string;
      position?: string | null;
    } | null;
  }>;
  todayActivities: Array<{
    id: string;
    title: string;
    activity_date?: string | null;
    start_time?: string | null;
    room?: { name: string } | null;
  }>;
  latestAnnouncements: Array<{
    id: string;
    title: string;
    announcement_date?: string | null;
  }>;
  staffOfMonth: Array<{
    id: string;
    period_month?: number | null;
    period_year?: number | null;
    staff?: {
      name: string;
      position?: string | null;
    } | null;
  }>;
  counts: {
    rules: number;
    announcements: number;
    activities: number;
    staff: number;
    rooms: number;
  };
};

const statCards = [
  { label: "Tata Tertib", key: "rules", icon: BookOpen },
  { label: "Pengumuman", key: "announcements", icon: Megaphone },
  { label: "Agenda", key: "activities", icon: CalendarDays },
  { label: "Pegawai", key: "staff", icon: UsersRound },
  { label: "Ruangan", key: "rooms", icon: DoorOpen }
] as const;

const menuIcons = [BookOpen, CalendarDays, Megaphone, Star, DoorOpen] as const;

function formatTime(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 5);
}

function formatPeriod(month?: number | null, year?: number | null) {
  if (!month || !year) return "-";
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

export function AppInfobasePage() {
  const query = useQuery({
    queryKey: ["app-infobase-summary"],
    queryFn: async () => (await apiFetch<Summary>("/infobase/summary")).data
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={(query.error as Error).message} />;
  if (!query.data) return <EmptyState />;

  const summary = query.data;
  const activeOfficer = summary.todayOfficer[0]?.staff;

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Infobase Internal</p>
            <h1 className="mt-1 text-2xl font-black text-infobase-dark">Pusat Informasi Petugas</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-infobase-ink/65">
              Ringkasan tata tertib, pengumuman, agenda, petugas, dan profil ruangan untuk akses PNS dan PJLP.
            </p>
          </div>
          <div className="rounded-lg border border-infobase-dark/10 bg-infobase-pale px-4 py-3 text-sm font-bold text-infobase-dark">
            {formatDate(summary.date)}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="rounded-lg border border-slate-200 bg-white p-4 text-infobase-black shadow-sm animate-fadeIn"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-infobase-ink/50">{card.label}</p>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-infobase-pale text-infobase-primary">
                  <Icon size={16} />
                </div>
              </div>
              <p className="mt-2 text-3xl font-black text-infobase-dark">{summary.counts[card.key] || 0}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-infobase-black shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-infobase-dark text-white">
              <UserCheck size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Today Officer</p>
              <h2 className="truncate text-xl font-black text-infobase-dark">{activeOfficer?.name || "Belum ada jadwal"}</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {summary.menu.map((item, index) => {
              const Icon = menuIcons[index] || BookOpen;
              return (
                <div key={item.path} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-infobase-pale text-infobase-primary">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-infobase-dark">{item.title}</h3>
                      <p className="mt-1 text-sm font-semibold leading-5 text-infobase-ink/60">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 text-infobase-black shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Agenda Terdekat</p>
            <div className="mt-4 grid gap-3">
              {summary.todayActivities.length ? (
                summary.todayActivities.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-slate-200 p-3">
                    <h3 className="text-sm font-black text-infobase-dark">{activity.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-infobase-ink/60">
                      {[formatDate(activity.activity_date), formatTime(activity.start_time), activity.room?.name].filter(Boolean).join(" - ")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-infobase-ink/60">Belum ada agenda.</p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 text-infobase-black shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Pengumuman Terbaru</p>
            <div className="mt-4 grid gap-3">
              {summary.latestAnnouncements.length ? (
                summary.latestAnnouncements.slice(0, 4).map((announcement) => (
                  <div key={announcement.id} className="rounded-lg border border-slate-200 p-3">
                    <h3 className="text-sm font-black text-infobase-dark">{announcement.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-infobase-ink/60">{formatDate(announcement.announcement_date)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-infobase-ink/60">Belum ada pengumuman.</p>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 text-infobase-black shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Staff of The Month</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {summary.staffOfMonth.length ? (
            summary.staffOfMonth.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                <h3 className="truncate text-sm font-black text-infobase-dark">{item.staff?.name || "Tanpa nama"}</h3>
                <p className="mt-1 text-xs font-semibold text-infobase-ink/60">{formatPeriod(item.period_month, item.period_year)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm font-semibold text-infobase-ink/60">Belum ada data staff terbaik.</p>
          )}
        </div>
      </section>
    </div>
  );
}
