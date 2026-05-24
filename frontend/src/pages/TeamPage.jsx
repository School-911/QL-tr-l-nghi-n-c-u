import {
  Activity, AlertCircle, BarChart3, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clipboard, Download, FileCode, FileText, History, Home, Link2, Loader2, LogOut, Moon, MoreHorizontal, Search, Settings, Shield, Sparkles, Sun, Trash2, UploadCloud, User, UserPlus, Users, X
} from 'lucide-react';
import { DateFilter } from '../components/DateFilter';
import { DonutChart, StatCard, TrendChart } from '../components/charts';
import { formatMembershipStatus } from '../lib/helpers';

export function TeamPage({ ctx }) {
  const {
    ui, isDark, page, setPage, setTheme, notificationsOpen, setNotificationsOpen, unreadNotificationCount, notifications, userName, handleLogout, resetWorkspace,
    researchQuery, setResearchQuery, webUrl, setWebUrl, handleDrag, handleDrop, dragActive, fileInputRef, handleFileSelect, files, formatFileSize, removeFile, triggerResearch, appState, progressPhase, researchResult, copyToClipboard, copied, downloadReport,
    dashboardRange, setDashboardRange, dashboardStartDate, setDashboardStartDate, dashboardEndDate, setDashboardEndDate, dashboardStats, activityTrend, taskBreakdown,
    historyDatePreset, setHistoryDatePreset, historyStartDate, setHistoryStartDate, historyEndDate, setHistoryEndDate, historyError, historySearch, setHistorySearch, filteredHistory, historyLoading, paginatedHistory, openHistoryDetail, downloadOriginalFile, historyPage, totalHistoryPages, setHistoryPage, selectedHistory, historyDetailLoading, setSelectedHistory, setHistoryDetailLoading, formatDateTime,
    workspace, workspaceName, workspaceDescription, workspaceVisibility, teamError, settingsOpen, setSettingsOpen, inviteOpen, setInviteOpen, isPersonalWorkspace, personalWorkspaceId, switchWorkspace, setJoinMessage, workspaceMemberships, teamLoading, currentWorkspaceId, acceptWorkspaceInvite, members, changeMemberRole, removeMember, getWorkspaceJoinLink, copyWorkspaceJoinLink, rotateWorkspaceJoinLink, joinWorkspaceByLink, joinLinkInput, setJoinLinkInput, joinEmail, setJoinEmail, joinMessage, activities, saveWorkspaceSettings, setWorkspaceName, setWorkspaceDescription, setWorkspaceVisibility, handleInvite, inviteEmail, setInviteEmail, inviteRole, setInviteRole,
    loadWorkspaceData, loadNotificationsData, loadWorkspaceMemberships, notificationMessage, resolveNotification
  } = ctx;
  return (
<main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className={`mb-6 rounded-xl border p-5 shadow-sm sm:p-6 ${ui.card}`}>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className={`text-sm font-semibold ${ui.muted}`}>Workspace</p>
            <h2 className={`mt-1 text-2xl font-bold tracking-normal sm:text-3xl ${ui.text}`}>
              {workspace?.name || workspaceName}
            </h2>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${ui.muted}`}>
              {workspace?.description || workspaceDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isPersonalWorkspace && (
              <button
                onClick={() => {
                  switchWorkspace(personalWorkspaceId);
                  setJoinMessage('Đã chuyển về workspace cá nhân.');
                }}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition ${ui.secondaryButton}`}
              >
                <User className="h-4 w-4" />
                Workspace cá nhân
              </button>
            )}
            <button onClick={() => setSettingsOpen(true)} className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition ${ui.secondaryButton}`}>
              <Settings className="h-4 w-4" />
              Cài đặt nhóm
            </button>
            <button onClick={() => setInviteOpen(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              <UserPlus className="h-4 w-4" />
              Mời thành viên mới
            </button>
          </div>
        </div>
      </section>

      {teamError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {teamError}
        </div>
      )}

      <section className={`mb-6 rounded-xl border p-5 shadow-sm ${ui.card}`}>
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className={`font-semibold ${ui.text}`}>Workspace của tôi</h3>
            <p className={`mt-1 text-sm ${ui.muted}`}>Một tài khoản có thể tham gia nhiều nhóm và chuyển dữ liệu theo nhóm đang chọn.</p>
          </div>
          <button onClick={loadWorkspaceMemberships} className={`w-fit rounded-lg border px-3 py-2 text-sm font-semibold transition ${ui.secondaryButton}`}>
            Làm mới danh sách
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workspaceMemberships.map((entry) => {
            const entryWorkspace = entry.workspace || {};
            const entryMembership = entry.membership || {};
            const workspaceId = entryWorkspace.id || entryMembership.workspace_id;
            const isActive = workspaceId === currentWorkspaceId;
            const isPending = entryMembership.status === 'pending';
            const canAcceptInvite = isPending && entryWorkspace.visibility === 'private';
            return (
              <button
                key={workspaceId}
                onClick={() => {
                  if (canAcceptInvite) {
                    acceptWorkspaceInvite(workspaceId);
                    return;
                  }
                  if (!isPending) switchWorkspace(workspaceId);
                }}
                disabled={isPending && !canAcceptInvite}
                className={`rounded-xl border p-4 text-left transition ${
                  isActive
                    ? 'border-blue-400 bg-blue-50 text-blue-900 shadow-sm'
                    : `${ui.softBorder} ${ui.soft} ${ui.text} hover:border-blue-300`
                } ${isPending ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{entryWorkspace.name || 'Workspace nghiên cứu'}</p>
                    <p className={`mt-1 text-xs ${isActive ? 'text-blue-700' : ui.muted}`}>
                      {workspaceId === personalWorkspaceId ? 'Không gian cá nhân' : entryMembership.role || 'Thành viên'}
                    </p>
                  </div>
                  <span className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${isPending ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {canAcceptInvite ? 'Chấp nhận lời mời' : formatMembershipStatus(entryMembership.status)}
                  </span>
                </div>
              </button>
            );
          })}

          {!teamLoading && workspaceMemberships.length === 0 && (
            <div className={`rounded-xl border border-dashed p-5 text-sm ${ui.softBorder} ${ui.muted}`}>
              Chưa tìm thấy workspace nào cho tài khoản này.
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className={`overflow-hidden rounded-xl border shadow-sm ${ui.card}`}>
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className={`font-semibold ${ui.text}`}>Thông báo hoạt động nhóm</h3>
              <p className={`mt-1 text-sm ${ui.muted}`}>Thành viên cùng nhóm có thể xem nghiên cứu và tải file được chia sẻ từ hoạt động tại đây.</p>
            </div>
            <button onClick={() => loadWorkspaceData()} className={`flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${ui.secondaryButton}`}>
              <Bell className="h-4 w-4" />
              Làm mới
            </button>
          </div>

          <div className="divide-y divide-slate-200">
            {activities.map((activity) => (
              <article key={activity.id || activity._id} className="p-5 transition hover:bg-blue-50/40 dark:hover:bg-slate-800/50">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {activity.avatar || activity.actor_name?.slice(0, 2).toUpperCase() || 'SR'}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm leading-6 ${ui.text}`}>
                        <span className="font-semibold">{activity.memberName || activity.actor_name}</span> {activity.action || activity.message}
                      </p>
                      {(activity.source_name || activity.source_type) && (
                        <p className={`mt-1 flex items-center gap-2 text-sm ${ui.muted}`}>
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{activity.source_name || activity.source_type}</span>
                        </p>
                      )}
                      <p className={`mt-2 text-xs ${ui.muted}`}>
                        {activity.time || (activity.created_at ? formatDateTime(activity.created_at) : '')}
                      </p>
                    </div>
                  </div>

                  {activity.history_id && (
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <button onClick={() => openHistoryDetail(activity.history_id, { shared: true })} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                        <BookOpen className="h-4 w-4" />
                        Xem nghiên cứu
                      </button>
                      {activity.has_source_file && (
                        <button onClick={() => downloadOriginalFile(activity.history_id, { shared: true })} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${ui.secondaryButton}`}>
                          <Download className="h-4 w-4" />
                          Tải file
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
            {!teamLoading && activities.length === 0 && (
              <div className={`m-5 rounded-xl border border-dashed p-8 text-center text-sm ${ui.softBorder} ${ui.muted}`}>
                Chưa có thông báo hoạt động nhóm trong MongoDB.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className={`rounded-xl border p-5 shadow-sm ${ui.card}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className={`font-semibold ${ui.text}`}>Thành viên</h3>
                <p className={`mt-1 text-sm ${ui.muted}`}>{members.length} người trong workspace</p>
              </div>
              <Users className={`h-5 w-5 ${ui.muted}`} />
            </div>

            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id || member._id} className={`rounded-xl border p-3 ${ui.softBorder} ${ui.soft}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {member.avatar || member.name?.slice(0, 2).toUpperCase() || 'SR'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${ui.text}`}>{member.name || 'Thành viên'}</p>
                      <p className={`truncate text-xs ${ui.muted}`}>{member.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold ${ui.softBorder} ${ui.card} ${ui.text}`}>
                          <Shield className="h-3.5 w-3.5" />
                          {member.role}
                        </span>
                        <span className={`inline-flex whitespace-nowrap rounded-lg px-2 py-1 text-xs font-semibold ${['active', 'Đang hoạt động'].includes(member.status) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {member.status === 'active' ? 'Đang hoạt động' : member.status === 'pending' ? 'Đang chờ duyệt' : member.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      <button onClick={() => changeMemberRole(member.id || member._id)} className={`rounded-lg border p-2 transition ${ui.secondaryButton}`} title="Đổi quyền">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeMember(member.id || member._id)} className="rounded-lg border border-red-200 bg-white p-2 text-red-600 transition hover:bg-red-50" title="Xóa thành viên">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!teamLoading && members.length === 0 && (
                <div className={`rounded-xl border border-dashed p-5 text-center text-sm ${ui.softBorder} ${ui.muted}`}>
                  Chưa có thành viên nào trong MongoDB.
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-xl border p-5 shadow-sm ${ui.card}`}>
            <h3 className={`font-semibold ${ui.text}`}>Tham gia bằng link</h3>
            <p className={`mt-1 text-sm leading-6 ${ui.muted}`}>
              Công khai: vào ngay bằng link. Nội bộ: gửi yêu cầu duyệt. Riêng tư: chỉ tham gia bằng lời mời.
            </p>

            <div className={`mt-4 rounded-xl border p-3 ${ui.softBorder} ${ui.soft}`}>
              <p className={`text-xs font-semibold uppercase ${ui.muted}`}>Chế độ hiện tại</p>
              <p className={`mt-1 text-sm font-semibold ${ui.text}`}>
                {workspaceVisibility === 'public' ? 'Công khai' : workspaceVisibility === 'organization' ? 'Nội bộ tổ chức' : 'Riêng tư'}
              </p>
            </div>

            {workspaceVisibility !== 'private' && (
              <div className="mt-4 space-y-3">
                <input value={getWorkspaceJoinLink()} readOnly className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${ui.input}`} />
                <div className="flex flex-wrap gap-2">
                  <button onClick={copyWorkspaceJoinLink} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                    Sao chép link
                  </button>
                  <button onClick={rotateWorkspaceJoinLink} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${ui.secondaryButton}`}>
                    Tạo link mới
                  </button>
                </div>
              </div>
            )}

            {workspaceVisibility === 'private' && (
              <div className={`mt-4 rounded-xl border border-dashed p-4 text-sm ${ui.softBorder} ${ui.muted}`}>
                Nhóm riêng tư không hiển thị link tham gia. Thành viên chỉ có thể vào khi được mời.
              </div>
            )}

            <form onSubmit={joinWorkspaceByLink} className="mt-5 space-y-3">
              <input value={joinLinkInput} onChange={(e) => setJoinLinkInput(e.target.value)} placeholder="Dán link nhóm để tham gia..." className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-4 ${ui.input}`} />
              <input type="email" value={joinEmail} onChange={(e) => setJoinEmail(e.target.value)} placeholder="Email người tham gia" className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-4 ${ui.input}`} />
              <button type="submit" className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${ui.secondaryButton}`}>
                Tham gia / Gửi yêu cầu
              </button>
              {joinMessage && <p className={`text-sm leading-6 ${ui.muted}`}>{joinMessage}</p>}
            </form>
          </div>
        </section>
      </div>

      {(selectedHistory || historyDetailLoading) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
          <div className={`max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-xl border shadow-xl ${ui.card}`}>
            <div className={`flex items-start justify-between gap-3 border-b p-5 ${ui.softBorder}`}>
              <div>
                <h3 className={`text-lg font-semibold ${ui.text}`}>
                  {historyDetailLoading ? 'Đang tải nghiên cứu...' : selectedHistory?.title}
                </h3>
                {selectedHistory && (
                  <p className={`mt-1 text-sm ${ui.muted}`}>
                    {selectedHistory.source} • {formatDateTime(selectedHistory.createdAt)}
                  </p>
                )}
              </div>
              <button onClick={() => setSelectedHistory(null)} className={`rounded-lg border p-2 ${ui.secondaryButton}`}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[64vh] overflow-y-auto p-5">
              {historyDetailLoading && <div className={`text-sm ${ui.muted}`}>Đang lấy nội dung từ MongoDB...</div>}
              {selectedHistory && (
                <pre className={`whitespace-pre-wrap rounded-xl border p-4 text-sm leading-7 ${ui.softBorder} ${ui.soft} ${ui.text}`}>
                  {selectedHistory.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={saveWorkspaceSettings} className={`w-full max-w-lg rounded-xl border p-5 shadow-xl ${ui.card}`}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className={`text-lg font-semibold ${ui.text}`}>Cài đặt nhóm</h3>
                <p className={`mt-1 text-sm ${ui.muted}`}>Cập nhật thông tin, mô tả và quyền hiển thị workspace.</p>
              </div>
              <button type="button" onClick={() => setSettingsOpen(false)} className={`rounded-lg border p-2 ${ui.secondaryButton}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className={`mb-2 block text-sm font-medium ${ui.text}`}>Tên nhóm</label>
            <input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className={`mb-4 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-4 ${ui.input}`} />
            <label className={`mb-2 block text-sm font-medium ${ui.text}`}>Mô tả</label>
            <textarea value={workspaceDescription} onChange={(e) => setWorkspaceDescription(e.target.value)} className={`mb-4 min-h-[96px] w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-4 ${ui.input}`} />
            <label className={`mb-2 block text-sm font-medium ${ui.text}`}>Quyền hiển thị</label>
            <select value={workspaceVisibility} onChange={(e) => setWorkspaceVisibility(e.target.value)} className={`mb-5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-4 ${ui.input}`}>
              <option value="private">Riêng tư</option>
              <option value="organization">Nội bộ tổ chức</option>
              <option value="public">Công khai</option>
            </select>
            <div className={`mb-5 rounded-xl border p-3 text-sm leading-6 ${ui.softBorder} ${ui.soft} ${ui.muted}`}>
              {workspaceVisibility === 'public' && 'Công khai: hệ thống hiển thị link nhóm, người có link sẽ tham gia ngay.'}
              {workspaceVisibility === 'organization' && 'Nội bộ: người có link gửi yêu cầu tham gia, quản trị viên duyệt trong trang Thông báo.'}
              {workspaceVisibility === 'private' && 'Riêng tư: không hiển thị link tham gia, người dùng chỉ vào được khi nhận lời mời.'}
            </div>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              <Settings className="h-4 w-4" />
              Lưu cài đặt
            </button>
          </form>
        </div>
      )}

      {inviteOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={handleInvite} className={`w-full max-w-md rounded-xl border p-5 shadow-xl ${ui.card}`}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className={`text-lg font-semibold ${ui.text}`}>Mời thành viên mới</h3>
                <p className={`mt-1 text-sm ${ui.muted}`}>Nhập email và chọn vai trò trong workspace.</p>
              </div>
              <button type="button" onClick={() => setInviteOpen(false)} className={`rounded-lg border p-2 ${ui.secondaryButton}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className={`mb-2 block text-sm font-medium ${ui.text}`}>Email</label>
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="member@school.edu.vn" className={`mb-4 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-4 ${ui.input}`} required />
            <label className={`mb-2 block text-sm font-medium ${ui.text}`}>Vai trò</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className={`mb-5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-4 ${ui.input}`}>
              <option>Thành viên</option>
              <option>Quản trị viên</option>
              <option>Chủ sở hữu</option>
            </select>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              <UserPlus className="h-4 w-4" />
              Gửi lời mời
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
