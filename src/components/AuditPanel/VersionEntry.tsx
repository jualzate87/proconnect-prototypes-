import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Version } from '../../types'
import { useAppContext } from '../../index'
import { getChangeTypeColor, SECTION_DISPLAY } from '../../lib/mock-data'
import { CHANGE_TYPE_LABELS, getVersionTitleParts, isUndoEntry } from '../../lib/audit-utils'
import PreviewTrowser from '../PreviewTrowser'

interface VersionEntryProps {
  version: Version
}

function getTypeLabel(version: Version): string {
  if (isUndoEntry(version)) return CHANGE_TYPE_LABELS.undo
  return CHANGE_TYPE_LABELS[version.changeType] || version.changeType
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatTime(timestamp: number): string {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (timestamp >= todayStart.getTime()) return time
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + time
}

// function formatWorkSpan(fromTimestamp: number): string {
//   const ms = Date.now() - fromTimestamp
//   const minutes = Math.round(ms / 60000)
//   const hours   = Math.round(ms / 3600000)
//   const days    = Math.round(ms / 86400000)
//   if (minutes < 60)  return `the past ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
//   if (hours < 24)    return `the past ${hours} ${hours === 1 ? 'hour' : 'hours'}`
//   return `the past ${days} ${days === 1 ? 'day' : 'days'}`
// } // reserved for future use

export default function VersionEntry({ version }: VersionEntryProps) {
  const {
    auditLog,
    previewVersionId,
    revertToVersion,
    undoChange,
    isLocked,
    setLocked,
  } = useAppContext()

  const isCurrent    = version.id === auditLog.currentVersionId
  const isPreviewing = previewVersionId === version.id

  const [showMenu, setShowMenu]                   = useState(false)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [showUndoConfirm, setShowUndoConfirm]     = useState(false)
  const [showLockedModal, setShowLockedModal]     = useState(false)
  const [showTrowser, setShowTrowser]             = useState(false)
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
    if (!showRestoreConfirm && !showUndoConfirm && !showLockedModal) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRestoreConfirm(false)
        setShowUndoConfirm(false)
        setShowLockedModal(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showRestoreConfirm, showUndoConfirm, showLockedModal])

  // Trowser is handled by PreviewTrowser's own Escape listener

  const isUndo    = isUndoEntry(version)
  const typeColor = getChangeTypeColor(version.changeType, isUndo)
  const typeLabel = getTypeLabel(version)
  const { verb, sectionPhrase } = getVersionTitleParts(version)

  const hasChanges = (version.changes?.length ?? 0) > 0

  const canUndo = hasChanges &&
    version.changeType !== 'revert' &&
    version.changeType !== 'copy'

  // ── Action menu handlers ──────────────────────────────────────────────────
  const handlePreview        = () => { setShowTrowser(true); setShowMenu(false) }
  const handleConfirmRestore = () => { revertToVersion(version.id); setShowRestoreConfirm(false) }
  const handleUndoRequest    = () => {
    setShowMenu(false)
    if (isLocked) { setShowLockedModal(true) } else { setShowUndoConfirm(true) }
  }
  const handleConfirmUndo    = () => { undoChange(version.id); setShowUndoConfirm(false) }

  // ── Source version lookup (for revert/undo entries) ──────────────────────
  const sourceVersion = version.sourceVersionId
    ? auditLog.versions.find(v => v.id === version.sourceVersionId)
    : null

  // ── Restore confirm: compute impact ──────────────────────────────────────
  // All entries with a later timestamp — sorted newest first for display
  const versionsAfter = auditLog.versions
    .filter(v => v.timestamp > version.timestamp)
    .sort((a, b) => b.timestamp - a.timestamp)
  // const workSpan   = formatWorkSpan(version.timestamp) // reserved for future use

  const versionDate = new Date(version.timestamp)
  const fullDate = versionDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  const fullTime = versionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Sections touched by THIS entry (used in undo modal)
  const thisSections = [...new Set((version.relatedFields ?? []).map(f => f.split('.')[0]))]
    .map(key => SECTION_DISPLAY[key] || key)

  // For restore: ALL entries after this point in time are lost
  const impactedVersions = versionsAfter

  // ── Locked modal (shown when return is locked and user tries to undo) ──────
  const lockedModal = showLockedModal && createPortal(
    <div className="modal-overlay" onClick={() => setShowLockedModal(false)}>
      <div className="restore-confirm-modal locked-modal" onClick={e => e.stopPropagation()}>
        <button className="restore-confirm-close locked-modal-close" onClick={() => setShowLockedModal(false)} aria-label="Close">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        <div className="locked-modal-body">
          <div className="locked-modal-icon">
            <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="#d93f3f"/>
              <path d="M12 9v4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="12" cy="17" r="1" fill="#fff"/>
            </svg>
          </div>
          <h2 className="locked-modal-title">Unlock this return to restore a version</h2>
          <p className="locked-modal-body-text">This return is locked. You need to unlock it to allow changes and restore a past version.</p>
        </div>
        <div className="restore-confirm-footer restore-confirm-footer--centered">
          <button className="modal-btn" onClick={() => setShowLockedModal(false)}>Cancel</button>
          <button className="modal-btn primary" onClick={() => { setLocked(false); setShowLockedModal(false) }}>Unlock return</button>
        </div>
      </div>
    </div>,
    document.body
  )

  // ── Undo confirm modal ────────────────────────────────────────────────────
  const undoConfirmModal = showUndoConfirm && canUndo && createPortal(
    <div className="modal-overlay" onClick={() => setShowUndoConfirm(false)}>
      <div className="restore-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="restore-confirm-header">
          <h2 className="restore-confirm-title">Undo this change?</h2>
          <button className="restore-confirm-close" onClick={() => setShowUndoConfirm(false)} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="restore-confirm-body">
          <p className="restore-confirm-lead">
            This removes the updates from your {version.description}. Your other changes will stay exactly as they are.
          </p>

          {thisSections.length > 0 && (
            <div className="restore-confirm-impact">
              <div className="restore-confirm-impact-title">Sections affected</div>
              <ul className="restore-confirm-impact-list">
                {thisSections.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          <p className="restore-confirm-note">
            We'll log this action in your audit log. You can redo it at any time.
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
          <h2 className="restore-confirm-title">Restore to "{version.description}"?</h2>
          <button className="restore-confirm-close" onClick={() => setShowRestoreConfirm(false)} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="restore-confirm-body">
          <div className="restore-confirm-target">
            <div className="restore-confirm-target-label">Restoring to</div>
            <div className="restore-confirm-target-card">
              <span className="restore-confirm-target-name">{version.description}</span>
              <span className="restore-confirm-target-meta">{fullDate} at {fullTime} · {version.author}</span>
            </div>
          </div>

          <p className="restore-confirm-lead">
            {impactedVersions.length > 0
              ? <>{impactedVersions.length === 1 ? '1 change' : `${impactedVersions.length} changes`} made since this version will be lost.</>
              : <>The return will go back to how it looked at this point. No changes will be lost.</>
            }
          </p>

          {impactedVersions.length > 0 && (
            <div className="restore-confirm-impact">
              <div className="restore-confirm-impact-title">Changes that will be lost</div>
              <ul className="restore-confirm-impact-list">
                {impactedVersions.slice().reverse().map((v, i) => (
                  <li key={i}>
                    <span className="modal-impact-desc">{v.description}</span>
                    <span className="modal-field-meta">{formatTimestamp(v.timestamp)} · {v.author}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="restore-confirm-note">
            The audit log will keep a record of this. You can restore to any version at any time.
          </p>
        </div>

        <div className="restore-confirm-footer">
          <button className="modal-btn" onClick={() => setShowRestoreConfirm(false)}>Keep current</button>
          <button className="modal-btn primary" onClick={handleConfirmRestore}>
            Restore
          </button>
        </div>
      </div>
    </div>,
    document.body
  )

  return (
    <>
      <div
        data-version-id={version.id}
        className={[
          'version-entry',
          isCurrent && !isPreviewing ? 'version-entry--current'    : '',
          isPreviewing               ? 'version-entry--previewing' : '',
        ].filter(Boolean).join(' ')}
      >
        <div className="entry-dot" style={{ background: typeColor }} />

        <div className="entry-body">
          <div className="entry-top">
            <p className="entry-description">
              {sectionPhrase ? (
                <>
                  {verb}{' '}
                  <span className="entry-description-section">{sectionPhrase}</span>
                </>
              ) : (
                version.description
              )}
            </p>

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
                    Preview this version
                  </button>
                  {canUndo && (
                    <button className="action-menu-item" onClick={handleUndoRequest}>
                      Undo this change
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {sourceVersion && (
            <div className="entry-source-ref">
              <svg viewBox="0 0 12 12" fill="none" width="11" height="11" aria-hidden="true">
                <path d="M2.5 6a3.5 3.5 0 103.5-3.5H3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M3 4L1 6l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{sourceVersion.description}</span>
              <span className="entry-source-ref-time">
                · {formatTime(sourceVersion.timestamp)}
              </span>
            </div>
          )}

          <div className="entry-meta">
            <span
              className="entry-type-badge"
              style={{
                background:  typeColor,
                color:       '#ffffff',
                borderColor: 'transparent',
              }}
            >
              {typeLabel}
            </span>
            <span className="entry-author">{version.author}</span>
            <span className="entry-sep">·</span>
            <span className="entry-time">{formatTime(version.timestamp)}</span>
          </div>

          {isCurrent && <div className="entry-current-badge">Current</div>}
        </div>
      </div>

      {showTrowser && <PreviewTrowser version={version} onClose={() => setShowTrowser(false)} />}
      {lockedModal}
      {undoConfirmModal}
      {restoreConfirmModal}
    </>
  )
}
