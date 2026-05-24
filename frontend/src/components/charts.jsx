import { PieChart } from 'lucide-react';

export function StatCard({ icon: Icon, label, value, tone, ui }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 ${ui.card}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={`text-sm font-medium ${ui.muted}`}>{label}</p>
          <p className={`mt-2 text-3xl font-bold ${ui.text}`}>{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function TrendChart({ data, ui }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${ui.card}`}>
      <div className="mb-5">
        <h3 className={`font-semibold ${ui.text}`}>Xu hướng hoạt động</h3>
        <p className={`mt-1 text-sm ${ui.muted}`}>Tần suất tác vụ theo 7 ngày gần nhất.</p>
      </div>
      <div className="flex h-72 items-end gap-3">
        {data.map((item) => (
          <div key={item.dateKey} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-56 w-full items-end rounded-lg bg-slate-100/70 p-1 dark:bg-slate-800/80">
              <div
                className="w-full rounded-md bg-blue-600 transition-all duration-500"
                style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
                title={`${item.value} tác vụ`}
              />
            </div>
            <div className="text-center">
              <p className={`text-xs font-semibold ${ui.text}`}>{item.value}</p>
              <p className={`text-xs ${ui.muted}`}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ data, ui, isDark }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#2563eb', '#14b8a6', '#f59e0b'];
  let offset = 25;

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${ui.card}`}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${ui.text}`}>Tỷ lệ loại tác vụ</h3>
          <p className={`mt-1 text-sm ${ui.muted}`}>Phân bổ theo nguồn nghiên cứu.</p>
        </div>
        <PieChart className="h-5 w-5 text-blue-500" />
      </div>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90">
          <circle cx="60" cy="60" r="38" fill="none" stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="18" />
          {data.length > 0 &&
            data.map((item, index) => {
              const dash = (item.value / total) * 238.76;
              const circle = (
                <circle
                  key={item.label}
                  cx="60"
                  cy="60"
                  r="38"
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="18"
                  strokeDasharray={`${dash} ${238.76 - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return circle;
            })}
        </svg>
        <div className="w-full space-y-3">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: colors[index % colors.length] }} />
                  <span className={ui.text}>{item.label}</span>
                </div>
                <span className={ui.muted}>{Math.round((item.value / total) * 100)}%</span>
              </div>
            ))
          ) : (
            <p className={`text-sm ${ui.muted}`}>Chưa có dữ liệu trong khoảng thời gian này.</p>
          )}
        </div>
      </div>
    </div>
  );
}
