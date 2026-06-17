export function DecorativeDots() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-[42%] bg-[#006f55]" />
      <div className="absolute right-[34%] top-0 h-full w-20 -skew-x-12 bg-[#087f62]/70" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-infobase-white/15" />
      <div className="absolute left-0 top-1/3 h-px w-32 bg-infobase-white/25 sm:w-56" />
      <div className="absolute right-8 top-24 hidden h-[calc(100%-8rem)] w-px bg-infobase-white/15 lg:block" />
      <div className="absolute bottom-8 right-8 hidden h-px w-56 bg-infobase-white/20 lg:block" />
    </div>
  );
}
