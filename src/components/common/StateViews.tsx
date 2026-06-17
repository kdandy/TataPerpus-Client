import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 text-infobase-black shadow-sm animate-fadeIn">
      <Loader2 className="h-5 w-5 animate-spin text-infobase-primary" />
      <span className="text-sm font-medium text-slate-600">Memuat data...</span>
    </div>
  );
}

export function EmptyState({ message = "Data belum tersedia." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-infobase-black shadow-sm animate-fadeIn">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-infobase-pale">
        <Inbox className="h-6 w-6 text-infobase-primary" />
      </div>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm animate-fadeIn">
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
      <p className="text-sm font-semibold text-red-700">{message}</p>
    </div>
  );
}
