import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, Upload } from "lucide-react";
import { apiFetch, listFetch } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Field, SelectInput, TextInput } from "../../components/ui/TextInput";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/StateViews";
import { formatDate } from "../../lib/format";

type Media = {
  id: string;
  original_name: string;
  file_url: string;
  public_id: string;
  mime_type: string;
  size: number;
  created_at: string;
};

export function AdminMediaPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-media"],
    queryFn: () => listFetch<Media>("/admin/media?limit=100")
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin-media"] });
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      await apiFetch("/admin/media/upload", {
        method: "POST",
        body: form
      });
      setMessage("Media berhasil diunggah");
      formElement.reset();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    }
  }

  async function remove(id: string) {
    try {
      await apiFetch(`/admin/media/${id}`, { method: "DELETE" });
      setMessage("Media berhasil dihapus");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Media gagal dihapus");
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 text-infobase-black shadow-sm sm:p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Manajemen Aset</p>
        <h1 className="mt-1 text-2xl font-black text-infobase-black">Media</h1>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]" onSubmit={upload}>
          <Field label="File">
            <TextInput name="file" type="file" required />
          </Field>
          <Field label="Folder">
            <SelectInput name="folder" defaultValue="general">
              <option value="staff">Staff</option>
              <option value="rooms">Rooms</option>
              <option value="rules">Rules</option>
              <option value="announcements">Announcements</option>
              <option value="general">General</option>
            </SelectInput>
          </Field>
          <div className="self-end">
            <Button type="submit">
              <Upload size={14} />
              Upload
            </Button>
          </div>
        </form>
        {message ? (
          <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800">
            <Check size={14} />
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState message={(query.error as Error).message} /> : null}
      {query.data?.data.length === 0 ? <EmptyState /> : null}

      {/* Media grid */}
      <section className="grid gap-3">
        {query.data?.data.map((media, i) => (
          <article
            key={media.id}
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-3 text-infobase-black shadow-sm animate-fadeIn"
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500">
              {media.mime_type.startsWith("image/") ? (
                <img src={media.file_url} alt={media.original_name} className="h-full w-full object-cover" />
              ) : (
                "PDF"
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-infobase-black">{media.original_name}</h2>
              <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                <span>{media.mime_type}</span>
                <span>{Math.round(media.size / 1024)} KB</span>
                <span>{formatDate(media.created_at)}</span>
              </p>
            </div>

            <button
              onClick={() => void remove(media.id)}
              title="Hapus"
              aria-label="Hapus"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-red-100 bg-white text-red-600 transition hover:border-red-300 hover:bg-red-50"
            >
              <Trash2 size={15} />
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
