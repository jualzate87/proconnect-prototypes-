
import { useAppContext } from '../../index'
import ActivityList from './VersionList'
import Filters from './Filters'
import { SECTION_DISPLAY } from '../../lib/mock-data'
import '../../styles/audit-panel.css'

interface AuditPanelProps {
  onClose: () => void
}

function exportCSV(versions: ReturnType<ReturnType<typeof useAppContext>['getVisibleVersions']>) {
  const LABELS: Record<string, string> = {
    manual_entry: 'Manual', document_import: 'Document import',
    api_import: 'API', revert: 'Restore', copy: 'Copy',
  }
  const rows = [
    ['Date', 'Time', 'Author', 'Activity type', 'Description', 'Section(s)', 'API source'],
    ...versions.map(v => {
      const d = new Date(v.timestamp)
      const sections = [...new Set((v.relatedFields || []).map(f => {
        const key = f.split('.')[0]
        return SECTION_DISPLAY[key] || key
      }))].join(' | ')
      return [
        d.toLocaleDateString(),
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        v.author,
        LABELS[v.changeType] || v.changeType,
        v.description,
        sections,
        v.apiSource || '',
      ]
    }),
  ]
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AuditPanel({ onClose }: AuditPanelProps) {
  const { getVisibleVersions } = useAppContext()
  const versions = getVisibleVersions()

  return (
    <div className="audit-panel">
      {/* Header */}
      <div className="audit-panel-header">
        <h2 className="audit-panel-title">Activity log</h2>

        <div className="audit-panel-header-actions">
          {/* Download CSV */}
          <button
            className="audit-icon-btn"
            onClick={() => exportCSV(versions)}
            title="Download as CSV"
          >
            <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Print */}
          <button
            className="audit-icon-btn"
            onClick={() => window.print()}
            title="Print activity log"
          >
            <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
              <rect x="3" y="1.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M3 5.5H1.5A1 1 0 00.5 6.5v5a1 1 0 001 1H3M13 5.5h1.5a1 1 0 011 1v5a1 1 0 01-1 1H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <rect x="3" y="9.5" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5.5 11.5h5M5.5 13h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Close */}
          <button className="audit-close-btn" onClick={onClose} title="Close panel">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
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
