import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../../index'
import { formatFilterDateRange } from '../../lib/time-groups'

function toDateInputValue(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function fromDateInputValue(val: string, endOfDay = false): number {
  const d = new Date(val)
  if (endOfDay) d.setHours(23, 59, 59, 999)
  return d.getTime()
}

interface FiltersProps {
  hideAuthorFilter?: boolean
}

export default function Filters({ hideAuthorFilter = false }: FiltersProps) {
  const { filters, setFilters, clearFilters, auditLog } = useAppContext()
  const [dateOpen,     setDateOpen]     = useState(false)
  const [authorOpen,   setAuthorOpen]   = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)

  // Local draft state for date range — only applied on "Apply"
  const [draftFrom, setDraftFrom] = useState('')
  const [draftTo,   setDraftTo]   = useState('')

  const dateRef     = useRef<HTMLDivElement>(null)
  const authorRef   = useRef<HTMLDivElement>(null)
  const activityRef = useRef<HTMLDivElement>(null)

  const authors = Array.from(new Set(auditLog.versions.map(v => v.author))).sort()

  const ACTIVITY_OPTIONS = [
    { label: 'All activity',      value: '' },
    { label: 'Manual Entry',      value: 'manual_entry' },
    { label: 'Import',            value: 'document_import' },
    { label: 'API',               value: 'api_import' },
  ]

  // Sync draft fields when opening the date picker
  const openDatePicker = () => {
    setDraftFrom(filters.dateFrom ? toDateInputValue(filters.dateFrom) : '')
    setDraftTo(filters.dateTo   ? toDateInputValue(filters.dateTo)   : '')
    setDateOpen(true)
    setAuthorOpen(false)
    setActivityOpen(false)
  }

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

  const applyDateRange = () => {
    setFilters({
      ...filters,
      dateFrom: draftFrom ? fromDateInputValue(draftFrom)         : undefined,
      dateTo:   draftTo   ? fromDateInputValue(draftTo, true)     : undefined,
    })
    setDateOpen(false)
  }

  const clearDateRange = () => {
    setDraftFrom('')
    setDraftTo('')
    setFilters({ ...filters, dateFrom: undefined, dateTo: undefined })
    setDateOpen(false)
  }

  // ── Author pill logic ─────────────────────────────────────────────────────
  const selectAuthor = (author: string) => {
    setFilters({ ...filters, author: author || undefined })
    setAuthorOpen(false)
  }

  // ── Activity type pill logic ──────────────────────────────────────────────
  const selectActivity = (val: string) => {
    setFilters({ ...filters, changeType: val || undefined })
    setActivityOpen(false)
  }

  // ── Search logic ──────────────────────────────────────────────────────────
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchQuery: e.target.value || undefined })
  }

  const hasDateFilter = Boolean(filters.dateFrom || filters.dateTo)
  const dateChipValue = formatFilterDateRange(filters.dateFrom, filters.dateTo)

  const hasFilters = hasDateFilter || filters.author || filters.changeType

  const activityChipLabel = filters.changeType
    ? ACTIVITY_OPTIONS.find(o => o.value === filters.changeType)?.label
    : null

  const activeFilterChips: { id: string; label: string; value: string; onRemove: () => void }[] = []

  if (dateChipValue) {
    activeFilterChips.push({
      id: 'date',
      label: 'Date:',
      value: dateChipValue,
      onRemove: clearDateRange,
    })
  }
  if (activityChipLabel) {
    activeFilterChips.push({
      id: 'activity',
      label: 'Activity:',
      value: activityChipLabel,
      onRemove: () => setFilters({ ...filters, changeType: undefined }),
    })
  }
  if (filters.author) {
    activeFilterChips.push({
      id: 'author',
      label: 'Author:',
      value: filters.author,
      onRemove: () => setFilters({ ...filters, author: undefined }),
    })
  }

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

      {/* ── Search bar ── */}
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

        {/* Date range */}
        <div className="filter-pill-wrap" ref={dateRef}>
          <button
            className={`filter-pill${hasDateFilter ? ' filter-pill--active' : ''}`}
            onClick={openDatePicker}
            title={dateChipValue || 'Filter by date range'}
          >
            <svg viewBox="0 0 12 12" fill="none" width="10" height="10" style={{ flexShrink: 0 }}>
              <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M1 5h10" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <span className="filter-pill-date-label">Date range</span>
            <Chevron />
          </button>

          {dateOpen && (
            <div className="filter-dropdown date-range-dropdown">
              <div className="date-range-fields">
                <label className="date-range-label">
                  From
                  <input
                    type="date"
                    className="date-range-input"
                    value={draftFrom}
                    max={draftTo || undefined}
                    onChange={e => setDraftFrom(e.target.value)}
                  />
                </label>
                <label className="date-range-label">
                  To
                  <input
                    type="date"
                    className="date-range-input"
                    value={draftTo}
                    min={draftFrom || undefined}
                    onChange={e => setDraftTo(e.target.value)}
                  />
                </label>
              </div>
              <div className="date-range-actions">
                <button className="date-range-clear" onClick={clearDateRange}>Clear</button>
                <button className="date-range-apply" onClick={applyDateRange}>Apply</button>
              </div>
            </div>
          )}
        </div>

        {/* Author — hidden on section overview */}
        {!hideAuthorFilter && (
        <div className="filter-pill-wrap" ref={authorRef}>
          <button
            className={`filter-pill${filters.author ? ' filter-pill--active' : ''}`}
            onClick={() => { setAuthorOpen(!authorOpen); setDateOpen(false); setActivityOpen(false) }}
          >
            <span>Author</span>
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
        )}

        {/* Activity type */}
        <div className="filter-pill-wrap" ref={activityRef}>
          <button
            className={`filter-pill${filters.changeType ? ' filter-pill--active' : ''}`}
            onClick={() => { setActivityOpen(!activityOpen); setDateOpen(false); setAuthorOpen(false) }}
          >
            <span>Activity</span>
            <Chevron />
          </button>
          {activityOpen && (
            <div className="filter-dropdown filter-dropdown--right">
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

      {activeFilterChips.length > 0 && (
        <div className="audit-filter-chips" aria-label="Active filters">
          {activeFilterChips.map(chip => (
            <div key={chip.id} className="audit-filter-chip">
              <span className="audit-filter-chip-text">
                {chip.label} <strong>{chip.value}</strong>
              </span>
              <button
                type="button"
                className="audit-filter-chip-remove"
                onClick={chip.onRemove}
                aria-label={`Remove ${chip.label} ${chip.value} filter`}
              >
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10" aria-hidden="true">
                  <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
