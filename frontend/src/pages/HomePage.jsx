import {
  Activity, AlertCircle, BarChart3, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clipboard, Download, FileCode, FileText, History, Home, Link2, Loader2, LogOut, Moon, MoreHorizontal, Search, Settings, Shield, Sparkles, Sun, Trash2, UploadCloud, User, UserPlus, Users, X
} from 'lucide-react';
import { DateFilter } from '../components/DateFilter';
import { DonutChart, StatCard, TrendChart } from '../components/charts';
import { formatMembershipStatus } from '../lib/helpers';

export function HomePage({ ctx }) {
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
            <h2 className={`text-2xl font-bold tracking-normal sm:text-3xl ${ui.text}`}>Không gian nghiên cứu</h2>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${ui.muted}`}>
              Thiết lập câu hỏi, thêm nguồn dữ liệu và đọc kết quả tổng hợp trong một giao diện tập trung.
            </p>
          </div>
          <button
            onClick={() => setPage('analytics')}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <BarChart3 className="h-4 w-4" />
            Xem biểu đồ
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <section className={`rounded-xl border p-5 shadow-sm ${ui.card}`}>
          <div className="mb-5">
            <h3 className={`text-base font-semibold ${ui.text}`}>Thiết lập nghiên cứu</h3>
            <p className={`mt-1 text-sm ${ui.muted}`}>Các trường quan trọng được gom lại để thao tác nhanh hơn.</p>
          </div>
          <label className={`mb-2 block text-sm font-medium ${ui.text}`}>Mục tiêu nghiên cứu</label>
          <textarea value={researchQuery} onChange={(e) => setResearchQuery(e.target.value)} placeholder="Nhập câu hỏi hoặc chủ đề bạn muốn phân tích..." className={`min-h-[132px] w-full resize-none rounded-lg border p-3 text-sm leading-6 outline-none transition focus:ring-4 ${ui.input}`} />

          <div className="my-5 grid grid-cols-1 gap-4">
            <div>
              <label className={`mb-2 flex items-center gap-2 text-sm font-medium ${ui.text}`}>
                <Link2 className="h-4 w-4 text-blue-500" />
                URL nguồn
              </label>
              <input type="url" value={webUrl} onChange={(e) => setWebUrl(e.target.value)} placeholder="https://example.com/article" className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-4 ${ui.input}`} />
            </div>

            <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition hover:border-blue-400 ${dragActive ? 'drag-active' : `${ui.softBorder} ${ui.soft}`}`}>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple />
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-lg text-blue-600 shadow-sm ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className={`text-sm font-semibold ${ui.text}`}>Kéo thả tệp hoặc click chọn</p>
              <p className={`mt-1 text-xs ${ui.muted}`}>PDF, DOCX, TXT, tối đa 50MB</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mb-5 space-y-2">
              {files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-sm ${ui.softBorder} ${ui.soft}`}>
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    <div className="min-w-0">
                      <p className={`truncate font-medium ${ui.text}`} title={file.name}>{file.name}</p>
                      <p className={`text-xs ${ui.muted}`}>{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600" title="Xóa tệp">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={triggerResearch} disabled={appState === 'processing' || (!researchQuery.trim() && files.length === 0 && !webUrl.trim())} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
            {appState === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{appState === 'processing' ? 'Đang xử lý' : 'Bắt đầu nghiên cứu'}</span>
          </button>
        </section>

        <section className={`flex min-h-[680px] flex-col rounded-xl border p-5 shadow-sm sm:p-6 ${ui.card}`}>
          <div className={`mb-5 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center ${ui.softBorder}`}>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h3 className={`text-base font-semibold ${ui.text}`}>Kết quả tổng hợp</h3>
            </div>
            <span className={`w-fit rounded-md border px-2.5 py-1 text-xs font-semibold ${ui.softBorder} ${ui.soft} ${ui.muted}`}>
              {appState === 'idle' ? 'Sẵn sàng' : appState === 'processing' ? 'Đang xử lý' : 'Hoàn tất'}
            </span>
          </div>

          {appState === 'idle' && (
            <div className={`flex flex-1 flex-col items-center justify-center rounded-xl p-8 text-center ${ui.soft}`}>
              <FileText className="mb-4 h-12 w-12 text-blue-500" />
              <h4 className={`text-lg font-semibold ${ui.text}`}>Sẵn sàng tạo báo cáo</h4>
              <p className={`mt-2 max-w-md text-sm leading-6 ${ui.muted}`}>Tập trung thao tác ở cột trái, báo cáo sẽ hiển thị tại đây.</p>
            </div>
          )}
          {appState === 'processing' && (
            <div className={`flex flex-1 flex-col items-center justify-center rounded-xl p-8 text-center ${ui.soft}`}>
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
              <h4 className={`text-lg font-semibold ${ui.text}`}>Hệ thống đang xử lý</h4>
              <p className={`mt-2 max-w-lg text-sm leading-6 ${ui.muted}`}>{progressPhase}</p>
            </div>
          )}
          {appState === 'done' && (
            <div className="flex flex-1 flex-col">
              <div className={`mb-4 flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center ${ui.softBorder} ${ui.soft}`}>
                <div className={`flex items-center gap-2 text-xs font-semibold ${ui.muted}`}>
                  <FileCode className="h-4 w-4 text-blue-500" />
                  REPORT_GENERATED.MD
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={copyToClipboard} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm transition ${ui.secondaryButton}`}>
                    <Clipboard className="h-4 w-4" />
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                  <button onClick={downloadReport} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md">
                    <Download className="h-4 w-4" />
                    <span>Tải file .MD</span>
                  </button>
                </div>
              </div>
              <div className="max-h-[620px] flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-950 p-5 font-mono text-sm leading-7 text-slate-100">
                {researchResult}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
