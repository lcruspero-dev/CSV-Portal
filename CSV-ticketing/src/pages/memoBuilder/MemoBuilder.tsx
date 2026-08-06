import { MemoBuilderAPI, MemoBuilderPayload } from "@/API/endpoint";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/useAuth";
import {
  AlertCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  Eye,
  FilePenLine,
  FilePlus2,
  Loader2,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type MemoStatus = "draft" | "published" | "archived";

interface UserSummary {
  _id: string;
  name: string;
  email: string;
}

interface MemoRecord {
  _id: string;
  title: string;
  subject: string;
  content: string;
  status: MemoStatus;
  createdBy: UserSummary;
  updatedBy: UserSummary;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const EMPTY_FORM: MemoBuilderPayload = { title: "", subject: "", content: "", status: "draft" };

const errorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "Something went wrong. Please try again.";
};

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : "—";

const statusStyle: Record<MemoStatus, string> = {
  draft: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  published: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  archived: "bg-slate-200 text-slate-700 hover:bg-slate-200",
};

export default function MemoBuilder() {
  const [memos, setMemos] = useState<MemoRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"all" | MemoStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MemoRecord | null>(null);
  const [dialog, setDialog] = useState<"view" | "form" | null>(null);
  const [form, setForm] = useState<MemoBuilderPayload>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const canManage = useMemo(
    () => Boolean(user?.isAdmin || (user && ["TL", "TM"].includes(user.role))),
    [user],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadMemos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await MemoBuilderAPI.list({
        search: debouncedSearch,
        status,
        page: pagination.page,
        limit: pagination.limit,
      });
      setMemos(response.data.data);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, pagination.page, pagination.limit]);

  useEffect(() => {
    void loadMemos();
  }, [loadMemos]);

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }));
  }, [debouncedSearch, status]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialog("form");
  };

  const openEdit = (memo: MemoRecord) => {
    setEditingId(memo._id);
    setForm({ title: memo.title, subject: memo.subject, content: memo.content, status: memo.status });
    setDialog("form");
  };

  const openView = async (memo: MemoRecord) => {
    setSelected(memo);
    setDialog("view");
    try {
      const response = await MemoBuilderAPI.get(memo._id);
      setSelected(response.data);
    } catch (requestError) {
      toast({ title: "Unable to load memo", description: errorMessage(requestError), variant: "destructive" });
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.subject.trim() || !form.content.trim()) {
      toast({ title: "Missing information", description: "Title, subject, and content are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await MemoBuilderAPI.update(editingId, form);
      } else {
        await MemoBuilderAPI.create(form);
      }
      toast({ title: editingId ? "Memo updated" : "Memo created", description: "Your changes have been saved." });
      setDialog(null);
      await loadMemos();
    } catch (requestError) {
      toast({ title: "Unable to save memo", description: errorMessage(requestError), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (memo: MemoRecord, nextStatus: MemoStatus) => {
    setActionId(memo._id);
    try {
      await MemoBuilderAPI.setStatus(memo._id, nextStatus);
      toast({ title: nextStatus === "published" ? "Memo published" : "Memo archived" });
      await loadMemos();
      if (selected?._id === memo._id) setDialog(null);
    } catch (requestError) {
      toast({ title: "Unable to update status", description: errorMessage(requestError), variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const remove = async (memo: MemoRecord) => {
    if (!window.confirm(`Delete “${memo.title}”? This cannot be undone.`)) return;
    setActionId(memo._id);
    try {
      await MemoBuilderAPI.delete(memo._id);
      toast({ title: "Memo deleted" });
      if (memos.length === 1 && pagination.page > 1) {
        setPagination((current) => ({ ...current, page: current.page - 1 }));
      } else {
        await loadMemos();
      }
      setDialog(null);
    } catch (requestError) {
      toast({ title: "Unable to delete memo", description: errorMessage(requestError), variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memo Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, publish, and maintain internal memos.</p>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="gap-2"><FilePlus2 className="h-4 w-4" />Create memo</Button>
        )}
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-[1fr_200px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, subject, or content" className="pl-9" />
          </div>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | MemoStatus)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </CardContent>
      </Card>

      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error} <button className="underline" onClick={() => void loadMemos()}>Try again</button></AlertDescription></Alert>}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading memos…</div>
      ) : memos.length === 0 ? (
        <Card><CardContent className="flex min-h-64 flex-col items-center justify-center text-center"><FilePenLine className="mb-3 h-10 w-10 text-muted-foreground" /><p className="font-medium">No memos found</p><p className="text-sm text-muted-foreground">Adjust the filters{canManage ? " or create a new memo" : ""}.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {memos.map((memo) => (
            <Card key={memo._id} className="flex flex-col">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="line-clamp-2 text-lg">{memo.title}</CardTitle>
                  <Badge className={statusStyle[memo.status]}>{memo.status}</Badge>
                </div>
                <p className="line-clamp-2 text-sm font-medium text-muted-foreground">{memo.subject}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="line-clamp-3 whitespace-pre-wrap text-sm">{memo.content}</p>
                <div className="mt-auto text-xs text-muted-foreground">Updated {formatDate(memo.updatedAt)}{memo.updatedBy?.name ? ` by ${memo.updatedBy.name}` : ""}</div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => void openView(memo)}><Eye className="mr-1 h-4 w-4" />View</Button>
                  {canManage && <Button size="sm" variant="outline" onClick={() => openEdit(memo)}><FilePenLine className="mr-1 h-4 w-4" />Edit</Button>}
                  {canManage && memo.status === "draft" && <Button size="sm" onClick={() => void changeStatus(memo, "published")} disabled={actionId === memo._id}><Send className="mr-1 h-4 w-4" />Publish</Button>}
                  {canManage && memo.status !== "archived" && <Button size="sm" variant="secondary" onClick={() => void changeStatus(memo, "archived")} disabled={actionId === memo._id}><Archive className="mr-1 h-4 w-4" />Archive</Button>}
                  {canManage && <Button size="sm" variant="destructive" onClick={() => void remove(memo)} disabled={actionId === memo._id}><Trash2 className="h-4 w-4" /><span className="sr-only">Delete</span></Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && pagination.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
          <span className="text-muted-foreground">Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}><ChevronLeft className="h-4 w-4" />Previous</Button>
            <span>Page {pagination.page} of {pagination.pages}</span>
            <Button size="sm" variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next<ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="memo-dialog-title" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setDialog(null); }}>
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-xl">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div><CardTitle id="memo-dialog-title">{dialog === "form" ? (editingId ? "Edit memo" : "Create memo") : selected?.title}</CardTitle>{dialog === "view" && selected && <p className="mt-2 text-sm text-muted-foreground">{selected.subject}</p>}</div>
              <Button size="icon" variant="ghost" onClick={() => setDialog(null)} disabled={saving}><X className="h-4 w-4" /><span className="sr-only">Close</span></Button>
            </CardHeader>
            <CardContent>
              {dialog === "form" ? (
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-2"><label htmlFor="memo-title" className="text-sm font-medium">Title</label><Input id="memo-title" maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></div>
                  <div className="space-y-2"><label htmlFor="memo-subject" className="text-sm font-medium">Subject</label><Input id="memo-subject" maxLength={240} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required /></div>
                  <div className="space-y-2"><label htmlFor="memo-content" className="text-sm font-medium">Content</label><Textarea id="memo-content" rows={12} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required /></div>
                  {!editingId && <div className="space-y-2"><label htmlFor="memo-status" className="text-sm font-medium">Save as</label><select id="memo-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as MemoStatus })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></div>}
                  <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialog(null)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingId ? "Save changes" : "Create memo"}</Button></div>
                </form>
              ) : selected ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2"><Badge className={statusStyle[selected.status]}>{selected.status}</Badge><span className="text-xs text-muted-foreground">Created {formatDate(selected.createdAt)}{selected.createdBy?.name ? ` by ${selected.createdBy.name}` : ""}</span></div>
                  <div className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-6">{selected.content}</div>
                  {canManage && <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => openEdit(selected)}><FilePenLine className="mr-2 h-4 w-4" />Edit</Button>{selected.status === "draft" && <Button onClick={() => void changeStatus(selected, "published")}><Send className="mr-2 h-4 w-4" />Publish</Button>}{selected.status !== "archived" && <Button variant="secondary" onClick={() => void changeStatus(selected, "archived")}><Archive className="mr-2 h-4 w-4" />Archive</Button>}<Button variant="destructive" onClick={() => void remove(selected)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button></div>}
                </div>
              ) : <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
