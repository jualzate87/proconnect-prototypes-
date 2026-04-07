import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Version } from '../../types'
import { useAppContext } from '../../index'
import { getChangeTypeColor, SECTION_DISPLAY, fieldLabel, formatFieldValue } from '../../lib/mock-data'

interface VersionEntryProps {
  version: Version
}

const CHANGE_TYPE_LABELS: Record<string, string> = {
  manual_entry:    'Manual',
  document_import: 'Import',
  api_import:      'API',
  revert:          'Restore',
  copy:            'Copy',
}

function getSectionSummary(fields: string[]): Array<{ name: string; count: number }> {
  const sections: Record<string, number> = {}
  for (const f of fields) {
    const s = f.split('.')[0]
    sections[s] = (sections[s] || 0) + 1
  }
  return Object.entries(sections).map(([key, count]) => ({
    name: SECTION_DISPLAY[key] || key,
    count,
  }))
}

function formatTime(timestamp: number): string {
  const DAY = 86400000
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const date = new Date(timestamp)
  if (timestamp >= todayStart.getTime()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (timestamp >= todayStart.getTime() - DAY) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function VersionEntry({ version }: VersionEntryProps) {
  const {
    auditLog,
    taxData,
    previewVersionId,
    previewVersion,
    revertToVersion,
    undoChange,
    setHighlight,
    clearHighlight,
  } = useAppContext()

  const isCurrent    = version.id === auditLog.currentVersionId
  const isPreviewing = previewVersionId === version.id

  const [showMenu, setShowMenu]   = useState(false)
  const [showDiff, setShowDiff]   = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  // Close diff modal on Escape
  useEffect(() => {
    if (!showDiff) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowDiff(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showDiff])

  const typeColor = getChangeTypeColor(version.changeType)
  const typeLabel = CHANGE_TYPE_LABELS[version.changeType] || version.changeType

  const hasRelated = (version.relatedFields?.length ?? 0) > 0
  const hasChanges = (version.changes?.length ?? 0) > 0
  const summary    = hasRelated ? getSectionSummary(version.relatedFields!) : []

  const canUndo = hasChanges &&
    version.changeType !== 'revert' &&
    version.changeType !== 'copy'

  // ── Highlight on hover ────────────────────────────────────────────────────
  const handleMouseEnter = () => {
    if (previewVersionId) return
    if (hasRelated) setHighlight(version.relatedFields!, typeColor)
  }
  const handleMouseLeave = () => {
    if (previewVersionId) return
    clearHighlight()
  }

  // ── Action menu handlers ──────────────────────────────────────────────────
  const handlePreview = () => { previewVersion(version.id); setShowMenu(false) }
  const handleRevert  = () => { revertToVersion(version.id); setShowMenu(false) }
  const handleMenuUndo = () => { undoChange(version.id); setShowMenu(false) }

  // ── Diff modal handlers ───────────────────────────────────────────────────
  const handleUndo = () => {
    undoChange(version.id)
    setShowDiff(false)
  }

  // ── Diff helpers ──────────────────────────────────────────────────────────
  const getCurrentValue = (field: string): unknown => {
    const [section, key] = field.split('.')
    const sectionData = taxData[section as keyof typeof taxData] as Record<string, unknown> | undefined
    return sectionData?.[key]
  }

  // ── Diff modal ────────────────────────────────────────────────────────────
  const diffModal = showDiff && hasChanges && createPortal(
    <div className="modal-overlay" onClick={() => setShowDiff(false)}>
      <div className="diff-modal" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="diff-modal-header">
          <div className="diff-modal-title-wrap">
            <div className="entry-dot" style={{ background: typeColor, marginTop: 2 }} />
            <div>
              <h2 className="diff-modal-title">{version.description}</h2>
              <div className="diff-modal-meta">
                <span
                  className="entry-type-badge"
                  style={{
                    background:  typeColor + '18',
                    color:       typeColor,
                    borderColor: typeColor + '40',
                  }}
                >
                  {typeLabel}{version.apiSource ? ` · ${version.apiSource}` : ''}
                </span>
                <span className="entry-author">{version.author}</span>
                <span className="entry-sep">·</span>
                <span className="entry-time">{formatTime(version.timestamp)}</span>
              </div>
            </div>
          </div>
          <button className="diff-modal-close" onClick={() => setShowDiff(false)} title="Close">
            <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="diff-modal-body">
          <table className="diff-modal-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Before</th>
                <th>After this change</th>
                <th>Current</th>
              </tr>
            </thead>
            <tbody>
              {version.changes!.map((change, i) => {
                const currentVal = getCurrentValue(change.field)
                const currentDiffers = currentVal !== change.newValue
                return (
                  <tr key={i}>
                    <td className="diff-modal-field">{fieldLabel(change.field)}</td>
                    <td className="diff-modal-before">{formatFieldValue(change.field, change.oldValue)}</td>
                    <td className="diff-modal-after">{formatFieldValue(change.field, change.newValue)}</td>
                    <td className="diff-modal-current">
                      {currentDiffers && (
                        <span className="entry-diff-conflict" title="A later change also modified this field">●</span>
                      )}
                      {formatFieldValue(change.field, currentVal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="diff-modal-footer">
          <button className="modal-btn" onClick={() => setShowDiff(false)}>Close</button>
          {canUndo && (
            <button className="modal-btn primary" onClick={handleUndo}>
              <svg viewBox="0 0 14 14" fill="none" width="12" height="12" style={{ marginRight: 5 }}>
                <path d="M3 7a4 4 0 104-4H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M4 5L2 7l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Undo this change
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )

  return (
    <>
      <div
        className={[
          'version-entry',
          isCurrent    ? 'version-entry--current'   : '',
          isPreviewing ? 'version-entry--previewing' : '',
        ].filter(Boolean).join(' ')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Change-type color dot */}
        <div className="entry-dot" style={{ background: typeColor }} />

        <div className="entry-body">
          {/* Description row */}
          <div className="entry-top">
            <p className="entry-description">{version.description}</p>

            <div className="entry-menu-wrap" ref={menuRef}>
              <button
                className="version-menu-btn"
                onClick={() => setShowMenu(!showMenu)}
                title="Actions"
              >
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <circle cx="8" cy="3.5"  r="1.2" fill="currentColor"/>
                  <circle cx="8" cy="8"    r="1.2" fill="currentColor"/>
                  <circle cx="8" cy="12.5" r="1.2" fill="currentColor"/>
                </svg>
              </button>
              {showMenu && (
                <div className="action-menu">
                  <button className="action-menu-item" onClick={handlePreview}>
                    <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                      <ellipse cx="7" cy="7" rx="5.5" ry="3.5" stroke="currentColor" strokeWidth="1.3"/>
                      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                    </svg>
                    Preview this version
                  </button>
                  {canUndo && (
                    <button className="action-menu-item" onClick={handleMenuUndo}>
                      <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                        <path d="M3 7a4 4 0 104-4H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        <path d="M4 5L2 7l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Undo this change
                    </button>
                  )}
                  {isPreviewing && (
                    <button className="action-menu-item" onClick={handleRevert}>
                      <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                        <path d="M3 7a4 4 0 104-4H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        <path d="M4 5L2 7l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Restore this version
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Badge + author + time */}
          <div className="entry-meta">
            <span
              className="entry-type-badge"
              style={{
                background:  typeColor + '18',
                color:       typeColor,
                borderColor: typeColor + '40',
              }}
            >
              {typeLabel}{version.apiSource ? ` · ${version.apiSource}` : ''}
            </span>
            <span className="entry-author">{version.author}</span>
            <span className="entry-sep">·</span>
            <span className="entry-time">{formatTime(version.timestamp)}</span>
          </div>

          {/* Section chips + View changes toggle */}
          <div className="entry-footer-row">
            {summary.length > 0 && (
              <div className="entry-section-summary">
                {summary.map(s => (
                  <span key={s.name} className="entry-section-chip">
                    {s.name} · {s.count} {s.count === 1 ? 'field' : 'fields'}
                  </span>
                ))}
              </div>
            )}

            {hasChanges && (
              <button
                className="entry-diff-toggle"
                onClick={() => setShowDiff(true)}
              >
                View changes
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10" style={{ marginLeft: 3 }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

          {isCurrent && <div className="entry-current-badge">Current</div>}
        </div>
      </div>

      {diffModal}
    </>
  )
}
