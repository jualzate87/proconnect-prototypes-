import { useState, useEffect, useRef, useCallback } from 'react'
import './AuditResearch.css'

// ---------- Types ----------

type EntryType = 'api' | 'manual' | 'import' | 'revert'

interface AuditEntry {
  id: string
  type: EntryType
  title: string
  sourceLabel: string
  sourceClass: string
  author: string
  date: string
  ago: string
  fields: string[]
  categories: string[]
  current?: boolean
  ghosted?: boolean
}

interface Divider {
  divider: string
}

type Row = AuditEntry | Divider

function isDivider(r: Row): r is Divider {
  return 'divider' in r
}

// ---------- Seed data ----------

const SEED: Row[] = [
  {
    id: 'e1',
    type: 'api',
    title: 'Imported K-1 partnership income from TaxDome API',
    sourceLabel: 'API · TaxDome',
    sourceClass: 'pill-api',
    author: 'David Hansen',
    date: 'Mar 30, 09:30 AM',
    ago: '15d 7h',
    fields: ['Rental & Other Income · 2 fields'],
    categories: ['Rental & Other Income'],
    current: true,
  },
  {
    id: 'e2',
    type: 'manual',
    title: 'Entered rental property income & details',
    sourceLabel: 'Manual',
    sourceClass: 'pill-manual',
    author: 'Sarah Miller',
    date: 'Mar 30, 07:15 AM',
    ago: '2h 15m',
    fields: ['Rental & Other Income · 6 fields'],
    categories: ['Rental & Other Income'],
  },
  {
    id: 'e3',
    type: 'manual',
    title: 'Corrected W-2 wages · Bing Equipment',
    sourceLabel: 'Manual',
    sourceClass: 'pill-manual',
    author: 'David Hansen',
    date: 'Mar 29, 08:45 AM',
    ago: '22h 30m',
    fields: ['Wages & Salaries · 5 fields'],
    categories: ['Wages & Salaries'],
  },
  {
    id: 'e4',
    type: 'import',
    title: 'Imported 1099-INT · Citi Bank',
    sourceLabel: 'Import',
    sourceClass: 'pill-import',
    author: 'Sarah Miller',
    date: 'Mar 29, 06:15 AM',
    ago: '2h 30m',
    fields: ['Interest & Dividends · 6 fields'],
    categories: ['Interest & Dividends'],
  },
  {
    id: 'e5',
    type: 'api',
    title: 'Imported dividend & short-term gains data from Alfred API',
    sourceLabel: 'API · Alfred',
    sourceClass: 'pill-api',
    author: 'David Hansen',
    date: 'Mar 27, 10:15 AM',
    ago: '1d 20h',
    fields: ['Interest & Dividends · 2 fields', 'Capital Gains & Losses · 1 field'],
    categories: ['Interest & Dividends', 'Capital Gains & Losses'],
  },
  {
    id: 'e6',
    type: 'manual',
    title: 'Entered capital gains – Investments',
    sourceLabel: 'Manual',
    sourceClass: 'pill-manual',
    author: 'Sarah Miller',
    date: 'Mar 26, 08:15 AM',
    ago: '1d 2h',
    fields: ['Capital Gains & Losses · 3 fields'],
    categories: ['Capital Gains & Losses'],
  },
  {
    id: 'e7',
    type: 'import',
    title: 'Imported W-2 · Tech Circle Inc. (new employer tab)',
    sourceLabel: 'Import',
    sourceClass: 'pill-import',
    author: 'Jason Hansen',
    date: 'Mar 24, 10:15 AM',
    ago: '1d 22h',
    fields: ['Wages & Salaries · 12 fields'],
    categories: ['Wages & Salaries'],
  },
  { divider: 'Last 90 days' },
  {
    id: 'e8',
    type: 'api',
    title: 'Imported interest & dividend data from TaxDome API',
    sourceLabel: 'API · TaxDome',
    sourceClass: 'pill-api',
    author: 'David Hansen',
    date: 'Mar 10, 10:15 AM',
    ago: '14d',
    fields: ['Interest & Dividends · 8 fields'],
    categories: ['Interest & Dividends'],
  },
  {
    id: 'e9',
    type: 'manual',
    title: 'Entered self-employment income',
    sourceLabel: 'Manual',
    sourceClass: 'pill-manual',
    author: 'Sarah Miller',
    date: 'Mar 2, 09:15 AM',
    ago: '8d',
    fields: ['Wages & Salaries · 1 field'],
    categories: ['Wages & Salaries'],
  },
]

// ---------- Helpers ----------

const dotClassFor = (type: EntryType) =>
  ({ api: 'dot-api', manual: 'dot-manual', import: 'dot-import', revert: 'dot-revert' }[type] ?? 'dot-manual')

function realEntries(rows: Row[]): AuditEntry[] {
  return rows.filter((r): r is AuditEntry => !isDivider(r))
}

function fieldCount(fields: string[]): number {
  return fields.reduce((sum, f) => {
    const m = f.match(/(\d+)\s+field/)
    return sum + (m ? parseInt(m[1], 10) : 0)
  }, 0)
}

// ---------- Sub-components ----------

interface DropdownMenuProps {
  visible: boolean
  position: { top: number; left: number }
  onRevert: () => void
  onClose: () => void
}

function DropdownMenu({ visible, position, onRevert, onClose }: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      ref={ref}
      className="ar-dropdown"
      style={{ top: position.top, left: position.left }}
      onClick={e => e.stopPropagation()}
    >
      <button className="danger" onClick={onRevert}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Revert to this version
      </button>
    </div>
  )
}

interface RevertModalProps {
  visible: boolean
  target: AuditEntry | null
  lost: AuditEntry[]
  source: 'rich' | 'sparse'
  onCancel: () => void
  onConfirm: () => void
}

function RevertModal({ visible, target, lost, source, onCancel, onConfirm }: RevertModalProps) {
  if (!visible || !target) return null

  const totalFields = lost.reduce((sum, e) => sum + fieldCount(e.fields), 0)
  const uniqueCategories = [...new Set(lost.flatMap(e => e.categories))]

  return (
    <div className="ar-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="ar-modal" role="dialog" aria-modal={true} aria-labelledby="ar-modal-title">
        <div className="ar-modal-header">
          <h3 id="ar-modal-title">Revert to {target.date}?</h3>
          <p>{target.author}'s version will become the current state.</p>
        </div>
        <div className="ar-modal-body">
          {source === 'rich' ? (
            <>
              <div className="ar-modal-section-label">
                {lost.length} change{lost.length === 1 ? '' : 's'} will be undone
              </div>
              <div className="ar-modal-rich-list">
                {lost.map(e => (
                  <div key={e.id} className="ar-modal-rich-row">
                    <span className={`ar-dot ${dotClassFor(e.type)}`} />
                    <div className="ar-modal-rich-row-body">
                      <div className="ar-modal-rich-row-title">{e.title}</div>
                      <div className="ar-modal-rich-row-meta">
                        <span className={`ar-pill ${e.sourceClass}`}>{e.sourceLabel}</span>
                        <span className="author">{e.author}</span>
                        <span>{e.date}</span>
                      </div>
                      <div className="ar-modal-rich-row-fields">
                        {e.fields.map(f => <span key={f} className="ar-field-pill">{f}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ar-modal-summary-line">
                <strong>{totalFields} field{totalFields === 1 ? '' : 's'}</strong> across{' '}
                <strong>{lost.length} activit{lost.length === 1 ? 'y' : 'ies'}</strong> will be lost. This cannot be undone.
              </div>
            </>
          ) : (
            <>
              <div className="ar-modal-section-label">Areas affected</div>
              <div className="ar-modal-sparse-list">
                {uniqueCategories.map(cat => (
                  <div key={cat} className="ar-modal-sparse-row">
                    <span className="bullet" />
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
              <div className="ar-modal-sparse-hint">
                All edits made to these areas after {target.date} will be lost. This cannot be undone.
              </div>
            </>
          )}
        </div>
        <div className="ar-modal-footer">
          <button className="ar-btn ar-btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="ar-btn ar-btn-danger" onClick={onConfirm}>Revert</button>
        </div>
      </div>
    </div>
  )
}

interface ToastProps {
  visible: boolean
  text: string
}

function Toast({ visible, text }: ToastProps) {
  return (
    <div className={`ar-toast${visible ? ' visible' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{text}</span>
    </div>
  )
}

// ---------- Rich panel ----------

interface RichPanelProps {
  entries: Row[]
  onMenuClick: (id: string, rect: DOMRect, source: 'rich') => void
}

function RichPanel({ entries, onMenuClick }: RichPanelProps) {
  return (
    <div className="ar-rich-panel">
      <nav className="ar-panel-rail">
        <div className="ar-rail-item">
          <span className="ar-rail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <line x1="8" y1="8" x2="16" y2="8" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="16" x2="13" y2="16" />
            </svg>
          </span>
          <span>Tax<br />Organizer</span>
        </div>
        <div className="ar-rail-item">
          <span className="ar-rail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" />
            </svg>
          </span>
          <span>Import<br />hub</span>
        </div>
        <div className="ar-rail-item">
          <span className="ar-rail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M14 3v6h6" />
            </svg>
          </span>
          <span>Documents<br />list</span>
        </div>
        <div className="ar-rail-item">
          <span className="ar-rail-icon">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24" aria-hidden="true">
              <path
                d="M13.007 7a1 1 0 0 0-1 1L12 12a1 1 0 0 0 1 1l3.556.006a1 1 0 0 0 0-2L14 11l.005-3a1 1 0 0 0-.998-1Z"
                fill="currentColor"
              />
              <path
                d="M19.374 5.647A8.941 8.941 0 0 0 13.014 3H13a8.98 8.98 0 0 0-8.98 8.593l-.312-.312a1 1 0 0 0-1.416 1.412l2 2a1 1 0 0 0 1.414 0l2-2a1 1 0 0 0-1.412-1.416l-.272.272A6.984 6.984 0 0 1 13 5h.012A7 7 0 0 1 13 19h-.012a7 7 0 0 1-4.643-1.775 1 1 0 1 0-1.33 1.494A8.994 8.994 0 0 0 12.986 21H13a9 9 0 0 0 6.374-15.353Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span>Client<br />activity</span>
        </div>
        <div className="ar-rail-item active">
          <span className="ar-rail-new">NEW</span>
          <span className="ar-rail-icon">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24" aria-hidden="true">
              <path
                d="M13.712 11.056a.75.75 0 0 1 1.06 1.06l-2.828 2.828a.75.75 0 0 1-1.06 0L9.47 13.53a.75.75 0 0 1 1.06-1.06l.884.883 2.298-2.297Z"
                fill="currentColor"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2a3.5 3.5 0 0 1 3.167 2.01L18 4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 1.795-1.99L6 4l2.832.01A3.5 3.5 0 0 1 12 2Zm3.5 4.167-.004.085a.834.834 0 0 1-.744.744L14.667 7H9.333a.834.834 0 0 1-.83-.748L8.5 6.167v-.66L6 5.5a.5.5 0 0 0-.5.5v14a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.4-.49L18 5.5h-2.5v.667ZM12 3.5a2 2 0 0 0-2 2h4a2 2 0 0 0-2-2Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span>Audit log</span>
        </div>
        <div className="ar-rail-divider" aria-hidden="true" />
        <div className="ar-rail-item">
          <span className="ar-rail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 21V4h13l-2 4 2 4H4" />
            </svg>
          </span>
          <span>Flagged<br />items</span>
        </div>
        <div className="ar-rail-item">
          <span className="ar-rail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </span>
          <span>Comments</span>
        </div>
      </nav>

      <div className="ar-panel-main">
        <header className="ar-panel-header">
          <h2>Activity log</h2>
          <button className="ar-close" aria-label="Close">×</button>
        </header>

        <div className="ar-panel-toolbar">
          <span className="ar-count">{realEntries(entries).length} entries</span>
          <div className="ar-toolbar-actions">
            <button>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" />
              </svg>
              Export CSV
            </button>
            <button>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
          </div>
        </div>

        <div className="ar-panel-search">
          <div className="ar-search-input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Search activity…" />
          </div>
        </div>

        <div className="ar-panel-filters">
          <button className="ar-filter-btn">Date <span className="chev">▾</span></button>
          <button className="ar-filter-btn">Author <span className="chev">▾</span></button>
          <button className="ar-filter-btn">Activity <span className="chev">▾</span></button>
        </div>

        <div className="ar-entries">
          {entries.map((row, i) => {
            if (isDivider(row)) {
              return <div key={`div-${i}`} className="ar-day-divider">{row.divider}</div>
            }
            const e = row
            return (
              <div key={e.id} className={`ar-entry${e.ghosted ? ' ghosted' : ''}`}>
                <span className={`ar-dot ${dotClassFor(e.type)}`} />
                <div className="ar-entry-body">
                  <div className="ar-entry-title">{e.title}</div>
                  <div className="ar-entry-meta">
                    <span className={`ar-pill ${e.sourceClass}`}>{e.sourceLabel}</span>
                    <span className="author">{e.author}</span>
                    <span>{e.date}</span>
                    <span>·</span>
                    <span>{e.ago}</span>
                  </div>
                  <div className="ar-entry-fields">
                    {e.fields.map(f => <span key={f} className="ar-field-pill">{f}</span>)}
                  </div>
                  {e.current && <span className="ar-pill pill-current">Current</span>}
                </div>
                {!e.current && !e.ghosted ? (
                  <button
                    className="ar-menu-btn"
                    aria-label="More"
                    onClick={ev => {
                      ev.stopPropagation()
                      onMenuClick(e.id, (ev.currentTarget as HTMLButtonElement).getBoundingClientRect(), 'rich')
                    }}
                  >⋮</button>
                ) : (
                  <span style={{ width: 24 }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---------- Sparse panel ----------

interface SparsePanelProps {
  entries: Row[]
  onMenuClick: (id: string, rect: DOMRect, source: 'sparse') => void
}

function SparsePanel({ entries, onMenuClick }: SparsePanelProps) {
  return (
    <div className="ar-sparse-panel">
      <h2>Version history</h2>
      <div className="ar-sparse-filter">
        <span>All versions</span>
        <span className="chev">▾</span>
      </div>
      <div className="ar-sparse-divider">Today</div>
      {entries.map((row, i) => {
        if (isDivider(row)) {
          return <div key={`div-${i}`} className="ar-sparse-divider" style={{ marginTop: 12 }}>{row.divider}</div>
        }
        const e = row
        return (
          <div key={e.id} className={`ar-version${e.current ? ' current' : ''}${e.ghosted ? ' ghosted' : ''}`}>
            <div className="ar-version-content">
              <div className="ar-version-time">{e.date}</div>
              {e.current && <div className="ar-version-current-label">Current version</div>}
              <div className="ar-version-author">
                <span className="ar-dot dot-teal" />
                <span>{e.author}</span>
              </div>
              <div className="ar-version-category">
                {e.categories.map((cat, ci) => (
                  <span key={cat} className="cat">{ci > 0 && ' · '}{cat}</span>
                ))}
              </div>
            </div>
            {!e.current && !e.ghosted ? (
              <button
                className="ar-menu-btn"
                aria-label="More"
                onClick={ev => {
                  ev.stopPropagation()
                  onMenuClick(e.id, (ev.currentTarget as HTMLButtonElement).getBoundingClientRect(), 'sparse')
                }}
              >⋮</button>
            ) : (
              <span style={{ width: 16 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------- Main page ----------

type ViewMode = 'rich' | 'sparse' | 'compare'

const captions: Record<ViewMode, string> = {
  rich: '<strong>Phase 1 design</strong> — each entry shows source, author, time, and which fields were touched. Click ⋮ on any entry to try revert.',
  sparse: '<strong>PD proposed design</strong> — timestamp, author, and category area only. Click ⋮ on any version to try revert.',
  compare: '<strong>Side-by-side</strong> — same activity, two levels of detail. Try reverting in each to see what the user knows before they confirm.',
}

export default function AuditResearch() {
  const [mode, setMode] = useState<ViewMode>('rich')
  const [entries, setEntries] = useState<Row[]>(() => JSON.parse(JSON.stringify(SEED)))
  const [dropdown, setDropdown] = useState<{ visible: boolean; position: { top: number; left: number }; targetId: string; source: 'rich' | 'sparse' }>({
    visible: false, position: { top: 0, left: 0 }, targetId: '', source: 'rich',
  })
  const [modal, setModal] = useState<{ visible: boolean; targetId: string; source: 'rich' | 'sparse' }>({
    visible: false, targetId: '', source: 'rich',
  })
  const [toast, setToast] = useState({ visible: false, text: '' })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((text: string) => {
    setToast({ visible: true, text })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400)
  }, [])

  const handleMenuClick = useCallback((id: string, rect: DOMRect, source: 'rich' | 'sparse') => {
    let left = rect.right + 4
    if (left + 220 > window.innerWidth) left = rect.left - 204
    setDropdown({ visible: true, position: { top: rect.top, left }, targetId: id, source })
  }, [])

  const openModal = useCallback(() => {
    setDropdown(d => ({ ...d, visible: false }))
    setModal({ visible: true, targetId: dropdown.targetId, source: dropdown.source })
  }, [dropdown.targetId, dropdown.source])

  const closeModal = useCallback(() => setModal(m => ({ ...m, visible: false })), [])

  const performRevert = useCallback(() => {
    const targetId = modal.targetId
    setEntries(prev => {
      const targetIdx = prev.findIndex(r => !isDivider(r) && (r as AuditEntry).id === targetId)
      if (targetIdx === -1) return prev
      const target = prev[targetIdx] as AuditEntry
      const next = prev.map((r, i) => {
        if (isDivider(r) || i >= targetIdx) return r
        const e = r as AuditEntry
        return { ...e, ghosted: true, current: undefined }
      })
      const lost = prev.slice(0, targetIdx).filter((r): r is AuditEntry => !isDivider(r) && !(r as AuditEntry).ghosted)
      const lostCategories = [...new Set(lost.flatMap(e => e.categories))]
      const fmt = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
      const revertEntry: AuditEntry = {
        id: 'r_' + Date.now(),
        type: 'revert',
        title: `Reverted to ${target.date} (${target.author}'s version)`,
        sourceLabel: 'Revert',
        sourceClass: 'pill-revert',
        author: 'Sarah Miller',
        date: fmt,
        ago: 'just now',
        fields: lostCategories.length
          ? [`${lost.length} change${lost.length === 1 ? '' : 's'} undone across ${lostCategories.length} area${lostCategories.length === 1 ? '' : 's'}`]
          : ['No changes undone'],
        categories: lostCategories.length ? lostCategories : ['—'],
        current: true,
      }
      return [revertEntry, ...next]
    })
    closeModal()
    showToast(`Reverted to ${(entries.find(r => !isDivider(r) && (r as AuditEntry).id === targetId) as AuditEntry)?.date ?? ''}`)
  }, [modal.targetId, entries, closeModal, showToast])

  const reset = useCallback(() => {
    setEntries(JSON.parse(JSON.stringify(SEED)))
    showToast('Prototype reset')
  }, [showToast])

  // Compute modal props
  const modalTarget = entries.find(r => !isDivider(r) && (r as AuditEntry).id === modal.targetId) as AuditEntry | undefined
  const modalTargetIdx = entries.findIndex(r => !isDivider(r) && (r as AuditEntry).id === modal.targetId)
  const modalLost = modalTargetIdx > 0
    ? entries.slice(0, modalTargetIdx).filter((r): r is AuditEntry => !isDivider(r) && !(r as AuditEntry).ghosted)
    : []

  const showRich = mode === 'rich' || mode === 'compare'
  const showSparse = mode === 'sparse' || mode === 'compare'

  return (
    <div className="ar-root">
      {/* Research toolbar */}
      <div className="ar-research-bar">
        <div className="ar-branding">
          <span className="ar-badge">Research prototype</span>
          <span><strong>ProConnect audit log</strong> — toggle views and try the ⋮ menu</span>
        </div>
        <div className="ar-toolbar-right">
          <div className="ar-mode-toggle" role="tablist" aria-label="View mode">
            {(['rich', 'sparse', 'compare'] as ViewMode[]).map(m => (
              <button
                key={m}
                className={mode === m ? 'active' : ''}
                onClick={() => setMode(m)}
              >
                {m === 'rich' ? 'Rich (Phase 1)' : m === 'sparse' ? 'Sparse (PD proposed)' : 'Side-by-side'}
              </button>
            ))}
          </div>
          <button className="ar-reset-btn" onClick={reset} title="Reset to initial state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Caption */}
      <div className="ar-demo-caption" dangerouslySetInnerHTML={{ __html: captions[mode] }} />

      {/* Stage */}
      <div className={`ar-stage${mode === 'compare' ? ' compare' : ''}`}>
        {showRich && (
          <div className="ar-view-wrapper">
            <RichPanel entries={entries} onMenuClick={handleMenuClick} />
            <div className="ar-view-label">Phase 1 — browsable at a glance</div>
          </div>
        )}
        {showSparse && (
          <div className="ar-view-wrapper">
            <SparsePanel entries={entries} onMenuClick={handleMenuClick} />
            <div className="ar-view-label">PD proposed — category only, no field counts</div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      <DropdownMenu
        visible={dropdown.visible}
        position={dropdown.position}
        onRevert={openModal}
        onClose={() => setDropdown(d => ({ ...d, visible: false }))}
      />

      {/* Modal */}
      <RevertModal
        visible={modal.visible}
        target={modalTarget ?? null}
        lost={modalLost}
        source={modal.source}
        onCancel={closeModal}
        onConfirm={performRevert}
      />

      {/* Toast */}
      <Toast visible={toast.visible} text={toast.text} />
    </div>
  )
}
