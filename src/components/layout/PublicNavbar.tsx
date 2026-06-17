const links = [
  { label: "Home", href: "#home" },
  { label: "Infobase", href: "#infobase" },
  { label: "Kontak", href: "#contact" }
];

export function PublicNavbar() {
  return (
    <header className="relative z-30 border-b border-emerald-900/10 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <a href="#home" className="text-xl font-black tracking-[-0.01em] text-infobase-dark sm:text-2xl">
          UPPJPDS
        </a>
        <nav
          aria-label="Navigasi utama"
          className="flex shrink-0 items-center gap-3 sm:gap-7 lg:gap-10"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-infobase-black/65 transition hover:text-infobase-primary sm:text-base"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
