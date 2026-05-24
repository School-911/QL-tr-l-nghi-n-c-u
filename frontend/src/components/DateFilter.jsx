export function DateFilter({ preset, setPreset, startDate, setStartDate, endDate, setEndDate, ui }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-4 ${ui.input}`}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-4 ${ui.input}`}
          />
        </div>
      )}
    </div>
  );
}
