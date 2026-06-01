export function todayForInput() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function RestaurantSearchBar({
  where,
  when,
  guests,
  onWhereChange,
  onWhenChange,
  onGuestsChange,
  onSubmit,
  className = "",
}) {
  return (
    <form
      className={`home-search ${className}`.trim()}
      onSubmit={onSubmit}
    >
      <div className="home-search-segment home-search-segment--wide">
        <span className="home-search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>
        <input
          type="text"
          aria-label="Restaurant or city"
          placeholder="Restaurant or city…"
          value={where}
          onChange={(e) => onWhereChange(e.target.value)}
        />
      </div>
      <div className="home-search-separator" aria-hidden="true" />
      <div className="home-search-segment">
        <span className="home-search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </span>
        <input
          type="date"
          aria-label="Date"
          value={when}
          min={todayForInput()}
          onChange={(e) => onWhenChange(e.target.value)}
        />
      </div>
      <div className="home-search-separator" aria-hidden="true" />
      <div className="home-search-segment home-search-segment--guests">
        <input
          type="number"
          aria-label="Number of guests"
          min="1"
          max="50"
          value={guests}
          onChange={(e) => onGuestsChange(Number(e.target.value) || 1)}
        />
        <span className="home-search-suffix">guests</span>
      </div>
      <button type="submit" className="home-search-submit">
        Search
      </button>
    </form>
  );
}
