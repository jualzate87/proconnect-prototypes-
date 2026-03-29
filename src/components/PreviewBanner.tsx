import { useAppContext } from '../index'
import './PreviewBanner.css'

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default function PreviewBanner() {
  const { previewVersionId, getVersionById, previewVersion, revertToVersion } = useAppContext()

  if (!previewVersionId) return null
  const version = getVersionById(previewVersionId)
  if (!version) return null

  const handleRestore = () => {
    revertToVersion(previewVersionId)
  }

  const handleExit = () => {
    previewVersion(null)
  }

  return (
    <div className="preview-banner">
      <div className="preview-banner-left">
        {/* Eye icon */}
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
          Read-only · highlighted fields changed in this version
        </span>
        <button className="preview-restore-btn" onClick={handleRestore}>
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
            <path d="M3 7a4 4 0 104-4H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M4 5L2 7l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Restore this version
        </button>
        <button className="preview-exit-btn" onClick={handleExit}>
          Exit preview
        </button>
      </div>
    </div>
  )
}
