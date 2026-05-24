import {
  Activity, AlertCircle, BarChart3, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clipboard, Download, FileCode, FileText, History, Home, Link2, Loader2, LogOut, Moon, MoreHorizontal, Search, Settings, Shield, Sparkles, Sun, Trash2, UploadCloud, User, UserPlus, Users, X
} from 'lucide-react';
import { DateFilter } from '../components/DateFilter';
import { DonutChart, StatCard, TrendChart } from '../components/charts';
import { formatMembershipStatus } from '../lib/helpers';

export function NotificationsPage({ ctx }) {
  const {
    ui, isDark, page, setPage, setTheme, notificationsOpen, setNotificationsOpen, unreadNotificationCount, notifications, userName, handleLogout, resetWorkspace,
    researchQuery, setResearchQuery, webUrl, setWebUrl, handleDrag, handleDrop, dragActive, fileInputRef, handleFileSelect, files, formatFileSize, removeFile, triggerResearch, appState, progressPhase, researchResult, copyToClipboard, copied, downloadReport,
    dashboardRange, setDashboardRange, dashboardStartDate, setDashboardStartDate, dashboardEndDate, setDashboardEndDate, dashboardStats, activityTrend, taskBreakdown,
    historyDatePreset, setHistoryDatePreset, historyStartDate, setHistoryStartDate, historyEndDate, setHistoryEndDate, historyError, historySearch, setHistorySearch, filteredHistory, historyLoading, paginatedHistory, openHistoryDetail, downloadOriginalFile, historyPage, totalHistoryPages, setHistoryPage, selectedHistory, historyDetailLoading, setSelectedHistory, setHistoryDetailLoading, formatDateTime,
    workspace, workspaceName, workspaceDescription, workspaceVisibility, teamError, settingsOpen, setSettingsOpen, inviteOpen, setInviteOpen, isPersonalWorkspace, personalWorkspaceId, switchWorkspace, setJoinMessage, workspaceMemberships, teamLoading, currentWorkspaceId, acceptWorkspaceInvite, members, changeMemberRole, removeMember, getWorkspaceJoinLink, copyWorkspaceJoinLink, rotateWorkspaceJoinLink, joinWorkspaceByLink, joinLinkInput, setJoinLinkInput, joinEmail, setJoinEmail, joinMessage, activities, saveWorkspaceSettings, setWorkspaceName, setWorkspaceDescription, setWorkspaceVisibility, handleInvite, inviteEmail, setInviteEmail, inviteRole, setInviteRole,
    loadWorkspaceData, loadNotificationsData, notificationMessage, resolveNotification
  } = ctx;
const invites = notifications.filter((item) => ['invite', 'join_request'].includes(item.type) && !item.resolved);
    const systemNotifications = notifications.filter((item) => !['invite', 'join_request'].includes(item.type) || item.resolved);

    return (
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className={`mb-6 rounded-xl border p-5 shadow-sm sm:p-6 ${ui.card}`}>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className={`text-2xl font-bold tracking-normal sm:text-3xl ${ui.text}`}>Trung tâm thông báo</h2>
              <p className={`mt-2 max-w-3xl text-sm leading-6 ${ui.muted}`}>
                Lời mời sẽ được giữ lại cho đến khi bạn xử lý. Thông báo hệ thống, thành công và lỗi sẽ tự dọn sau 7 ngày.
              </p>
            </div>
            <button
              onClick={() => Promise.all([loadWorkspaceData(), loadNotificationsData()])}
              className={`w-fit rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition ${ui.secondaryButton}`}
            >
              Làm mới
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className={`rounded-xl border p-5 shadow-sm ${ui.card}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className={`font-semibold ${ui.text}`}>Lời mời cần xử lý</h3>
                <p className={`mt-1 text-sm ${ui.muted}`}>{invites.length} lời mời/yêu cầu đang chờ</p>
              </div>
              <UserPlus className="h-5 w-5 text-blue-500" />
            </div>

            <div className="space-y-3">
              {invites.length > 0 ? (
                invites.map((item) => (
                  <article key={item.id || item._id} className={`rounded-xl border p-4 ${ui.softBorder} ${ui.soft}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className={`text-sm font-semibold ${ui.text}`}>{item.title || 'Lời mời'}</h4>
                        <p className={`mt-1 text-sm leading-6 ${ui.muted}`}>{item.message}</p>
                        <p className={`mt-2 text-xs ${ui.muted}`}>{item.created_at ? formatDateTime(item.created_at) : ''}</p>
                      </div>
                      <span className="whitespace-nowrap rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {item.type === 'join_request' ? 'Yêu cầu' : 'Invite'}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => resolveNotification(item.id || item._id, 'accepted')} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                        Chấp nhận
                      </button>
                      <button onClick={() => resolveNotification(item.id || item._id, 'declined')} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${ui.secondaryButton}`}>
                        Từ chối
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className={`rounded-xl border border-dashed p-8 text-center text-sm ${ui.softBorder} ${ui.muted}`}>
                  Không có lời mời nào đang chờ.
                </div>
              )}
            </div>
          </section>

          <section className={`rounded-xl border p-5 shadow-sm ${ui.card}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className={`font-semibold ${ui.text}`}>Thông báo hệ thống</h3>
                <p className={`mt-1 text-sm ${ui.muted}`}>{systemNotifications.length} thông báo gần đây</p>
              </div>
            </div>
            {notificationMessage && <p className={`mb-4 text-sm ${ui.muted}`}>{notificationMessage}</p>}

            <div className="space-y-3">
              {systemNotifications.length > 0 ? (
                systemNotifications.map((item) => (
                  <article key={item.id || item._id} className={`rounded-xl border p-4 ${ui.softBorder} ${ui.soft}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className={`text-sm font-semibold ${ui.text}`}>{item.title || item.type || 'Thông báo'}</h4>
                        <p className={`mt-1 text-sm leading-6 ${ui.muted}`}>{item.message}</p>
                        <p className={`mt-2 text-xs ${ui.muted}`}>{item.created_at ? formatDateTime(item.created_at) : ''}</p>
                      </div>
                      <span className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        item.type === 'error' ? 'bg-red-50 text-red-700' : item.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.type || 'system'}
                      </span>
                    </div>
                    {!item.read && (
                      <button onClick={() => resolveNotification(item.id || item._id, 'read')} className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold transition ${ui.secondaryButton}`}>
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </article>
                ))
              ) : (
                <div className={`rounded-xl border border-dashed p-8 text-center text-sm ${ui.softBorder} ${ui.muted}`}>
                  Chưa có thông báo hệ thống.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    );
}
