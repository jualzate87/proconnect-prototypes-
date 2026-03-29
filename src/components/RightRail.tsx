
import './RightRail.css'

interface RightRailProps {
  isAuditOpen: boolean
  onAuditToggle: () => void
}

export default function RightRail({ isAuditOpen, onAuditToggle }: RightRailProps) {
  return (
    <div className="right-rail">
      <button className="rail-item" title="Tax Organizer">
        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
          <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>Tax Organizer</span>
      </button>

      <button className="rail-item" title="Import Hub">
        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
          <path d="M10 13V4M7 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>Import hub</span>
      </button>

      <button className="rail-item" title="Documents List">
        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
          <path d="M6 3h8l3 3v12H3V3h3zm8 0v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>Documents list</span>
      </button>

      <button
        className={`rail-item ${isAuditOpen ? 'rail-item--active' : ''}`}
        title="Audit Log"
        onClick={onAuditToggle}
      >
        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 7v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Audit log</span>
        <span className="rail-badge">NEW</span>
      </button>

      <button className="rail-item" title="Flagged Items">
        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
          <path d="M5 3v14M5 3l10 4-10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Flagged items</span>
      </button>

      <button className="rail-item" title="Comments">
        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
          <path d="M17 3H3v11h3v3l4-3h7V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        <span>Comments</span>
      </button>
    </div>
  )
}
