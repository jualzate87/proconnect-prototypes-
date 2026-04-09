import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAppContext } from '../index'
import './PreviewBanner.css'

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function formatWorkSpan(fromTimestamp: number): string {
  const ms = Date.now() - fromTimestamp
  const minutes = Math.round(ms / 60000)
  const hours   = Math.round(ms / 3600000)
  const days    = Math.round(ms / 86400000)
  if (minutes < 60) return `the past ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  if (hours < 24)   return `the past ${hours} ${hours === 1 ? 'hour' : 'hours'}`
  return `the past ${days} ${days === 1 ? 'day' : 'days'}`
}

export default function PreviewBanner() {
  const { auditLog, previewVersionId, getVersionById, previewVersion, revertToVersion } = useAppContext()
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!showConfirm) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowConfirm(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showConfirm])

  if (!previewVersionId) return null
  const version = getVersionById(previewVersionId)
  if (!version) return null

  const versionIndex      = auditLog.versions.findIndex(v => v.id === version.id)
  const versionsAfter     = versionIndex >= 0 ? auditLog.versions.slice(versionIndex + 1) : []
  const changesAfterCount = versionsAfter.reduce((n, v) => n + (v.changes?.length ?? 0), 0)
  const recentLabels      = versionsAfter.slice(-3).reverse().map(v => v.description)
  const workSpan          = formatWorkSpan(version.timestamp)
  const fullDate          = new Date(version.timestamp).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  const fullTime          = new Date(version.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const handleConfirmRestore = () => { revertToVersion(previewVersionId); setShowConfirm(false) }

  const confirmModal = showConfirm && createPortal(
    <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
      <div className="restore-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="restore-confirm-header">
          <div className="restore-confirm-icon">
            <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
              <path d="M5 10a5 5 0 105-5H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M7 7L4.5 10 7 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="restore-confirm-title">Restore to this version?</h2>
        </div>

        <div className="restore-confirm-body">
          <p className="restore-confirm-lead">
            Your return will go back to how it looked on{' '}
            <strong>{fullDate} at {fullTime}</strong>.{' '}
            {versionsAfter.length > 0 && <>All work from <strong>{workSpan}</strong> will be undone.</>}
          </p>

          {versionsAfter.length > 0 && (
            <div className="restore-confirm-impact">
              <div className="restore-confirm-impact-title">What will be undone</div>
              <ul className="restore-confirm-impact-list">
                {recentLabels.map((label, i) => <li key={i}>{label}</li>)}
                {versionsAfter.length > 3 && (
                  <li className="restore-confirm-more">
                    + {versionsAfter.length - 3} more {versionsAfter.length - 3 === 1 ? 'change' : 'changes'}
                  </li>
                )}
              </ul>
              {changesAfterCount > 0 && (
                <p className="restore-confirm-field-count">
                  {changesAfterCount} field {changesAfterCount === 1 ? 'value' : 'values'} will be overwritten.
                </p>
              )}
            </div>
          )}

          <p className="restore-confirm-note">
            The current version will remain in the activity log. You can restore back to it at any time.
          </p>
        </div>

        <div className="restore-confirm-footer">
          <button className="modal-btn" onClick={() => setShowConfirm(false)}>Cancel</button>
          <button className="modal-btn primary" onClick={handleConfirmRestore}>
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13" style={{ marginRight: 5 }}>
              <path d="M3 7a4 4 0 104-4H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M4 5L2 7l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Restore version
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
          <span className="preview-banner-meta">· {formatTimestamp(version.timestamp)} · {version.author}</span>
        </div>

        <div className="preview-banner-right">
          <span className="preview-banner-hint">
            <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
              <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Read-only · highlighted fields changed in this version
          </span>
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
    </>
  )
}
