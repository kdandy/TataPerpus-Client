import { BookOpen, Globe2 } from "lucide-react";
import heroTeam from "../../assets/landing/hero-team.png";

export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="overflow-hidden rounded-lg border border-infobase-white/20 bg-infobase-white p-2 shadow-panel">
        <img
          src={heroTeam}
          alt=""
          className="aspect-[4/3] w-full rounded-md object-cover"
          loading="eager"
        />
      </div>

      <div className="absolute -bottom-6 left-5 right-5 rounded-lg border border-emerald-100 bg-white p-4 shadow-panel sm:left-8 sm:right-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Layanan Informasi</p>
            <p className="mt-1 text-sm font-bold text-infobase-black">UPT Perpustakaan Jakarta dan PDS H.B. Jassin</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-infobase-pale text-infobase-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-md bg-infobase-pale text-infobase-primary">
              <Globe2 className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
