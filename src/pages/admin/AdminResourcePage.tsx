import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FileText, Image as ImageIcon, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, Upload, X } from "lucide-react";
import type { AdminConfig, AdminField } from "./adminConfigs";
import { apiFetch, buildQuery, listFetch } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Field, SelectInput, TextArea, TextInput } from "../../components/ui/TextInput";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/StateViews";
import { displayText, formatDate } from "../../lib/format";

type Item = Record<string, any>;

type MediaItem = {
  id: string;
  original_name?: string;
  file_url: string;
  mime_type?: string;
  size?: number;
};

function getValue(item: Item, key: string) {
  return key.split(".").reduce<unknown>((acc, segment) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[segment];
  }, item);
}

function inputDate(value: unknown) {
  if (!value) return "";
  return new Date(String(value)).toISOString().slice(0, 10);
}

function fieldSpan(field: AdminField) {
  return field.type === "textarea" || field.type === "jsonList" || field.type === "mediaUpload" ? "md:col-span-2" : "";
}

function mediaFromItem(field: AdminField, item: Item | null): MediaItem | null {
  if (!item) return null;
  const relation = field.mediaRelation || (field.name === "attachment_media_id" ? "attachmentMedia" : "photoMedia");
  const value = getValue(item, relation);
  if (!value || typeof value !== "object") return null;
  return value as MediaItem;
}

function MediaUploadControl({ field, item }: { field: AdminField; item: Item | null }) {
  const queryClient = useQueryClient();
  const existingMedia = mediaFromItem(field, item);
  const existingId = item ? getValue(item, field.name) : undefined;
  const [mediaId, setMediaId] = useState(existingId ? String(existingId) : existingMedia?.id || "");
  const [media, setMedia] = useState<MediaItem | null>(existingMedia);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const form = new FormData();
    form.set("file", file);
    form.set("folder", field.mediaFolder || "general");

    try {
      const result = await apiFetch<MediaItem>("/admin/media/upload", {
        method: "POST",
        body: form
      });
      setMediaId(result.data.id);
      setMedia(result.data);
      await queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
      input.value = "";
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    setMediaId("");
    setMedia(null);
  }

  const isImage = Boolean(media?.mime_type?.startsWith("image/") || media?.file_url.match(/\.(jpg|jpeg|png|webp|gif)$/i));

  return (
    <div className={fieldSpan(field)}>
      <Field label={field.label}>
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <input name={field.name} type="hidden" value={mediaId} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-infobase-dark px-4 text-sm font-black text-white transition hover:bg-infobase-primary">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
              {uploading ? "Mengunggah..." : "Upload File"}
              <input type="file" accept={field.accept} className="sr-only" onChange={(event) => void upload(event)} disabled={uploading} />
            </label>

            {media ? (
              <button
                type="button"
                onClick={clear}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Hapus Pilihan
              </button>
            ) : null}
          </div>

          {media ? (
            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-2.5">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md bg-slate-100 text-slate-500">
                {isImage ? (
                  <img src={media.file_url} alt={media.original_name || field.label} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-6 w-6" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-infobase-black">{media.original_name || "Media terunggah"}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">{media.mime_type || "Media"}</p>
              </div>
              <a
                href={media.file_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-slate-200 px-3 py-2 text-xs font-black text-infobase-primary transition hover:border-infobase-primary hover:bg-infobase-pale"
              >
                Lihat
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-white p-3 text-sm font-semibold text-slate-500">
              <ImageIcon className="h-4 w-4 text-infobase-primary" aria-hidden="true" />
              Belum ada file. Pilih file dari perangkat untuk mengisi media.
            </div>
          )}

          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
        </div>
      </Field>
    </div>
  );
}

function FieldControl({ field, item }: { field: AdminField; item: Item | null }) {
  const optionsQuery = useQuery({
    queryKey: ["options", field.optionEndpoint],
    enabled: Boolean(field.optionEndpoint),
    queryFn: () => listFetch<Item>(`${field.optionEndpoint}?limit=100`)
  });
  const value = item ? getValue(item, field.name) : undefined;
  const baseProps = {
    name: field.name,
    required: field.required
  };

  if (field.type === "mediaUpload") {
    return <MediaUploadControl field={field} item={item} />;
  }

  if (field.type === "textarea" || field.type === "jsonList") {
    const textValue = field.type === "jsonList" && Array.isArray(value) ? value.join("\n") : displayText(value) === "-" ? "" : String(value || "");
    return (
      <div className={fieldSpan(field)}>
        <Field label={field.label}>
          <TextArea {...baseProps} defaultValue={textValue} />
        </Field>
      </div>
    );
  }

  if (field.type === "select") {
    const options =
      field.options ||
      optionsQuery.data?.data.map((option) => ({
        label: String(option[field.optionLabel || "name"] || option.name || option.title || option.id),
        value: String(option.id)
      })) ||
      [];

    return (
      <div className={fieldSpan(field)}>
        <Field label={field.label}>
          <SelectInput {...baseProps} defaultValue={String(value || "")}>
            <option value="">Pilih data</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex h-10 items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-infobase-black">
        <input
          name={field.name}
          type="checkbox"
          defaultChecked={value === undefined ? true : Boolean(value)}
          className="h-4 w-4 rounded border-slate-300 accent-infobase-primary"
        />
        {field.label}
      </label>
    );
  }

  return (
    <div className={fieldSpan(field)}>
      <Field label={field.label}>
        <TextInput
          {...baseProps}
          type={field.type === "date" ? "date" : field.type === "time" ? "text" : field.type}
          defaultValue={field.type === "date" ? inputDate(value) : field.type === "password" ? "" : value ? String(value) : ""}
          placeholder={field.type === "time" ? "08.00" : undefined}
        />
      </Field>
    </div>
  );
}

function serialize(form: HTMLFormElement, fields: AdminField[], isEdit: boolean) {
  const formData = new FormData(form);
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    if (field.type === "checkbox") {
      payload[field.name] = formData.has(field.name);
      continue;
    }

    const raw = formData.get(field.name);
    const value = raw === null ? "" : String(raw).trim();
    if (isEdit && field.type === "password" && !value) continue;

    if (!value) {
      if (!field.required) payload[field.name] = null;
      continue;
    }

    if (field.type === "number") payload[field.name] = Number(value);
    else if (field.type === "jsonList") payload[field.name] = value.split("\n").map((entry) => entry.trim()).filter(Boolean);
    else payload[field.name] = value;
  }

  return payload;
}

function formatCell(columnKey: string, value: unknown) {
  if (columnKey.includes("date") || columnKey === "created_at") return formatDate(value as string);
  return displayText(value);
}

export function AdminResourcePage({ config }: { config: AdminConfig }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Item | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formVersion, setFormVersion] = useState(0);
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => [config.listEndpoint, q, page], [config.listEndpoint, q, page]);

  const query = useQuery({
    queryKey,
    queryFn: () => listFetch<Item>(`${config.listEndpoint}${buildQuery({ q, page, limit: 10 })}`)
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: [config.listEndpoint] });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage("");
    setError("");

    const payload = serialize(form, config.fields, Boolean(editing));
    try {
      await apiFetch(`${config.mutateEndpoint}${editing ? `/${editing.id}` : ""}`, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });
      setMessage(editing ? "Data berhasil diperbarui" : "Data berhasil dibuat");
      setEditing(null);
      setFormVersion((current) => current + 1);
      form.reset();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request gagal");
    }
  }

  async function remove(item: Item) {
    const label = displayText(getValue(item, config.columns[0]?.key || "id"));
    if (!window.confirm(`Hapus ${label}?`)) return;

    setMessage("");
    setError("");
    try {
      await apiFetch(`${config.mutateEndpoint}/${item.id}`, { method: "DELETE" });
      setMessage("Data berhasil dihapus");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Data gagal dihapus");
    }
  }

  const total = query.data?.meta.total || 0;
  const totalPages = query.data?.meta.totalPages || 1;

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-infobase-primary">Manajemen Data</p>
            <h1 className="mt-1 text-2xl font-black text-infobase-black">{config.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{editing ? "Mode edit aktif. Simpan perubahan atau batalkan untuk kembali menambah data." : "Tambah, ubah, hapus, dan cari data dari satu halaman."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void refresh()}>
              <RefreshCw size={15} />
              Refresh
            </Button>
            {editing ? (
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                <X size={15} />
                Batal Edit
              </Button>
            ) : null}
          </div>
        </div>

        <form key={`${editing?.id || "create"}-${formVersion}`} className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          {config.fields.map((field) => (
            <FieldControl key={field.name} field={field} item={editing} />
          ))}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 md:col-span-2 sm:flex-row sm:items-center">
            <Button type="submit">
              {editing ? <Check size={15} /> : <Plus size={15} />}
              {editing ? "Simpan Perubahan" : "Tambah Data"}
            </Button>
            {editing ? (
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Batal
              </Button>
            ) : null}
          </div>
        </form>

        {message ? (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800">
            <Check size={16} />
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-infobase-black">Daftar {config.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{total} data ditemukan</p>
            </div>
            <form
              className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setQ(String(data.get("q") || ""));
                setPage(1);
              }}
            >
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <TextInput name="q" placeholder={config.searchPlaceholder} className="w-full pl-9" defaultValue={q} />
              </div>
              <Button type="submit">Cari</Button>
            </form>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {query.isLoading ? <LoadingState /> : null}
          {query.isError ? <ErrorState message={(query.error as Error).message} /> : null}
          {query.data?.data.length === 0 ? <EmptyState /> : null}

          {query.data?.data.length ? (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="overflow-x-auto">
                <table className="table-stripe w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {config.columns.map((column) => (
                        <th key={column.key} className="px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                          {column.label}
                        </th>
                      ))}
                      <th className="w-[120px] px-4 py-3 text-right text-xs font-black uppercase tracking-[0.08em] text-slate-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {query.data.data.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        {config.columns.map((column) => {
                          const value = getValue(item, column.key);
                          return (
                            <td key={column.key} className="max-w-[280px] px-4 py-3 text-sm font-medium text-slate-700">
                              <span className="line-clamp-2">{formatCell(column.key, value)}</span>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(item);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              title="Edit"
                              aria-label="Edit"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-infobase-primary transition hover:border-infobase-primary hover:bg-infobase-pale"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void remove(item)}
                              title="Hapus"
                              aria-label="Hapus"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-100 bg-white text-red-600 transition hover:border-red-300 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        {query.data ? (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>
              Halaman <strong className="text-infobase-black">{query.data.meta.page}</strong> dari <strong className="text-infobase-black">{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                Prev
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
