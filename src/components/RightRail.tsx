
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

      <button className="rail-item" title="Client Activity">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
          <path
            d="M13.007 7a1 1 0 0 0-1 1L12 12a1 1 0 0 0 1 1l3.556.006a1 1 0 0 0 0-2L14 11l.005-3a1 1 0 0 0-.998-1Z"
            fill="currentColor"
          />
          <path
            d="M19.374 5.647A8.941 8.941 0 0 0 13.014 3H13a8.98 8.98 0 0 0-8.98 8.593l-.312-.312a1 1 0 0 0-1.416 1.412l2 2a1 1 0 0 0 1.414 0l2-2a1 1 0 0 0-1.412-1.416l-.272.272A6.984 6.984 0 0 1 13 5h.012A7 7 0 0 1 13 19h-.012a7 7 0 0 1-4.643-1.775 1 1 0 1 0-1.33 1.494A8.994 8.994 0 0 0 12.986 21H13a9 9 0 0 0 6.374-15.353Z"
            fill="currentColor"
          />
        </svg>
        <span>Client activity</span>
      </button>

      <button
        className={`rail-item ${isAuditOpen ? 'rail-item--active' : ''}`}
        title="Audit Log"
        onClick={onAuditToggle}
      >
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
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
        <span>Audit log</span>
        <span className="rail-badge">NEW</span>
      </button>

      <div className="rail-divider" aria-hidden="true" />

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
