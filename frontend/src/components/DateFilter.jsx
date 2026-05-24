import { CalendarDays } from 'lucide-react';

function formatDateLabel(value) {
  if (!value) return 'Chọn ngày';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return 'Chọn ngày';
  return `${day}/${month}/${year}`;
}

function openNativeDatePicker(input) {
  try {
    input?.showPicker?.();
  } catch {
    // Browser still focuses the date input when showPicker is unavailable.
  }
}

function DatePickerField({ label, value, min, max, onChange, ui }) {
  return (
    <label className={`block text-sm ${ui.muted}`}>
      <span className="mb-1 block text-xs font-semibold">{label}</span>
      <span className={`relative flex min-w-[168px] items-center gap-2 rounded-lg border px-3 py-2 text-sm transition focus-within:ring-4 ${ui.input}`}>
        <CalendarDays className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <span className="min-w-[92px] font-medium tabular-nums">{formatDateLabel(value)}</span>
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          aria-label={label}
          onClick={(event) => openNativeDatePicker(event.currentTarget)}
          onFocus={(event) => openNativeDatePicker(event.currentTarget)}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </span>
    </label>
  );
}

export function DateFilter({ preset, setPreset, startDate, setStartDate, endDate, setEndDate, ui }) {
  const today = new Date().toISOString().slice(0, 10);
  const startMaxDate = endDate && endDate < today ? endDate : today;

  return (
    <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-start">
      <div className={`flex flex-wrap gap-2 rounded-xl border p-1 ${ui.softBorder} ${ui.soft}`}>
        {[
          ['all', 'Tất cả'],
          ['today', 'Hôm nay'],
          ['7d', '7 ngày qua'],
          ['30d', '30 ngày qua'],
          ['custom', 'Tùy chỉnh']
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setPreset(value)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              preset === value ? ui.activeNav : ui.inactiveNav
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex w-full flex-col gap-2 sm:w-[220px]">
          <DatePickerField label="Từ ngày" value={startDate} max={startMaxDate} onChange={setStartDate} ui={ui} />
          <DatePickerField label="Đến ngày" value={endDate} min={startDate || undefined} max={today} onChange={setEndDate} ui={ui} />
        </div>
      )}
    </div>
  );
}
