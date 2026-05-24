import {
  Activity, AlertCircle, BarChart3, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clipboard, Download, FileCode, FileText, History, Home, Link2, Loader2, LogOut, Moon, MoreHorizontal, Search, Settings, Shield, Sparkles, Sun, Trash2, UploadCloud, User, UserPlus, Users, X
} from 'lucide-react';
import { DateFilter } from '../components/DateFilter';
import { DonutChart, StatCard, TrendChart } from '../components/charts';
import { formatMembershipStatus } from '../lib/helpers';

export function AppHeader({ ctx }) {
  const {
    ui, isDark, page, setPage, setTheme, notificationsOpen, setNotificationsOpen, unreadNotificationCount, notifications, userName, handleLogout, resetWorkspace,
    researchQuery, setResearchQuery, webUrl, setWebUrl, handleDrag, handleDrop, dragActive, fileInputRef, handleFileSelect, files, formatFileSize, removeFile, triggerResearch, appState, progressPhase, researchResult, copyToClipboard, copied, downloadReport,
    dashboardRange, setDashboardRange, dashboardStartDate, setDashboardStartDate, dashboardEndDate, setDashboardEndDate, dashboardStats, activityTrend, taskBreakdown,
    historyDatePreset, setHistoryDatePreset, historyStartDate, setHistoryStartDate, historyEndDate, setHistoryEndDate, historyError, historySearch, setHistorySearch, filteredHistory, historyLoading, paginatedHistory, openHistoryDetail, downloadOriginalFile, historyPage, totalHistoryPages, setHistoryPage, selectedHistory, historyDetailLoading, setSelectedHistory, setHistoryDetailLoading, formatDateTime,
    workspace, workspaceName, workspaceDescription, workspaceVisibility, teamError, settingsOpen, setSettingsOpen, inviteOpen, setInviteOpen, isPersonalWorkspace, personalWorkspaceId, switchWorkspace, setJoinMessage, workspaceMemberships, teamLoading, currentWorkspaceId, acceptWorkspaceInvite, members, changeMemberRole, removeMember, getWorkspaceJoinLink, copyWorkspaceJoinLink, rotateWorkspaceJoinLink, joinWorkspaceByLink, joinLinkInput, setJoinLinkInput, joinEmail, setJoinEmail, joinMessage, activities, saveWorkspaceSettings, setWorkspaceName, setWorkspaceDescription, setWorkspaceVisibility, handleInvite, inviteEmail, setInviteEmail, inviteRole, setInviteRole,
    loadWorkspaceData, loadNotificationsData, notificationMessage, resolveNotification
  } = ctx;
  return (
<header className={`sticky top-0 z-50 border-b backdrop-blur ${ui.header}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button onClick={resetWorkspace} className="flex min-w-0 items-center gap-3 text-left">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className={`truncate text-base font-bold sm:text-lg ${ui.text}`}>School Research</h1>
            <p className={`text-xs font-medium ${ui.muted}`}>Trợ lý nghiên cứu AI</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <nav className={`hidden items-center rounded-xl border p-1 lg:flex ${ui.softBorder} ${ui.soft}`}>
            {[
              ['home', Home, 'Trang chủ'],
              ['analytics', BarChart3, 'Biểu đồ'],
              ['history', History, 'Lịch sử'],
              ['team', Users, 'Quản lý nhóm'],
              ['notifications', Bell, 'Thông báo']
            ].map(([value, Icon, label]) => (
              <button key={value} onClick={() => setPage(value)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${page === value ? ui.activeNav : ui.inactiveNav}`}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          <select value={page} onChange={(e) => setPage(e.target.value)} className={`rounded-lg border px-3 py-2 text-sm font-semibold outline-none lg:hidden ${ui.input}`}>
            <option value="home">Trang chủ</option>
            <option value="analytics">Biểu đồ</option>
            <option value="history">Lịch sử</option>
            <option value="team">Quản lý nhóm</option>
            <option value="notifications">Thông báo</option>
          </select>

          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(false);
                setPage('notifications');
              }}
              className={`relative rounded-lg border p-2.5 shadow-sm transition ${ui.secondaryButton}`}
              title="Thông báo"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className={`absolute right-0 top-12 z-[80] w-[320px] rounded-xl border p-3 shadow-xl ${ui.card}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className={`text-sm font-semibold ${ui.text}`}>Thông báo</h3>
                  <span className={`text-xs ${ui.muted}`}>{unreadNotificationCount} chưa đọc</span>
                </div>
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <div key={item.id || item._id} className={`rounded-lg border p-3 ${ui.softBorder} ${ui.soft}`}>
                        <p className={`text-sm font-medium leading-5 ${ui.text}`}>{item.title || item.type || 'Thông báo'}</p>
                        <p className={`mt-1 text-xs leading-5 ${ui.muted}`}>{item.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className={`rounded-lg border border-dashed p-4 text-center text-sm ${ui.softBorder} ${ui.muted}`}>
                      Chưa có thông báo mới.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`rounded-lg border p-2.5 shadow-sm transition ${ui.secondaryButton}`} title={isDark ? 'Chuyển sang màu sáng' : 'Chuyển sang màu tối'}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className={`hidden rounded-lg border px-3 py-2 text-sm font-medium sm:block ${ui.softBorder} ${ui.soft} ${ui.muted}`}>
            {userName || 'Người dùng'}
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm transition ${ui.secondaryButton}`} title="Đăng xuất">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
