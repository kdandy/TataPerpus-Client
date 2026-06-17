import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, CalendarDays, DoorOpen, Megaphone, UserRound } from "lucide-react";
import { apiFetch } from "../../services/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/StateViews";

type Summary = {
  counts: Record<string, number>;
  todayOfficer: Array<{ staff?: { name: string } }>;
};

const cards = [
  { label: "Tata Tertib", key: "rules", href: "/admin/tata-tertib", icon: BookOpen },
  { label: "Pengumuman", key: "announcements", href: "/admin/pengumuman", icon: Megaphone },
  { label: "Agenda", key: "activities", href: "/admin/agenda", icon: CalendarDays },
  { label: "Pegawai", key: "staff", href: "/admin/profil-pegawai", icon: UserRound },
  { label: "Ruangan", key: "rooms", href: "/admin/profil-ruangan", icon: DoorOpen }
] as const;

export function AdminDashboard() {
  const query = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () => (await apiFetch<Summary>("/infobase/summary")).data
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={(query.error as Error).message} />;
  if (!query.data) return <EmptyState />;

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-black text-infobase-dark">Dashboard PNS</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-infobase-ink/60">
          <span className="h-2 w-2 rounded-full bg-infobase-accent animate-pulseGlow" />
          Today Officer: <span className="font-semibold text-infobase-dark">{query.data.todayOfficer[0]?.staff?.name || "Belum ada"}</span>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              to={card.href}
              className="group rounded-lg border border-slate-200 bg-white p-4 text-infobase-black shadow-sm transition hover:border-infobase-primary hover:shadow-md animate-fadeIn"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-infobase-ink/40">{card.label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-infobase-pale text-infobase-primary transition group-hover:bg-infobase-primary group-hover:text-white">
                  <Icon size={16} />
                </div>
              </div>
              <p className="mt-2 text-3xl font-black text-infobase-dark">{query.data.counts[card.key] || 0}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
