import { MemoBuilderAPI, TicketAPi } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingComponent from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateMemo from "@/pages/memo/CreateMemo";
import {
  Calendar,
  CheckCircle2,
  Eye,
  FileCheck2,
  FilePlus2,
  FileText,
  Filter,
  PenLine,
  Loader2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formattedDate } from "../../API/helper";

export interface Memo {
  _id: string;
  subject: string;
  file: string;
  description: string;
  createdAt: string;
  acknowledgedby: {
    userId: string | undefined;
    _id: string;
    name: string;
  }[];
}

interface PublishedBuilderMemo {
  _id: string;
  title: string;
  subject: string;
  content: string;
  status: "published";
  createdAt: string;
  publishedAt: string | null;
  createdBy?: {
    name?: string;
    email?: string;
  };
  acknowledgedBy?: MemoAcknowledgement[];
}

interface MemoAcknowledgement {
  userId: string;
  name: string;
  email?: string;
  acknowledgedAt: string;
}

interface UnsignedEmployee {
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface AcknowledgementReport {
  signed: MemoAcknowledgement[];
  unsigned: UnsignedEmployee[];
  summary: {
    signed: number;
    unsigned: number;
    total: number;
  };
}

export interface User {
  _id: string;
  name: string;
  isAdmin: boolean;
  role: string;
  email: string;
}

interface SummaryCardProps {
  label: string;
  value: number;
  highlight?: boolean;
  onClick?: () => void;
}

interface DocumentAction {
  title: string;
  description: string;
  buttonLabel: string;
  route: string;
  icon: React.ElementType;
  allowed: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  highlight,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      group w-full rounded-2xl border p-5 text-left
      backdrop-blur-md transition-all duration-300
      hover:-translate-y-1 hover:shadow-xl
      ${
        highlight
          ? "border-yellow-300 bg-yellow-50/80 shadow-md"
          : "border-gray-200 bg-white/80 shadow-sm"
      }
    `}
  >
    <p className="text-sm text-gray-500">{label}</p>

    <p className="mt-1 text-2xl font-bold text-gray-900 group-hover:text-[#5602FF]">
      {value}
    </p>
  </button>
);

function ViewMemo() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [publishedMemos, setPublishedMemos] = useState<PublishedBuilderMemo[]>(
    [],
  );
  const [filteredMemos, setFilteredMemos] = useState<
    Array<Memo | PublishedBuilderMemo>
  >([]);
  const [selectedPublishedMemo, setSelectedPublishedMemo] =
    useState<PublishedBuilderMemo | null>(null);
  const [acknowledgementReport, setAcknowledgementReport] =
    useState<AcknowledgementReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const itemsPerPage = 8;
  const navigate = useNavigate();
  const { toast } = useToast();

  const userString = localStorage.getItem("user");

  const user: User | null = userString ? JSON.parse(userString) : null;

  const fetchMemos = async () => {
    try {
      const [legacyResult, builderResult] = await Promise.allSettled([
        TicketAPi.getAllMemos(),
        MemoBuilderAPI.list({ status: "published", page: 1, limit: 100 }),
      ]);

      if (legacyResult.status === "fulfilled") {
        setMemos(legacyResult.value.data);
      } else {
        console.error("Failed to fetch legacy memoranda:", legacyResult.reason);
      }

      if (builderResult.status === "fulfilled") {
        setPublishedMemos(builderResult.value.data.data);
      } else {
        console.error(
          "Failed to fetch published builder memos:",
          builderResult.reason,
        );
      }
    } catch (error) {
      console.error("Failed to fetch memoranda:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  useEffect(() => {
    let data: Array<Memo | PublishedBuilderMemo> = [
      ...publishedMemos,
      ...memos,
    ].sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    );

    if (showPendingOnly) {
      data = [
        ...publishedMemos.filter(
          (memo) =>
            !memo.acknowledgedBy?.some((ack) => ack.userId === user?._id),
        ),
        ...memos.filter(
          (memo) =>
            !memo.acknowledgedby.some((ack) => ack.userId === user?._id),
        ),
      ];
    }

    setFilteredMemos(data);
    setCurrentPage(1);
  }, [showPendingOnly, memos, publishedMemos, user?._id]);

  const isPublishedBuilderMemo = (
    memo: Memo | PublishedBuilderMemo,
  ): memo is PublishedBuilderMemo => "content" in memo;

  const isAcknowledged = (memo: Memo) =>
    memo.acknowledgedby.some((ack) => ack.userId === user?._id);

  const isBuilderAcknowledged = (memo: PublishedBuilderMemo) =>
    Boolean(memo.acknowledgedBy?.some((ack) => ack.userId === user?._id));

  const acknowledgedCount =
    memos.filter(isAcknowledged).length +
    publishedMemos.filter(isBuilderAcknowledged).length;

  const pendingCount =
    memos.filter((memo) => !isAcknowledged(memo)).length +
    publishedMemos.filter((memo) => !isBuilderAcknowledged(memo)).length;

  const openPublishedMemo = async (memo: PublishedBuilderMemo) => {
    setSelectedPublishedMemo(memo);
    setAcknowledgementReport(null);
    setReportError(null);

    if (!user?.isAdmin) return;

    setReportLoading(true);
    try {
      const response = await MemoBuilderAPI.getAcknowledgements(memo._id);
      setAcknowledgementReport(response.data);
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unable to load acknowledgement details.";
      setReportError(message);
    } finally {
      setReportLoading(false);
    }
  };

  const acknowledgePublishedMemo = async () => {
    if (!selectedPublishedMemo || !user) return;
    setSigning(true);
    try {
      const response = await MemoBuilderAPI.acknowledge(
        selectedPublishedMemo._id,
      );
      const acknowledgedBy: MemoAcknowledgement[] =
        response.data.acknowledgedBy;
      const updatedMemo = { ...selectedPublishedMemo, acknowledgedBy };
      setSelectedPublishedMemo(updatedMemo);
      setPublishedMemos((current) =>
        current.map((memo) =>
          memo._id === updatedMemo._id ? updatedMemo : memo,
        ),
      );
      toast({
        title: "Memo signed",
        description: "Your acknowledgement has been recorded.",
      });
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unable to sign the memo.";
      toast({
        title: "Unable to sign memo",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSigning(false);
    }
  };

  const totalPages = Math.ceil(filteredMemos.length / itemsPerPage);

  const paginatedMemos = filteredMemos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const documentActions: DocumentAction[] = [
    {
      title: "Draft Documents",
      description:
        "View and manage internal draft documents and acknowledgement forms.",
      buttonLabel: "Open Drafts",
      route: "/tea",
      icon: FileText,
      allowed: Boolean(user?.isAdmin),
    },
    {
      title: "Team Lead Expectations",
      description: "RMEMO_UNAUTHORIZED HANDLING OF IT AND NETWORK EQUIPMENT",
      buttonLabel: "Open Form",
      route: "/lea",
      icon: FileCheck2,
      allowed: Boolean(user?.isAdmin),
    },
    {
      title: "IT Equipment Memo",
      description: "MEMO_UNAUTHORIZED HANDLING OF IT AND NETWORK EQUIPMENT",
      buttonLabel: "Open Memo",
      route: "/itmemo",
      icon: PenLine,
      allowed: Boolean(user),
    },
  ];

  const visibleDocumentActions = documentActions.filter(
    (action) => action.allowed,
  );

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* PAGE HEADER */}

        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <BackButton />

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Company Memoranda
              </h1>

              <p className="text-sm text-gray-500">
                Controlled internal communications and acknowledgement records
              </p>
            </div>
          </div>

          {user?.isAdmin && (
            <CreateMemo setMemos={setMemos} setLoading={setLoading} />
          )}
        </div>

        {/* SUMMARY CARDS */}

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <SummaryCard
            label="Total Memoranda"
            value={memos.length + publishedMemos.length}
            onClick={() => setShowPendingOnly(false)}
          />

          <SummaryCard
            label="Acknowledged"
            value={acknowledgedCount}
            onClick={() => setShowPendingOnly(false)}
          />

          <SummaryCard
            label="Pending"
            value={pendingCount}
            highlight
            onClick={() => setShowPendingOnly(true)}
          />
        </div>

        {/* DOCUMENTS AND FORMS TABLE */}

        {visibleDocumentActions.length > 0 && (
          <section className="mb-10 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-4 border-b bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FilePlus2 className="h-5 w-5 text-[#5602FF]" />

                  <h2 className="font-semibold text-gray-900">
                    Documents and Forms
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Access available acknowledgement forms and internal documents
                </p>
              </div>
            </div>

            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[180px] text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {visibleDocumentActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <TableRow
                      key={action.title}
                      className="transition hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#5602FF]">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {action.title}
                            </p>

                            <p className="text-xs text-gray-500">
                              Internal document
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xl text-sm leading-6 text-gray-600">
                        {action.description}
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          type="button"
                          size="sm"
                          className="min-w-[120px] bg-[#5602FF] hover:bg-[#4700d4]"
                          onClick={() => navigate(action.route)}
                        >
                          {action.buttonLabel}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </section>
        )}

        {/* MEMORANDA TABLE */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur">
          {/* ACTIVE FILTER */}

          {showPendingOnly && (
            <div className="flex flex-col gap-3 border-b border-yellow-200 bg-yellow-50 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <Filter className="h-4 w-4" />
                Pending acknowledgement filter active
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPendingOnly(false)}
                className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
              >
                Clear Filter
              </Button>
            </div>
          )}

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-4 border-b bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Memoranda List</h2>

              <p className="text-sm text-gray-500">
                View company memoranda and acknowledgement status
              </p>
            </div>

            <p className="text-sm text-gray-500">
              Showing {paginatedMemos.length} of {filteredMemos.length}
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gray-50">
                <TableRow>
                  <TableHead className="min-w-[160px]">Date</TableHead>
                  <TableHead className="min-w-[280px]">Subject</TableHead>
                  <TableHead className="min-w-[130px]">Status</TableHead>
                  <TableHead className="w-[140px] text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedMemos.map((memo) => (
                  <TableRow
                    key={memo._id}
                    className="transition hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 shrink-0" />

                        <span>{formattedDate(memo.createdAt)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium text-gray-900">
                      {memo.subject}
                    </TableCell>

                    <TableCell>
                      {isPublishedBuilderMemo(memo) ? (
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            isBuilderAcknowledged(memo)
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {isBuilderAcknowledged(memo)
                            ? "Acknowledged"
                            : "Pending"}
                        </span>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            isAcknowledged(memo)
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {isAcknowledged(memo) ? "Acknowledged" : "Pending"}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => {
                          if (isPublishedBuilderMemo(memo)) {
                            void openPublishedMemo(memo);
                          } else {
                            navigate(`/memo/${memo._id}`);
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {filteredMemos.length > itemsPerPage && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="flex flex-col items-center justify-center gap-3 py-4 sm:flex-row">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((page) => page - 1)}
                        >
                          Previous
                        </Button>

                        <span className="px-4 text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((page) => page + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>

          {/* EMPTY STATE */}

          {filteredMemos.length === 0 && (
            <div className="px-6 py-16 text-center text-gray-500">
              <FileText className="mx-auto mb-4 h-10 w-10 text-gray-300" />

              <p className="font-medium text-gray-700">
                {showPendingOnly
                  ? "No pending memoranda"
                  : "No memoranda available"}
              </p>

              <p className="mt-1 text-sm">
                {showPendingOnly
                  ? "You have acknowledged all available memoranda."
                  : "New memoranda will appear here once created."}
              </p>
            </div>
          )}
        </section>

        <Dialog
          open={Boolean(selectedPublishedMemo)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPublishedMemo(null);
              setAcknowledgementReport(null);
              setReportError(null);
            }
          }}
        >
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            {selectedPublishedMemo && (
              <>
                <DialogHeader className="space-y-3 border-b pb-5 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      Published
                    </span>
                    <span className="text-xs text-gray-500">
                      {formattedDate(
                        selectedPublishedMemo.publishedAt ||
                          selectedPublishedMemo.createdAt,
                      )}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl leading-tight text-gray-900">
                    {selectedPublishedMemo.title}
                  </DialogTitle>
                  <DialogDescription className="text-base font-medium text-gray-700">
                    {selectedPublishedMemo.subject}
                  </DialogDescription>
                </DialogHeader>

                <article className="space-y-6 py-2">
                  <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50/70 p-5 text-sm leading-7 text-gray-800">
                    {selectedPublishedMemo.content}
                  </div>

                  {selectedPublishedMemo.createdBy?.name && (
                    <p className="text-sm text-gray-500">
                      Published by{" "}
                      <span className="font-medium text-gray-700">
                        {selectedPublishedMemo.createdBy.name}
                      </span>
                    </p>
                  )}

                  {!user?.isAdmin && (
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {isBuilderAcknowledged(selectedPublishedMemo)
                            ? "Memo acknowledged"
                            : "Acknowledgement required"}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {isBuilderAcknowledged(selectedPublishedMemo)
                            ? "Your signature has been recorded."
                            : "Confirm that you have read and understood this memo."}
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => void acknowledgePublishedMemo()}
                        disabled={
                          signing ||
                          isBuilderAcknowledged(selectedPublishedMemo)
                        }
                        className="shrink-0 bg-[#5602FF] hover:bg-[#4700d4]"
                      >
                        {signing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        {isBuilderAcknowledged(selectedPublishedMemo)
                          ? "Signed"
                          : "Sign memo"}
                      </Button>
                    </div>
                  )}

                  {user?.isAdmin && (
                    <section className="space-y-4 border-t pt-5">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#5602FF]" />
                        <h3 className="font-semibold text-gray-900">
                          Employee acknowledgements
                        </h3>
                      </div>

                      {reportLoading ? (
                        <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading acknowledgement report…
                        </div>
                      ) : reportError ? (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                          {reportError}
                        </p>
                      ) : acknowledgementReport ? (
                        <>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-gray-100 p-3 text-center">
                              <p className="text-xl font-bold text-gray-900">
                                {acknowledgementReport.summary.total}
                              </p>
                              <p className="text-xs text-gray-500">Employees</p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-3 text-center">
                              <p className="text-xl font-bold text-green-700">
                                {acknowledgementReport.summary.signed}
                              </p>
                              <p className="text-xs text-green-600">Signed</p>
                            </div>
                            <div className="rounded-lg bg-yellow-50 p-3 text-center">
                              <p className="text-xl font-bold text-yellow-700">
                                {acknowledgementReport.summary.unsigned}
                              </p>
                              <p className="text-xs text-yellow-600">
                                Not signed
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="overflow-hidden rounded-lg border">
                              <div className="border-b bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
                                Signed ({acknowledgementReport.summary.signed})
                              </div>
                              <div className="max-h-52 divide-y overflow-y-auto">
                                {acknowledgementReport.signed.length ? (
                                  acknowledgementReport.signed.map((entry) => (
                                    <div key={entry.userId} className="px-4 py-3">
                                      <p className="text-sm font-medium text-gray-900">
                                        {entry.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formattedDate(entry.acknowledgedAt)}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="px-4 py-5 text-sm text-gray-500">
                                    No signatures yet.
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border">
                              <div className="border-b bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-800">
                                Not signed ({acknowledgementReport.summary.unsigned})
                              </div>
                              <div className="max-h-52 divide-y overflow-y-auto">
                                {acknowledgementReport.unsigned.length ? (
                                  acknowledgementReport.unsigned.map((entry) => (
                                    <div key={entry.userId} className="px-4 py-3">
                                      <p className="text-sm font-medium text-gray-900">
                                        {entry.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {entry.email}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="px-4 py-5 text-sm text-gray-500">
                                    Everyone has signed.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </section>
                  )}
                </article>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}

export default ViewMemo;
