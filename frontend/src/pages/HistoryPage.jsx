import {
  Activity, AlertCircle, BarChart3, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clipboard, Download, FileCode, FileText, History, Home, Link2, Loader2, LogOut, Moon, MoreHorizontal, Search, Settings, Shield, Sparkles, Sun, Trash2, UploadCloud, User, UserPlus, Users, X
} from 'lucide-react';
import { DateFilter } from '../components/DateFilter';
import { DonutChart, StatCard, TrendChart } from '../components/charts';
import { formatMembershipStatus } from '../lib/helpers';

export function HistoryPage({ ctx }) {
  const {
    ui, isDark, page, setPage, setTheme, notificationsOpen, setNotificationsOpen, unreadNotificationCount, notifications, userName, handleLogout, resetWorkspace,
    researchQuery, setResearchQuery, webUrl, setWebUrl, handleDrag, handleDrop, dragActive, fileInputRef, handleFileSelect, files, formatFileSize, removeFile, triggerResearch, appState, progressPhase, researchResult, copyToClipboard, copied, downloadReport,
    dashboardRange, setDashboardRange, dashboardStartDate, setDashboardStartDate, dashboardEndDate, setDashboardEndDate, dashboardStats, activityTrend, taskBreakdown,
    historyDatePreset, setHistoryDatePreset, historyStartDate, setHistoryStartDate, historyEndDate, setHistoryEndDate, historyError, historySearch, setHistorySearch, filteredHistory, historyLoading, paginatedHistory, openHistoryDetail, downloadOriginalFile, historyPage, totalHistoryPages, setHistoryPage, selectedHistory, historyDetailLoading, setSelectedHistory, setHistoryDetailLoading, formatDateTime,
    workspace, workspaceName, workspaceDescription, workspaceVisibility, teamError, settingsOpen, setSettingsOpen, inviteOpen, setInviteOpen, isPersonalWorkspace, personalWorkspaceId, switchWorkspace, setJoinMessage, workspaceMemberships, teamLoading, currentWorkspaceId, acceptWorkspaceInvite, members, changeMemberRole, removeMember, getWorkspaceJoinLink, copyWorkspaceJoinLink, rotateWorkspaceJoinLink, joinWorkspaceByLink, joinLinkInput, setJoinLinkInput, joinEmail, setJoinEmail, joinMessage, activities, saveWorkspaceSettings, setWorkspaceName, setWorkspaceDescription, setWorkspaceVisibility, handleInvite, inviteEmail, setInviteEmail, inviteRole, setInviteRole,
    loadWorkspaceData, loadNotificationsData, notificationMessage, resolveNotification
  } = ctx;
  return (
<main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className={`mb-6 rounded-xl border p-5 shadow-sm sm:p-6 ${ui.card}`}>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className={`text-2xl font-bold tracking-normal sm:text-3xl ${ui.text}`}>Lịch sử nghiên cứu</h2>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${ui.muted}`}>Tìm kiếm, lọc theo thời gian và duyệt từng trang lịch sử.</p>
          </div>
          <DateFilter preset={historyDatePreset} setPreset={setHistoryDatePreset} startDate={historyStartDate} setStartDate={setHistoryStartDate} endDate={historyEndDate} setEndDate={setHistoryEndDate} ui={ui} />
        </div>
      </section>

      <section className={`rounded-xl border p-5 shadow-sm sm:p-6 ${ui.card}`}>
        {historyError && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {historyError}
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value.replace(/\D/g, ''))}
              placeholder="Nhập số ID, ngày, tháng, năm..."
              className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition focus:ring-4 ${ui.input}`}
            />
          </div>
          <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${ui.softBorder} ${ui.soft} ${ui.muted}`}>
            <CalendarDays className="h-4 w-4" />
            {filteredHistory.length} kết quả
          </div>
        </div>

        {historyLoading ? (
          <div className={`rounded-xl border border-dashed p-10 text-center ${ui.softBorder} ${ui.soft}`}>
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-500" />
            <p className={`text-sm ${ui.muted}`}>Đang tải lịch sử từ MongoDB...</p>
          </div>
        ) : paginatedHistory.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedHistory.map((item) => (
              <article key={item.id} className={`rounded-xl border p-4 transition hover:-translate-y-0.5 hover:border-blue-300 ${ui.softBorder} ${ui.soft}`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${ui.softBorder} ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-white text-slate-600'}`}>{item.id}</span>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{item.status}</span>
                </div>
                <h3 className={`text-sm font-semibold leading-6 ${ui.text}`}>{item.title}</h3>
                <p className={`mt-2 line-clamp-2 text-sm leading-6 ${ui.muted}`}>{item.preview || item.query}</p>
                <div className={`mt-4 border-t pt-3 text-xs ${ui.softBorder} ${ui.muted}`}>
                  <p className="truncate">{item.source}</p>
                  <p className="mt-1">{formatDateTime(item.createdAt)}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => openHistoryDetail(item.id)} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${ui.secondaryButton}`}>
                    Xem chi tiết
                  </button>
                  {item.hasSourceFile && (
                    <button onClick={() => downloadOriginalFile(item.id)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                      <Download className="h-4 w-4" />
                      Tải file gốc
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={`rounded-xl border border-dashed p-10 text-center ${ui.softBorder} ${ui.soft}`}>
            <Search className={`mx-auto mb-3 h-8 w-8 ${ui.muted}`} />
            <h3 className={`font-semibold ${ui.text}`}>Không tìm thấy lịch sử phù hợp</h3>
            <p className={`mt-1 text-sm ${ui.muted}`}>Thử nhập số ID hoặc chọn ngày tháng bằng bộ lọc lịch.</p>
          </div>
        )}

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row">
          <p className={`text-sm ${ui.muted}`}>
            Trang {historyPage}/{totalHistoryPages}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))} disabled={historyPage === 1} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${ui.secondaryButton}`}>
              <ChevronLeft className="h-4 w-4" />
              Trước
            </button>
            <button onClick={() => setHistoryPage((prev) => Math.min(totalHistoryPages, prev + 1))} disabled={historyPage === totalHistoryPages} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${ui.secondaryButton}`}>
              Sau
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {(selectedHistory || historyDetailLoading) && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
          <section className={`flex max-h-[86vh] w-full max-w-4xl flex-col rounded-xl border p-5 shadow-xl ${ui.card}`}>
            <div className={`mb-4 flex items-start justify-between gap-3 border-b pb-4 ${ui.softBorder}`}>
              <div>
                <h3 className={`text-lg font-semibold ${ui.text}`}>
                  {historyDetailLoading ? 'Đang tải nội dung...' : selectedHistory?.title}
                </h3>
                {selectedHistory && (
                  <p className={`mt-1 text-sm ${ui.muted}`}>
                    {selectedHistory.aiProvider || 'unknown'} · {selectedHistory.createdAt ? formatDateTime(selectedHistory.createdAt) : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedHistory?.hasSourceFile && (
                  <button onClick={() => downloadOriginalFile(selectedHistory.id)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                    <Download className="h-4 w-4" />
                    Tải file gốc
                  </button>
                )}
                <button onClick={() => { setSelectedHistory(null); setHistoryDetailLoading(false); }} className={`rounded-lg border p-2 ${ui.secondaryButton}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {historyDetailLoading ? (
              <div className={`rounded-xl border border-dashed p-10 text-center ${ui.softBorder} ${ui.soft}`}>
                <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-500" />
                <p className={`text-sm ${ui.muted}`}>Đang lấy nội dung đã phân tích từ MongoDB...</p>
              </div>
            ) : (
              <div className="overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-950 p-5 font-mono text-sm leading-7 text-slate-100">
                {selectedHistory?.content || 'Không có nội dung chi tiết.'}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
