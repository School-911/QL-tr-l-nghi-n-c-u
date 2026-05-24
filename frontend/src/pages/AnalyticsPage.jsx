import {
  Activity, AlertCircle, BarChart3, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clipboard, Download, FileCode, FileText, History, Home, Link2, Loader2, LogOut, Moon, MoreHorizontal, Search, Settings, Shield, Sparkles, Sun, Trash2, UploadCloud, User, UserPlus, Users, X
} from 'lucide-react';
import { DateFilter } from '../components/DateFilter';
import { DonutChart, StatCard, TrendChart } from '../components/charts';
import { formatMembershipStatus } from '../lib/helpers';

export function AnalyticsPage({ ctx }) {
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
            <h2 className={`text-2xl font-bold tracking-normal sm:text-3xl ${ui.text}`}>Biểu đồ & thống kê</h2>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${ui.muted}`}>
              Theo dõi hiệu suất nghiên cứu, tần suất thao tác và tỷ lệ loại tác vụ theo khoảng thời gian.
            </p>
          </div>
          <DateFilter preset={dashboardRange} setPreset={setDashboardRange} startDate={dashboardStartDate} setStartDate={setDashboardStartDate} endDate={dashboardEndDate} setEndDate={setDashboardEndDate} ui={ui} />
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} label="Tổng số tác vụ" value={dashboardStats.total} tone="bg-blue-50 text-blue-700" ui={ui} />
        <StatCard icon={CheckCircle2} label="Tỷ lệ thành công" value={`${dashboardStats.successRate}%`} tone="bg-emerald-50 text-emerald-700" ui={ui} />
        <StatCard icon={AlertCircle} label="Lỗi trong ngày" value={dashboardStats.failedToday} tone="bg-red-50 text-red-700" ui={ui} />
        <StatCard icon={Users} label="Thành viên hoạt động" value={dashboardStats.activeMembers} tone="bg-indigo-50 text-indigo-700" ui={ui} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <TrendChart data={activityTrend} ui={ui} />
        <DonutChart data={taskBreakdown} ui={ui} isDark={isDark} />
      </section>
    </main>
  );
}
