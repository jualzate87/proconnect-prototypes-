import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../../index'

export default function Filters() {
  const { filters, setFilters, clearFilters, auditLog } = useAppContext()
  const [dateOpen,     setDateOpen]     = useState(false)
  const [authorOpen,   setAuthorOpen]   = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const dateRef     = useRef<HTMLDivElement>(null)
  const authorRef   = useRef<HTMLDivElement>(null)
  const activityRef = useRef<HTMLDivElement>(null)

  const authors = Array.from(new Set(auditLog.versions.map(v => v.author))).sort()

  const DATE_OPTIONS = [
    { label: 'All dates',    value: '' },
    { label: 'Today',        value: 'today' },
    { label: 'Yesterday',    value: 'yesterday' },
    { label: 'Last 7 days',  value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'This year',    value: 'this_year' },
    { label: 'Last year',    value: 'last_year' },
  ]

  const ACTIVITY_OPTIONS = [
    { label: 'All activity',      value: '' },
    { label: 'Manual entry',      value: 'manual_entry' },
    { label: 'Document import',   value: 'document_import' },
    { label: 'API import',        value: 'api_import' },
  ]

  // Close all dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateRef.current     && !dateRef.current.contains(e.target as Node))     setDateOpen(false)
      if (authorRef.current   && !authorRef.current.contains(e.target as Node))   setAuthorOpen(false)
      if (activityRef.current && !activityRef.current.contains(e.target as Node)) setActivityOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Date pill logic ──────────────────────────────────────────────────────────
  const selectDate = (val: string) => {
    const DAY = 86400000
    const now = new Date()
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
    const todayMs = todayStart.getTime()
    let dateFrom: number | undefined
    let dateTo:   number | undefined

    if (val === 'today')     { dateFrom = todayMs }
    else if (val === 'yesterday') { dateFrom = todayMs - DAY;       dateTo = todayMs - 1 }
    else if (val === '7d')        { dateFrom = todayMs - 7  * DAY;  dateTo = todayMs - 2 * DAY - 1 }
    else if (val === '30d')       { dateFrom = todayMs - 30 * DAY;  dateTo = todayMs - 7 * DAY - 1 }
    else if (val === '90d')       { dateFrom = todayMs - 90 * DAY;  dateTo = todayMs - 30 * DAY - 1 }
    else if (val === 'this_year') {
      dateFrom = new Date(now.getFullYear(), 0, 1).getTime()
      dateTo   = todayMs - 90 * DAY - 1
    } else if (val === 'last_year') {
      dateFrom = new Date(now.getFullYear() - 1, 0, 1).getTime()
      dateTo   = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999).getTime()
    }
    setFilters({ ...filters, dateFrom, dateTo })
    setDateOpen(false)
  }

  const activeDateLabel = (() => {
    if (!filters.dateFrom && !filters.dateTo) return null
    const DAY = 86400000
    const now = new Date()
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
    const todayMs = todayStart.getTime()
    const df = filters.dateFrom!
    if (df >= todayMs)            return 'Today'
    if (df >= todayMs - DAY)      return 'Yesterday'
    if (df >= todayMs - 7  * DAY) return 'Last 7 days'
    if (df >= todayMs - 30 * DAY) return 'Last 30 days'
    if (df >= todayMs - 90 * DAY) return 'Last 90 days'
    if (new Date(df).getFullYear() === now.getFullYear())     return 'This year'
    if (new Date(df).getFullYear() === now.getFullYear() - 1) return 'Last year'
    return null
  })()

  // ── Author pill logic ────────────────────────────────────────────────────────
  const selectAuthor = (author: string) => {
    setFilters({ ...filters, author: author || undefined })
    setAuthorOpen(false)
  }

  // ── Activity type pill logic ─────────────────────────────────────────────────
  const selectActivity = (val: string) => {
    setFilters({ ...filters, changeType: val || undefined })
    setActivityOpen(false)
  }

  // ── Search logic ─────────────────────────────────────────────────────────────
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchQuery: e.target.value || undefined })
  }

  const hasFilters = filters.dateFrom || filters.dateTo || filters.author || filters.changeType

  function Chevron() {
    return (
      <svg viewBox="0 0 12 12" fill="none" width="10" height="10" style={{ flexShrink: 0 }}>
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }

  function Check() {
    return (
      <svg viewBox="0 0 12 12" fill="none" width="10" height="10" style={{ marginRight: 4 }}>
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }

  return (
    <div className="audit-filters">

      {/* ── Search bar — CG Input ── */}
      <div className="audit-search-wrap">
        <div className="audit-search-inner">
          <svg className="audit-search-icon" viewBox="0 0 14 14" fill="none" width="13" height="13">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            className="audit-search-input"
            type="text"
            placeholder="Search activity…"
            value={filters.searchQuery || ''}
            onChange={handleSearch}
          />
          {filters.searchQuery && (
            <button
              className="audit-search-clear"
              onClick={() => setFilters({ ...filters, searchQuery: undefined })}
              title="Clear search"
            >
              <svg viewBox="0 0 12 12" fill="none" width="9" height="9">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Filter pills row ── */}
      <div className="audit-filter-row">

        {/* Date */}
        <div className="filter-pill-wrap" ref={dateRef}>
          <button
            className={`filter-pill${activeDateLabel ? ' filter-pill--active' : ''}`}
            onClick={() => { setDateOpen(!dateOpen); setAuthorOpen(false); setActivityOpen(false) }}
          >
            <span>{activeDateLabel || 'Date'}</span>
            <Chevron />
          </button>
          {dateOpen && (
            <div className="filter-dropdown">
              {DATE_OPTIONS.map(opt => {
                const isActive = activeDateLabel === opt.label || (!activeDateLabel && opt.value === '')
                return (
                  <button
                    key={opt.value}
                    className={`filter-dropdown-item${isActive ? ' active' : ''}`}
                    onClick={() => selectDate(opt.value)}
                  >
                    {isActive && <Check />}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Author */}
        <div className="filter-pill-wrap" ref={authorRef}>
          <button
            className={`filter-pill${filters.author ? ' filter-pill--active' : ''}`}
            onClick={() => { setAuthorOpen(!authorOpen); setDateOpen(false); setActivityOpen(false) }}
          >
            <span>{filters.author || 'Author'}</span>
            <Chevron />
          </button>
          {authorOpen && (
            <div className="filter-dropdown">
              <button
                className={`filter-dropdown-item${!filters.author ? ' active' : ''}`}
                onClick={() => selectAuthor('')}
              >
                {!filters.author && <Check />}
                All authors
              </button>
              {authors.map(author => (
                <button
                  key={author}
                  className={`filter-dropdown-item${filters.author === author ? ' active' : ''}`}
                  onClick={() => selectAuthor(author)}
                >
                  {filters.author === author && <Check />}
                  {author}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Activity type */}
        <div className="filter-pill-wrap" ref={activityRef}>
          <button
            className={`filter-pill${filters.changeType ? ' filter-pill--active' : ''}`}
            onClick={() => { setActivityOpen(!activityOpen); setDateOpen(false); setAuthorOpen(false) }}
          >
            <span>{filters.changeType ? ACTIVITY_OPTIONS.find(o => o.value === filters.changeType)?.label : 'Activity'}</span>
            <Chevron />
          </button>
          {activityOpen && (
            <div className="filter-dropdown">
              {ACTIVITY_OPTIONS.map(opt => {
                const isActive = (filters.changeType || '') === opt.value
                return (
                  <button
                    key={opt.value}
                    className={`filter-dropdown-item${isActive ? ' active' : ''}`}
                    onClick={() => selectActivity(opt.value)}
                  >
                    {isActive && <Check />}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Clear all */}
        {hasFilters && (
          <button className="filter-clear-btn" onClick={() => clearFilters()} title="Clear all filters">
            <svg viewBox="0 0 12 12" fill="none" width="9" height="9">
              <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
