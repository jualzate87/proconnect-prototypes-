import { useState, useRef, useEffect } from 'react'
import { Version } from '../../types'
import { useAppContext } from '../../index'
import { getChangeTypeColor, SECTION_DISPLAY } from '../../lib/mock-data'

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
    previewVersionId,
    openDuplicate,
    previewVersion,
    revertToVersion,
    renameVersion,
    setHighlight,
    clearHighlight,
  } = useAppContext()

  const isCurrent    = version.id === auditLog.currentVersionId
  const isPreviewing = previewVersionId === version.id

  const [showMenu,   setShowMenu]   = useState(false)
  const [isEditing,  setIsEditing]  = useState(false)
  const [renameVal,  setRenameVal]  = useState(version.label)

  const menuRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const typeColor = getChangeTypeColor(version.changeType)
  const typeLabel = CHANGE_TYPE_LABELS[version.changeType] || version.changeType

  const hasRelated = (version.relatedFields?.length ?? 0) > 0
  const summary    = hasRelated ? getSectionSummary(version.relatedFields!) : []

  // ── Highlight on hover ────────────────────────────────────────────────────
  const handleMouseEnter = () => {
    if (previewVersionId || isEditing) return
    if (hasRelated) setHighlight(version.relatedFields!, typeColor)
  }
  const handleMouseLeave = () => {
    if (previewVersionId) return
    clearHighlight()
  }

  // ── Inline rename ─────────────────────────────────────────────────────────
  const startRename = () => {
    setRenameVal(version.label)
    setIsEditing(true)
    setShowMenu(false)
  }

  const commitRename = () => {
    const trimmed = renameVal.trim()
    if (trimmed && trimmed !== version.label) {
      renameVersion(version.id, trimmed)
    }
    setIsEditing(false)
  }

  const cancelRename = () => {
    setRenameVal(version.label)
    setIsEditing(false)
  }

  const handleRenameKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')  { e.preventDefault(); commitRename() }
    if (e.key === 'Escape') { e.preventDefault(); cancelRename() }
  }

  // ── Action menu handlers ──────────────────────────────────────────────────
  const handlePreview = () => { previewVersion(version.id);   setShowMenu(false) }
  const handleRevert  = () => { revertToVersion(version.id);  setShowMenu(false) }
  const handleDuplicate = () => { openDuplicate(version.id);  setShowMenu(false) }

  return (
    <div
      className={[
        'version-entry',
        isCurrent    ? 'version-entry--current'   : '',
        isPreviewing ? 'version-entry--previewing' : '',
        isEditing    ? 'version-entry--editing'    : '',
      ].filter(Boolean).join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Change-type color dot */}
      <div className="entry-dot" style={{ background: typeColor }} />

      <div className="entry-body">
        {/* Description row */}
        <div className="entry-top">
          {isEditing ? (
            <div style={{ flex: 1 }}>
              <input
                ref={inputRef}
                className="entry-rename-input"
                value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                onKeyDown={handleRenameKey}
                onBlur={commitRename}
              />
              <p className="entry-rename-hint">Enter to save · Esc to cancel</p>
            </div>
          ) : (
            <p className="entry-description">{version.description}</p>
          )}

          {!isEditing && (
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
                  {!isCurrent && (
                    <button className="action-menu-item" onClick={handleRevert}>
                      <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                        <path d="M3 7a4 4 0 104-4H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        <path d="M4 5L2 7l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Restore this version
                    </button>
                  )}
                  <button className="action-menu-item" onClick={handleDuplicate}>
                    <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                      <rect x="1.5" y="3.5" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M4.5 3.5V2.5a1 1 0 011-1h5a1 1 0 011 1v8a1 1 0 01-1 1H9.5" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                    Duplicate return
                  </button>
                  <button className="action-menu-item" onClick={startRename}>
                    <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                      <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    </svg>
                    Rename
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Badge + author + time — hide during editing */}
        {!isEditing && (
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
        )}

        {/* Section chips */}
        {!isEditing && summary.length > 0 && (
          <div className="entry-section-summary">
            {summary.map(s => (
              <span key={s.name} className="entry-section-chip">
                {s.name} · {s.count} {s.count === 1 ? 'field' : 'fields'}
              </span>
            ))}
          </div>
        )}

        {isCurrent && !isEditing && <div className="entry-current-badge">Current</div>}
      </div>
    </div>
  )
}
