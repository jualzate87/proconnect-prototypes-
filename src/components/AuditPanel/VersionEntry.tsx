import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (timestamp >= todayStart.getTime()) return time
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + time
}

function formatWorkSpan(fromTimestamp: number): string {
  const ms = Date.now() - fromTimestamp
  const minutes = Math.round(ms / 60000)
  const hours   = Math.round(ms / 3600000)
  const days    = Math.round(ms / 86400000)
  if (minutes < 60)  return `the past ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  if (hours < 24)    return `the past ${hours} ${hours === 1 ? 'hour' : 'hours'}`
  return `the past ${days} ${days === 1 ? 'day' : 'days'}`
}

export default function VersionEntry({ version }: VersionEntryProps) {
  const {
    auditLog,
    previewVersionId,
    previewVersion,
    revertToVersion,
    undoChange,
  } = useAppContext()

  const isCurrent    = version.id === auditLog.currentVersionId
  const isPreviewing = previewVersionId === version.id

  const [showMenu, setShowMenu]                   = useState(false)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [showUndoConfirm, setShowUndoConfirm]     = useState(false)
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

  // Close any open modal on Escape
  useEffect(() => {
    if (!showRestoreConfirm && !showUndoConfirm) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRestoreConfirm(false)
        setShowUndoConfirm(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showRestoreConfirm, showUndoConfirm])

  const typeColor = getChangeTypeColor(version.changeType)
  const typeLabel = CHANGE_TYPE_LABELS[version.changeType] || version.changeType

  const hasRelated = (version.relatedFields?.length ?? 0) > 0
  const hasChanges = (version.changes?.length ?? 0) > 0
  const summary    = hasRelated ? getSectionSummary(version.relatedFields!) : []

  const canUndo = hasChanges &&
    version.changeType !== 'revert' &&
    version.changeType !== 'copy'

  // ── Action menu handlers ──────────────────────────────────────────────────
  const handlePreview      = () => { previewVersion(version.id); setShowMenu(false) }
  const handleRevert       = () => { setShowRestoreConfirm(true); setShowMenu(false) }
  const handleMenuUndo     = () => { setShowUndoConfirm(true); setShowMenu(false) }
  const handleConfirmRestore = () => { revertToVersion(version.id); setShowRestoreConfirm(false) }
  const handleConfirmUndo  = () => { undoChange(version.id); setShowUndoConfirm(false) }

  // ── Restore confirm: compute impact ──────────────────────────────────────
  const versionIndex  = auditLog.versions.findIndex(v => v.id === version.id)
  const versionsAfter = versionIndex >= 0 ? auditLog.versions.slice(versionIndex + 1) : []
  const workSpan      = formatWorkSpan(version.timestamp)

  const versionDate = new Date(version.timestamp)
  const fullDate = versionDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  const fullTime = versionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // ── Undo confirm modal ────────────────────────────────────────────────────
  const undoConfirmModal = showUndoConfirm && canUndo && createPortal(
    <div className="modal-overlay" onClick={() => setShowUndoConfirm(false)}>
      <div className="restore-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="restore-confirm-header">
          <h2 className="restore-confirm-title">Undo this change?</h2>
        </div>

        <div className="restore-confirm-body">
          <p className="restore-confirm-lead">
            This will undo <strong>{version.description}</strong> and revert the affected fields to their previous values.
          </p>
          <p className="restore-confirm-note">
            This action will be logged in the activity log. You can redo it at any time.
          </p>
        </div>

        <div className="restore-confirm-footer">
          <button className="modal-btn" onClick={() => setShowUndoConfirm(false)}>Cancel</button>
          <button className="modal-btn primary" onClick={handleConfirmUndo}>
            Undo this change
          </button>
        </div>
      </div>
    </div>,
    document.body
  )

  // ── Restore confirm modal ─────────────────────────────────────────────────
  const restoreConfirmModal = showRestoreConfirm && createPortal(
    <div className="modal-overlay" onClick={() => setShowRestoreConfirm(false)}>
      <div className="restore-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="restore-confirm-header">
          <h2 className="restore-confirm-title">Restore to this version?</h2>
        </div>

        <div className="restore-confirm-body">
          <p className="restore-confirm-lead">
            Your return will go back to how it looked on{' '}
            <strong>{fullDate} at {fullTime}</strong>.{' '}
            {versionsAfter.length > 0 && (
              <>All work from <strong>{workSpan}</strong> will be undone.</>
            )}
          </p>

          {versionsAfter.length > 0 && (
            <div className="restore-confirm-impact">
              <div className="restore-confirm-impact-title">What will be undone</div>
              <ul className="restore-confirm-impact-list">
                {versionsAfter.slice().reverse().map((v, i) => (
                  <li key={i}>{v.description}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="restore-confirm-note">
            The current version will remain in the activity log. You can restore back to it at any time.
          </p>
        </div>

        <div className="restore-confirm-footer">
          <button className="modal-btn" onClick={() => setShowRestoreConfirm(false)}>Cancel</button>
          <button className="modal-btn primary" onClick={handleConfirmRestore}>
            Restore version
          </button>
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
          isCurrent && !isPreviewing ? 'version-entry--current'   : '',
          isPreviewing               ? 'version-entry--previewing' : '',
        ].filter(Boolean).join(' ')}
      >
        <div className="entry-dot" style={{ background: typeColor }} />

        <div className="entry-body">
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
                  {!isCurrent && (
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

          <div className="entry-meta">
            <span
              className="entry-type-badge"
              style={{
                background:  typeColor + '18',
                color:       typeColor,
                borderColor: typeColor + '40',
              }}
            >
              {typeLabel}
            </span>
            <span className="entry-author">{version.author}</span>
            <span className="entry-sep">·</span>
            <span className="entry-time">{formatTime(version.timestamp)}</span>
          </div>

          {summary.length > 0 && (
            <div className="entry-section-summary">
              {summary.map(s => (
                <span key={s.name} className="entry-section-chip">
                  {s.name}
                </span>
              ))}
            </div>
          )}

          {isCurrent && <div className="entry-current-badge">Current</div>}
        </div>
      </div>

      {undoConfirmModal}
      {restoreConfirmModal}
    </>
  )
}
