import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, Shield, Sparkles, User } from 'lucide-react';
import { passwordRules } from '../lib/constants';

export function AuthScreen({
  authView,
  setAuthView,
  authError,
  setAuthError,
  authSuccess,
  setAuthSuccess,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  resetEmail,
  setResetEmail,
  resetCode,
  setResetCode,
  resetPasswordValue,
  setResetPasswordValue,
  resetStep,
  setResetStep,
  handleLogin,
  handleRegister,
  handleForgotPassword,
  handleResetPassword,
  checkBackendConnection,
  backendApi
}) {
  const title = {
    login: 'Đăng nhập hệ thống',
    register: 'Đăng ký tài khoản mới',
    forgot: resetStep === 'email' ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'
  }[authView];

  const submitLabel = {
    login: 'Đăng nhập ngay',
    register: 'Đăng ký tài khoản',
    forgot: resetStep === 'email' ? 'Gửi mã xác nhận' : 'Cập nhật mật khẩu'
  }[authView];

  const handleSubmit = authView === 'login'
    ? handleLogin
    : authView === 'register'
      ? handleRegister
      : resetStep === 'email'
        ? handleForgotPassword
        : handleResetPassword;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070c14] p-6 text-slate-100">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-normal">School Research</h1>
          <p className="mt-1 text-xs text-slate-400">Trợ lý nghiên cứu và tổng hợp kiến thức AI</p>
        </div>
        <section className="relative rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-6 text-lg font-bold text-slate-100">{title}</h2>
          {authError && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}
          {authSuccess && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authView === 'register' && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nhập họ và tên" className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition focus:border-blue-500/80" required />
                </div>
              </div>
            )}

            {authView !== 'forgot' && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition focus:border-blue-500/80" required />
                </div>
              </div>
            )}

            {authView === 'forgot' && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Gmail / Email tài khoản</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="name@gmail.com" className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition focus:border-blue-500/80" required />
                </div>
              </div>
            )}

            {authView === 'forgot' && resetStep === 'code' && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Mã xác nhận</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input inputMode="numeric" maxLength="6" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Nhập mã 6 số" className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition focus:border-blue-500/80" required />
                </div>
              </div>
            )}

            {authView !== 'forgot' && (
              <PasswordField value={password} onChange={setPassword} showRules={authView === 'register'} />
            )}

            {authView === 'forgot' && resetStep === 'code' && (
              <PasswordField label="Mật khẩu mới" value={resetPasswordValue} onChange={setResetPasswordValue} showRules />
            )}

            <button type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition duration-300 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]">
              <span>{submitLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-white/5 pt-6 text-center text-xs text-slate-500">
            <button
              type="button"
              onClick={checkBackendConnection}
              className="mb-4 rounded-lg border border-slate-700 px-3 py-2 font-semibold text-slate-300 transition hover:border-blue-500/60 hover:text-blue-300"
            >
              Kiểm tra kết nối API
            </button>
            <p className="mb-4 break-all text-[11px] text-slate-600">
              Backend: {backendApi}
            </p>
            {authView === 'login' ? (
              <div className="space-y-3">
                <button onClick={() => { setAuthView('forgot'); setAuthError(''); setAuthSuccess(''); setResetEmail(email); }} className="font-semibold text-blue-400 transition hover:text-blue-300">
                  Quên mật khẩu?
                </button>
                <p>
                  Chưa có tài khoản?{' '}
                  <button onClick={() => { setAuthView('register'); setAuthError(''); setAuthSuccess(''); }} className="font-semibold text-blue-400 transition hover:text-blue-300">
                    Đăng ký miễn phí
                  </button>
                </p>
              </div>
            ) : authView === 'register' ? (
              <p>
                Đã có tài khoản?{' '}
                <button onClick={() => { setAuthView('login'); setAuthError(''); setAuthSuccess(''); }} className="font-semibold text-blue-400 transition hover:text-blue-300">
                  Đăng nhập tại đây
                </button>
              </p>
            ) : (
              <p>
                Nhớ mật khẩu rồi?{' '}
                <button onClick={() => { setAuthView('login'); setAuthError(''); setAuthSuccess(''); setResetStep('email'); }} className="font-semibold text-blue-400 transition hover:text-blue-300">
                  Quay lại đăng nhập
                </button>
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function PasswordField({ label = 'Mật khẩu', value, onChange, showRules = false }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>
      <div className="relative">
        <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
        <input type="password" value={value} onChange={(e) => onChange(e.target.value)} placeholder={label === 'Mật khẩu' ? 'Nhập mật khẩu' : 'Nhập mật khẩu mới'} className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition focus:border-blue-500/80" required />
      </div>
      {showRules && (
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          {passwordRules.map(([key, ruleLabel, test]) => {
            const passed = test(value);
            return (
              <div key={key} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${passed ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 bg-slate-950/40 text-slate-500'}`}>
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{ruleLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
