import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AI_CORE_API, BACKEND_API, HISTORY_PAGE_SIZE, THEME_STORAGE_KEY } from './lib/constants';
import { getPersonalWorkspaceId, getRangeDates, getSavedTheme, isStrongPassword, isWithinRange, startOfDay } from './lib/helpers';
import { AuthScreen } from './components/AuthScreen';
import { AppHeader } from './components/AppHeader';
import { HomePage } from './pages/HomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HistoryPage } from './pages/HistoryPage';
import { TeamPage } from './pages/TeamPage';
import { NotificationsPage } from './pages/NotificationsPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(localStorage.getItem('activeWorkspaceId') || '');
  const [authView, setAuthView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetStep, setResetStep] = useState('email');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [page, setPage] = useState('home');
  const [theme, setTheme] = useState(getSavedTheme);
  const [files, setFiles] = useState([]);
  const [webUrl, setWebUrl] = useState('');
  const [researchQuery, setResearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [appState, setAppState] = useState('idle');
  const [progressPhase, setProgressPhase] = useState('');
  const [researchResult, setResearchResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [debouncedHistorySearch, setDebouncedHistorySearch] = useState('');
  const [historyDatePreset, setHistoryDatePreset] = useState('all');
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false);

  const [dashboardRange, setDashboardRange] = useState('7d');
  const [dashboardStartDate, setDashboardStartDate] = useState('');
  const [dashboardEndDate, setDashboardEndDate] = useState('');

  const [workspace, setWorkspace] = useState(null);
  const [workspaceMemberships, setWorkspaceMemberships] = useState([]);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Thành viên');
  const [workspaceName, setWorkspaceName] = useState('Nhóm nghiên cứu School Research');
  const [workspaceDescription, setWorkspaceDescription] = useState('Không gian cộng tác nghiên cứu của nhóm.');
  const [workspaceVisibility, setWorkspaceVisibility] = useState('private');
  const [joinLinkInput, setJoinLinkInput] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  const isDark = theme === 'dark';
  const personalWorkspaceId = getPersonalWorkspaceId(userId, userEmail);
  const currentWorkspaceId = activeWorkspaceId || personalWorkspaceId;
  const isPersonalWorkspace = currentWorkspaceId === personalWorkspaceId;
  const unreadNotificationCount = notifications.filter((item) => {
    if (['invite', 'join_request'].includes(item.type)) return !item.resolved;
    return !item.read;
  }).length;

  const ui = {
    page: isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900',
    header: isDark ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white/90',
    card: isDark ? 'border-slate-800 bg-slate-900 shadow-black/10' : 'border-slate-200 bg-white shadow-slate-200/60',
    soft: isDark ? 'bg-slate-800/70' : 'bg-slate-50',
    softBorder: isDark ? 'border-slate-800' : 'border-slate-200',
    text: isDark ? 'text-slate-100' : 'text-slate-950',
    muted: isDark ? 'text-slate-400' : 'text-slate-500',
    input: isDark
      ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:ring-blue-500/20'
      : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-100',
    secondaryButton: isDark
      ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-500/40 hover:bg-slate-800'
      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50',
    activeNav: isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-700',
    inactiveNav: isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUserName = localStorage.getItem('userName');
    const savedUserId = localStorage.getItem('userId');
    const savedUserEmail = localStorage.getItem('userEmail');
    const savedWorkspaceId = localStorage.getItem('activeWorkspaceId');
    if (savedToken) setToken(savedToken);
    if (savedUserName) setUserName(savedUserName);
    if (savedUserId) setUserId(savedUserId);
    if (savedUserEmail) setUserEmail(savedUserEmail);
    if (savedWorkspaceId) setActiveWorkspaceId(savedWorkspaceId);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const apiRequest = async (path, options = {}) => {
    const response = await fetch(`${AI_CORE_API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Không thể kết nối dữ liệu MongoDB.');
    }

    return data;
  };

  const backendRequest = async (path, options = {}) => {
    const url = `${BACKEND_API}${path}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.detail || `Backend trả về HTTP ${response.status}.`);
      }

      return data;
    } catch (error) {
      console.error('[School Research] Backend request failed', {
        url,
        backendApi: BACKEND_API,
        online: navigator.onLine,
        error
      });

      if (error instanceof TypeError) {
        throw new Error(
          `Không thể kết nối Backend (${BACKEND_API}). ` +
          'Hãy kiểm tra VITE_BACKEND_API_URL trên Vercel phải là URL Render dạng https://..., backend Render đang bật, và đã Redeploy frontend sau khi đổi biến môi trường.'
        );
      }

      throw error;
    }
  };

  const checkBackendConnection = async () => {
    setAuthError('');
    setAuthSuccess('');

    try {
      const data = await backendRequest('/api/health', {
        method: 'GET'
      });
      setAuthSuccess(`Kết nối Backend thành công: ${data.message || BACKEND_API}`);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const loadWorkspaceData = async (workspaceId = currentWorkspaceId) => {
    setTeamLoading(true);
    setTeamError('');

    try {
      const data = await apiRequest(`/workspaces/${workspaceId}/overview`);
      const nextWorkspace = data.workspace || null;
      setWorkspace(nextWorkspace);
      setMembers(data.members || []);
      setActivities(data.activities || []);
      setNotifications(data.notifications || []);
      setWorkspaceName(nextWorkspace?.name || 'Nhóm nghiên cứu School Research');
      setWorkspaceDescription(nextWorkspace?.description || 'Không gian cộng tác nghiên cứu của nhóm.');
      setWorkspaceVisibility(nextWorkspace?.visibility || 'private');
    } catch (error) {
      setTeamError(error.message);
      setWorkspace(null);
      setMembers([]);
      setActivities([]);
      setNotifications([]);
    } finally {
      setTeamLoading(false);
    }
  };

  const loadResearchHistory = async (workspaceId = currentWorkspaceId) => {
    setHistoryLoading(true);
    setHistoryError('');

    try {
      const params = new URLSearchParams({
        limit: '200',
        workspace_id: workspaceId
      });
      if (userId) params.set('user_id', userId);
      const data = await apiRequest(`/research/history?${params.toString()}`);
      setHistoryItems(data.items || []);
    } catch (error) {
      setHistoryError(error.message);
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadNotificationsData = async (workspaceId = currentWorkspaceId) => {
    setNotificationMessage('');

    try {
      const data = await apiRequest(`/workspaces/${workspaceId}/notifications`);
      setNotifications(data.items || []);
      setNotificationMessage('Đã làm mới thông báo.');
    } catch (error) {
      setNotificationMessage(error.message);
    }
  };

  const loadWorkspaceMemberships = async () => {
    if (!userEmail && !userId) return;

    try {
      const params = new URLSearchParams();
      if (userEmail) params.set('email', userEmail);
      if (userId) params.set('user_id', userId);
      const data = await apiRequest(`/workspaces?${params.toString()}`);
      setWorkspaceMemberships(data.items || []);
    } catch (error) {
      setTeamError(error.message);
      setWorkspaceMemberships([]);
    }
  };

  useEffect(() => {
    if (token) {
      loadWorkspaceData();
      loadResearchHistory();
      loadWorkspaceMemberships();
    }
  }, [token, currentWorkspaceId, userEmail, userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHistorySearch(historySearch.replace(/\D/g, ''));
    }, 250);
    return () => clearTimeout(timer);
  }, [historySearch]);

  useEffect(() => {
    if (userEmail && !joinEmail) setJoinEmail(userEmail);
  }, [userEmail, joinEmail]);

  useEffect(() => {
    setHistoryPage(1);
  }, [debouncedHistorySearch, historyDatePreset, historyStartDate, historyEndDate]);

  const historyRange = useMemo(
    () => getRangeDates(historyDatePreset, historyStartDate, historyEndDate),
    [historyDatePreset, historyStartDate, historyEndDate]
  );

  const filteredHistory = useMemo(() => {
    return historyItems.filter((item) => {
      const numericSearchText = [
        item.id,
        item.createdAt,
        item.executionTime,
        item.responseLength,
        item.originalFileName,
        item.source
      ]
        .join(' ')
        .replace(/\D/g, '');

      const matchesSearch = debouncedHistorySearch ? numericSearchText.includes(debouncedHistorySearch) : true;
      return matchesSearch && isWithinRange(item.createdAt, historyRange);
    });
  }, [debouncedHistorySearch, historyItems, historyRange]);

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PAGE_SIZE;
    return filteredHistory.slice(start, start + HISTORY_PAGE_SIZE);
  }, [filteredHistory, historyPage]);

  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE));

  const dashboardRangeDates = useMemo(
    () => getRangeDates(dashboardRange, dashboardStartDate, dashboardEndDate),
    [dashboardRange, dashboardStartDate, dashboardEndDate]
  );

  const dashboardItems = useMemo(
    () => historyItems.filter((item) => isWithinRange(item.createdAt, dashboardRangeDates)),
    [dashboardRangeDates, historyItems]
  );

  const dashboardStats = useMemo(() => {
    const total = dashboardItems.length;
    const success = dashboardItems.filter((item) => item.status === 'success').length;
    const failedToday = historyItems.filter((item) => item.status === 'failed' && isWithinRange(item.createdAt, getRangeDates('today'))).length;
    return {
      total,
      successRate: total ? Math.round((success / total) * 100) : 0,
      failedToday,
      activeMembers: members.filter((member) => ['active', 'Đang hoạt động'].includes(member.status)).length
    };
  }, [dashboardItems, historyItems, members]);

  const activityTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = startOfDay(new Date());
      date.setDate(date.getDate() - (6 - index));
      return {
        label: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date),
        dateKey: date.toISOString().slice(0, 10),
        value: 0
      };
    });

    dashboardItems.forEach((item) => {
      const createdAt = new Date(item.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      const key = createdAt.toISOString().slice(0, 10);
      const day = days.find((entry) => entry.dateKey === key);
      if (day) day.value += 1;
    });

    return days;
  }, [dashboardItems]);

  const taskBreakdown = useMemo(() => {
    const counts = {
      'Tài liệu': dashboardItems.filter((item) => ['pdf', 'docx', 'txt', 'md', 'csv', 'file'].includes(item.sourceType)).length,
      'URL': dashboardItems.filter((item) => item.sourceType === 'url').length,
      'Truy vấn': dashboardItems.filter((item) => !['pdf', 'docx', 'txt', 'md', 'csv', 'file', 'url'].includes(item.sourceType)).length
    };
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({ label, value }));
  }, [dashboardItems]);

  const resetWorkspace = () => {
    setPage('home');
    setFiles([]);
    setWebUrl('');
    setResearchQuery('');
    setResearchResult('');
    setCopied(false);
    setProgressPhase('');
    setAppState('idle');
  };

  const switchWorkspace = (workspaceId) => {
    if (!workspaceId || workspaceId === currentWorkspaceId) return;
    localStorage.setItem('activeWorkspaceId', workspaceId);
    setActiveWorkspaceId(workspaceId);
    setSelectedHistory(null);
    setHistorySearch('');
    setNotificationMessage('');
  };

  const acceptWorkspaceInvite = (workspaceId) => {
    if (!workspaceId || !userEmail) return;

    apiRequest(`/workspaces/${workspaceId}/invites/accept`, {
      method: 'POST',
      body: JSON.stringify({
        email: userEmail,
        actor_name: userName || userEmail
      })
    })
      .then((data) => {
        const joinedWorkspaceId = data.workspace?.id || workspaceId;
        localStorage.setItem('activeWorkspaceId', joinedWorkspaceId);
        setActiveWorkspaceId(joinedWorkspaceId);
        setPage('team');
        setJoinMessage(data.message || 'Đã tham gia nhóm.');
        return Promise.all([loadWorkspaceData(joinedWorkspaceId), loadResearchHistory(joinedWorkspaceId), loadWorkspaceMemberships()]);
      })
      .catch((error) => setTeamError(error.message));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (!email || !password) {
      setAuthError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }
    try {
      const data = await backendRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.fullName);
      localStorage.setItem('userId', data.user.id);
      const nextWorkspaceId = getPersonalWorkspaceId(data.user.id, data.user.email);
      localStorage.setItem('activeWorkspaceId', nextWorkspaceId);
      setToken(data.token);
      setUserName(data.user.fullName);
      setUserEmail(data.user.email);
      setUserId(data.user.id);
      setActiveWorkspaceId(nextWorkspaceId);
      setAuthSuccess('Đăng nhập thành công!');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (!fullName || !email || !password) {
      setAuthError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!isStrongPassword(password)) {
      setAuthError('Mật khẩu phải có ít nhất 6 ký tự, 1 chữ viết hoa, 1 số và 1 ký tự đặc biệt.');
      return;
    }
    try {
      const data = await backendRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password })
      });
      setAuthSuccess('Đăng ký thành công! Hãy đăng nhập.');
      setAuthView('login');
      setPassword('');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!resetEmail.trim()) {
      setAuthError('Vui lòng nhập email để nhận mã xác nhận.');
      return;
    }

    try {
      const data = await backendRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail.trim() })
      });
      setAuthSuccess(data.message || 'Mã xác nhận đã được gửi tới email.');
      setResetStep('code');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!resetEmail.trim() || !resetCode.trim() || !resetPasswordValue) {
      setAuthError('Vui lòng nhập email, mã xác nhận và mật khẩu mới.');
      return;
    }

    if (!isStrongPassword(resetPasswordValue)) {
      setAuthError('Mật khẩu mới phải có ít nhất 6 ký tự, 1 chữ viết hoa, 1 số và 1 ký tự đặc biệt.');
      return;
    }

    try {
      const data = await backendRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: resetEmail.trim(),
          code: resetCode.trim(),
          password: resetPasswordValue
        })
      });
      setAuthSuccess(data.message || 'Mật khẩu đã được cập nhật.');
      setAuthView('login');
      setEmail(resetEmail.trim());
      setPassword('');
      setResetCode('');
      setResetPasswordValue('');
      setResetStep('email');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('activeWorkspaceId');
    setToken('');
    setUserName('');
    setUserEmail('');
    setUserId('');
    setActiveWorkspaceId('');
    setHistoryItems([]);
    setNotifications([]);
    setWorkspaceMemberships([]);
    setMembers([]);
    setActivities([]);
    setWorkspace(null);
    resetWorkspace();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
      return;
    }
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDateTime = (value) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  };

  const addHistoryActivity = async ({ historyId, sourceType, sourceName, hasSourceFile } = {}) => {
    try {
      await apiRequest(`/workspaces/${currentWorkspaceId}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          actor_name: userName || 'Người dùng',
          type: 'report_created',
          message: sourceName
            ? `đã tạo một báo cáo nghiên cứu từ "${sourceName}"`
            : 'đã tạo một báo cáo nghiên cứu mới',
          history_id: historyId || null,
          source_type: sourceType || null,
          source_name: sourceName || null,
          has_source_file: Boolean(hasSourceFile)
        })
      });
      await Promise.all([loadWorkspaceData(), loadResearchHistory()]);
    } catch (error) {
      setTeamError(error.message);
    }
  };

  const triggerResearch = async () => {
    if (!researchQuery.trim() && files.length === 0 && !webUrl.trim()) {
      alert('Vui lòng chọn tệp tin, dán đường link web hoặc nhập mục tiêu nghiên cứu để bắt đầu.');
      return;
    }
    setAppState('processing');
    setProgressPhase('Đang gửi dữ liệu phân tích tới hệ thống AI...');
    setResearchResult('');
    setCopied(false);
    try {
      const formData = new FormData();
      formData.append('researchQuery', researchQuery);
      formData.append('webUrl', webUrl);
      formData.append('workspaceId', currentWorkspaceId);
      files.forEach((file) => formData.append('file', file));
      setProgressPhase('AI đang phân tích tài liệu và tổng hợp báo cáo...');
      const response = await fetch(`${BACKEND_API}/api/research/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error?.detail || 'Hệ thống xử lý AI đang bận hoặc xảy ra lỗi cấu hình.');
      }
      if (data.status !== 'success') throw new Error(data.message || 'AI xử lý thất bại');
      setResearchResult(data.markdownReport);
      await addHistoryActivity({
        historyId: data.history_id,
        sourceType: data.source_type,
        sourceName: data.source_name || files[0]?.name || webUrl.trim() || 'Nguồn nghiên cứu',
        hasSourceFile: data.has_source_file
      });
      setProgressPhase('Hoàn tất phân tích');
      setAppState('done');
    } catch (error) {
      console.error(error);
      alert(`Lỗi xử lý hệ thống: ${error.message}`);
      setProgressPhase('Quá trình tổng hợp thất bại.');
      setAppState('idle');
    }
  };

  const copyToClipboard = () => {
    if (!researchResult) return;
    navigator.clipboard.writeText(researchResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    if (!researchResult) return;
    const element = document.createElement('a');
    const file = new Blob([researchResult], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `School_Research_Report_${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadOriginalFile = (historyId, options = {}) => {
    const params = new URLSearchParams({
      workspace_id: currentWorkspaceId
    });
    if (!options.shared && userId) params.set('user_id', userId);
    window.open(`${AI_CORE_API}/research/history/${historyId}/source-file?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    apiRequest(`/workspaces/${currentWorkspaceId}/invites`, {
      method: 'POST',
      body: JSON.stringify({
        email: inviteEmail.trim(),
        role: inviteRole,
        actor_name: userName || 'Người dùng'
      })
    })
      .then(() => Promise.all([loadWorkspaceData(), loadWorkspaceMemberships()]))
      .then(() => {
        setInviteEmail('');
        setInviteRole('Thành viên');
        setInviteOpen(false);
        setNotificationsOpen(true);
      })
      .catch((error) => setTeamError(error.message));
  };

  const changeMemberRole = (memberId) => {
    const roles = ['Thành viên', 'Quản trị viên', 'Chủ sở hữu'];
    const member = members.find((item) => (item.id || item._id) === memberId);
    const nextRole = roles[(roles.indexOf(member?.role) + 1) % roles.length];

    apiRequest(`/workspaces/${currentWorkspaceId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: nextRole })
    })
      .then(() => Promise.all([loadWorkspaceData(), loadWorkspaceMemberships()]))
      .catch((error) => setTeamError(error.message));
  };

  const removeMember = (memberId) => {
    apiRequest(`/workspaces/${currentWorkspaceId}/members/${memberId}`, {
      method: 'DELETE'
    })
      .then(() => Promise.all([loadWorkspaceData(), loadWorkspaceMemberships()]))
      .catch((error) => setTeamError(error.message));
  };

  const saveWorkspaceSettings = (e) => {
    e.preventDefault();
    apiRequest(`/workspaces/${currentWorkspaceId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: workspaceName,
        description: workspaceDescription,
        visibility: workspaceVisibility
      })
    })
      .then(() => Promise.all([loadWorkspaceData(), loadWorkspaceMemberships()]))
      .then(() => setSettingsOpen(false))
      .catch((error) => setTeamError(error.message));
  };

  const resolveNotification = (notificationId, action) => {
    apiRequest(`/workspaces/${currentWorkspaceId}/notifications/${notificationId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
      .then(() => Promise.all([loadWorkspaceData(), loadNotificationsData(), loadWorkspaceMemberships()]))
      .catch((error) => setTeamError(error.message));
  };

  const openHistoryDetail = (historyId, options = {}) => {
    setHistoryDetailLoading(true);
    setSelectedHistory(null);

    const params = new URLSearchParams({
      workspace_id: currentWorkspaceId
    });
    if (!options.shared && userId) params.set('user_id', userId);

    apiRequest(`/research/history/${historyId}?${params.toString()}`)
      .then((data) => setSelectedHistory(data.item || null))
      .catch((error) => setHistoryError(error.message))
      .finally(() => setHistoryDetailLoading(false));
  };

  const getWorkspaceJoinLink = () => {
    const tokenValue = workspace?.join_token;
    if (!tokenValue) return '';
    return `${window.location.origin}/join/${tokenValue}`;
  };

  const copyWorkspaceJoinLink = () => {
    const link = getWorkspaceJoinLink();
    if (!link) return;
    navigator.clipboard.writeText(link);
    setJoinMessage('Đã sao chép link nhóm.');
  };

  const rotateWorkspaceJoinLink = () => {
    apiRequest(`/workspaces/${currentWorkspaceId}/rotate-link`, {
      method: 'POST'
    })
      .then(() => Promise.all([loadWorkspaceData(), loadWorkspaceMemberships()]))
      .then(() => setJoinMessage('Đã tạo link nhóm mới.'))
      .catch((error) => setTeamError(error.message));
  };

  const joinWorkspaceByLink = (e) => {
    e.preventDefault();
    setJoinMessage('');

    const tokenValue = joinLinkInput.trim().split('/').filter(Boolean).pop();

    if (!tokenValue || !joinEmail.trim()) {
      setJoinMessage('Vui lòng nhập link nhóm và email.');
      return;
    }

    apiRequest(`/workspaces/join/${tokenValue}`, {
      method: 'POST',
      body: JSON.stringify({
        email: joinEmail.trim(),
        actor_name: userName || 'Người dùng'
      })
    })
      .then((data) => {
        setJoinMessage(data.message || 'Đã gửi yêu cầu tham gia.');
        const joinedWorkspaceId = data.workspace?.id;
        if (data.status === 'joined' && joinedWorkspaceId) {
          localStorage.setItem('activeWorkspaceId', joinedWorkspaceId);
          setActiveWorkspaceId(joinedWorkspaceId);
          setPage('team');
          return Promise.all([loadWorkspaceData(joinedWorkspaceId), loadResearchHistory(joinedWorkspaceId), loadWorkspaceMemberships()]);
        }
        return Promise.all([loadWorkspaceData(), loadWorkspaceMemberships()]);
      })
      .catch((error) => setJoinMessage(error.message));
  };

  if (!token) {
    return (
      <AuthScreen
        authView={authView}
        setAuthView={setAuthView}
        authError={authError}
        setAuthError={setAuthError}
        authSuccess={authSuccess}
        setAuthSuccess={setAuthSuccess}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullName={fullName}
        setFullName={setFullName}
        resetEmail={resetEmail}
        setResetEmail={setResetEmail}
        resetCode={resetCode}
        setResetCode={setResetCode}
        resetPasswordValue={resetPasswordValue}
        setResetPasswordValue={setResetPasswordValue}
        resetStep={resetStep}
        setResetStep={setResetStep}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleForgotPassword={handleForgotPassword}
        handleResetPassword={handleResetPassword}
        checkBackendConnection={checkBackendConnection}
        backendApi={BACKEND_API}
      />
    );
  }
  const pageContext = {
    ui, isDark, page, setPage, setTheme, notificationsOpen, setNotificationsOpen, unreadNotificationCount, notifications, userName, handleLogout, resetWorkspace,
    researchQuery, setResearchQuery, webUrl, setWebUrl, handleDrag, handleDrop, dragActive, fileInputRef, handleFileSelect, files, formatFileSize, removeFile, triggerResearch, appState, progressPhase, researchResult, copyToClipboard, copied, downloadReport,
    dashboardRange, setDashboardRange, dashboardStartDate, setDashboardStartDate, dashboardEndDate, setDashboardEndDate, dashboardStats, activityTrend, taskBreakdown,
    historyDatePreset, setHistoryDatePreset, historyStartDate, setHistoryStartDate, historyEndDate, setHistoryEndDate, historyError, historySearch, setHistorySearch, filteredHistory, historyLoading, paginatedHistory, openHistoryDetail, downloadOriginalFile, historyPage, totalHistoryPages, setHistoryPage, selectedHistory, historyDetailLoading, setSelectedHistory, setHistoryDetailLoading, formatDateTime,
    workspace, workspaceName, workspaceDescription, workspaceVisibility, teamError, settingsOpen, setSettingsOpen, inviteOpen, setInviteOpen, isPersonalWorkspace, personalWorkspaceId, switchWorkspace, setJoinMessage, workspaceMemberships, teamLoading, currentWorkspaceId, acceptWorkspaceInvite, members, changeMemberRole, removeMember, getWorkspaceJoinLink, copyWorkspaceJoinLink, rotateWorkspaceJoinLink, joinWorkspaceByLink, joinLinkInput, setJoinLinkInput, joinEmail, setJoinEmail, joinMessage, activities, saveWorkspaceSettings, setWorkspaceName, setWorkspaceDescription, setWorkspaceVisibility, handleInvite, inviteEmail, setInviteEmail, inviteRole, setInviteRole,
    loadWorkspaceData, loadNotificationsData, loadWorkspaceMemberships, notificationMessage, resolveNotification
  };

  return (
    <div className={`min-h-screen transition-colors ${ui.page}`}>
      <AppHeader ctx={pageContext} />
      {page === 'analytics' && <AnalyticsPage ctx={pageContext} />}
      {page === 'history' && <HistoryPage ctx={pageContext} />}
      {page === 'team' && <TeamPage ctx={pageContext} />}
      {page === 'notifications' && <NotificationsPage ctx={pageContext} />}
      {page === 'home' && <HomePage ctx={pageContext} />}
    </div>
  );
}

export default App;
