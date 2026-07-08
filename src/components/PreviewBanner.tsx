import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAppContext } from '../index'
import { fieldLabel, formatFieldValue } from '../lib/mock-data'
import './PreviewBanner.css'

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

// function formatWorkSpan(fromTimestamp: number): string {
//   const ms = Date.now() - fromTimestamp
//   const minutes = Math.round(ms / 60000)
//   const hours   = Math.round(ms / 3600000)
//   const days    = Math.round(ms / 86400000)
//   if (minutes < 60) return `the past ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
//   if (hours < 24)   return `the past ${hours} ${hours === 1 ? 'hour' : 'hours'}`
//   return `the past ${days} ${days === 1 ? 'day' : 'days'}`
// } // reserved for future use

export default function PreviewBanner() {
  const { auditLog, previewVersionId, getVersionById, previewVersion, revertToVersion, undoChange } = useAppContext()
  const [showConfirm, setShowConfirm]         = useState(false)
  const [showUndoConfirm, setShowUndoConfirm] = useState(false)

  useEffect(() => {
    if (!showConfirm && !showUndoConfirm) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowConfirm(false); setShowUndoConfirm(false) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showConfirm, showUndoConfirm])

  if (!previewVersionId) return null
  const version = getVersionById(previewVersionId)
  if (!version) return null

  // Compute impact
  // const workSpan = formatWorkSpan(version.timestamp) // reserved for future use

  // All entries with a later timestamp — sorted newest first for display
  const impactedVersions = auditLog.versions
    .filter(v => v.timestamp > version.timestamp)
    .sort((a, b) => b.timestamp - a.timestamp)

  // Undo: specific field changes
  const undoChanges = version.changes ?? []

  const fullDate = new Date(version.timestamp).toLocaleDateString([], {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  const fullTime = new Date(version.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const canUndo = (version.changes?.length ?? 0) > 0 &&
    version.changeType !== 'revert' &&
    version.changeType !== 'copy'

  const handleConfirmRestore = () => {
    revertToVersion(previewVersionId)
    setShowConfirm(false)
  }

  const handleConfirmUndo = () => {
    undoChange(previewVersionId)
    setShowUndoConfirm(false)
  }

  const undoConfirmModal = showUndoConfirm && canUndo && createPortal(
    <div className="modal-overlay" onClick={() => setShowUndoConfirm(false)}>
      <div className="restore-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="restore-confirm-header">
          <h2 className="restore-confirm-title">Undo "{version.description}"?</h2>
        </div>
        <div className="restore-confirm-body">
          <p className="restore-confirm-lead">
            {undoChanges.length === 1
              ? <><strong>{fieldLabel(undoChanges[0].field)}</strong> will go back to its previous value.</>
              : <><strong>{undoChanges.length} fields</strong> will go back to their previous values.</>
            }
          </p>
          {undoChanges.length > 0 && (
            <div className="restore-confirm-impact">
              <div className="restore-confirm-impact-title">Fields that will be reverted</div>
              <ul className="restore-confirm-impact-list">
                {undoChanges.map((c, i) => (
                  <li key={i}>
                    <span className="modal-field-name">{fieldLabel(c.field)}</span>
                    <span className="modal-field-arrow"> → </span>
                    <span className="modal-field-prev">{formatFieldValue(c.field, c.oldValue)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="restore-confirm-note">
            This will be recorded in the audit log. You can restore this change at any time.
          </p>
        </div>
        <div className="restore-confirm-footer">
          <button className="modal-btn" onClick={() => setShowUndoConfirm(false)}>Keep change</button>
          <button className="modal-btn primary" onClick={handleConfirmUndo}>
            Undo
          </button>
        </div>
      </div>
    </div>,
    document.body
  )

  const confirmModal = showConfirm && createPortal(
    <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
      <div className="restore-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="restore-confirm-header">
          <h2 className="restore-confirm-title">Restore to "{version.description}"?</h2>
        </div>

        <div className="restore-confirm-body">
          {/* Version being restored to */}
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
                    <span>{v.description}</span>
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
          <button className="modal-btn" onClick={() => setShowConfirm(false)}>Keep current</button>
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
      <div className="preview-banner">
        <div className="preview-banner-left">
          <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
            <ellipse cx="9" cy="9" rx="7" ry="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="9" cy="9" r="2.5" fill="currentColor"/>
          </svg>
          <span className="preview-banner-label">Previewing:</span>
          <strong className="preview-banner-version">{version.label}</strong>
          <span className="preview-banner-meta">
            · {formatTimestamp(version.timestamp)} · {version.author}
          </span>
        </div>

        <div className="preview-banner-right">
          <span className="preview-banner-hint">
            <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
              <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Read-only
          </span>
          {canUndo && (
            <button className="preview-restore-btn" onClick={() => setShowUndoConfirm(true)}>
              <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                <path d="M3 7a4 4 0 104-4H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M4 5L2 7l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Undo this change
            </button>
          )}
          <button className="preview-restore-btn" onClick={() => setShowConfirm(true)}>
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
              <path d="M3 7a4 4 0 104-4H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M4 5L2 7l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Restore this version
          </button>
          <button className="preview-exit-btn" onClick={() => previewVersion(null)}>
            Exit preview
          </button>
        </div>
      </div>

      {confirmModal}
      {undoConfirmModal}
    </>
  )
}
