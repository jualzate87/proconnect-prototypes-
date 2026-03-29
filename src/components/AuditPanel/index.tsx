
import { useAppContext } from '../../index'
import ActivityList from './VersionList'
import Filters from './Filters'
import '../../styles/audit-panel.css'

interface AuditPanelProps {
  onClose: () => void
}

export default function AuditPanel({ onClose }: AuditPanelProps) {
  const { getVisibleVersions } = useAppContext()
  const versions = getVisibleVersions()

  return (
    <div className="audit-panel">
      {/* Header */}
      <div className="audit-panel-header">
        <h2 className="audit-panel-title">Activity log</h2>
        <button className="audit-close-btn" onClick={onClose} title="Close panel">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Filters */}
      <Filters />

      {/* Activity list */}
      <div className="audit-panel-content">
        {versions.length > 0 ? (
          <ActivityList versions={versions} />
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 40 40" fill="none" width="36" height="36" style={{ marginBottom: 10 }}>
              <circle cx="20" cy="20" r="15" stroke="#d4d7dc" strokeWidth="1.5"/>
              <path d="M20 13v7l4 4" stroke="#d4d7dc" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h3>No activity found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
