
import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../../index'
import SectionList from './SectionList'
import Filters from './Filters'
import { SECTION_DISPLAY } from '../../lib/mock-data'
import '../../styles/audit-panel.css'

interface AuditPanelProps {
  onClose: () => void
}

type ExportMode = 'chronological' | 'by_section'

function exportCSV(
  versions: ReturnType<ReturnType<typeof useAppContext>['getVisibleVersions']>,
  mode: ExportMode
) {
  const LABELS: Record<string, string> = {
    manual_entry: 'Manual', document_import: 'Document import',
    api_import: 'API', revert: 'Restore', copy: 'Copy',
  }

  const getSections = (v: (typeof versions)[number]) =>
    [...new Set((v.relatedFields || []).map(f => {
      const key = f.split('.')[0]
      return SECTION_DISPLAY[key] || key
    }))].join(' | ')

  let rows: string[][]

  if (mode === 'chronological') {
    rows = [
      ['Date', 'Time', 'Author', 'Activity type', 'Description', 'Section(s)', 'API source'],
      ...versions.map(v => {
        const d = new Date(v.timestamp)
        return [
          d.toLocaleDateString(),
          d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          v.author,
          LABELS[v.changeType] || v.changeType,
          v.description,
          getSections(v),
          v.apiSource || '',
        ]
      }),
    ]
  } else {
    // Group by section
    const sectionMap: Record<string, typeof versions> = {}
    for (const v of versions) {
      const keys = [...new Set((v.relatedFields || []).map(f => f.split('.')[0]))]
      if (keys.length === 0) {
        sectionMap['other'] = sectionMap['other'] || []
        sectionMap['other'].push(v)
      } else {
        for (const key of keys) {
          sectionMap[key] = sectionMap[key] || []
          if (!sectionMap[key].includes(v)) sectionMap[key].push(v)
        }
      }
    }
    rows = [['Section', 'Date', 'Time', 'Author', 'Activity type', 'Description', 'API source']]
    for (const [key, sectionVersions] of Object.entries(sectionMap)) {
      const name = SECTION_DISPLAY[key] || key
      for (const v of sectionVersions.sort((a, b) => b.timestamp - a.timestamp)) {
        const d = new Date(v.timestamp)
        rows.push([
          name,
          d.toLocaleDateString(),
          d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          v.author,
          LABELS[v.changeType] || v.changeType,
          v.description,
          v.apiSource || '',
        ])
      }
    }
  }

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `activity-log-${mode}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AuditPanel({ onClose }: AuditPanelProps) {
  const { getVisibleVersions, auditScenario, isLocked, bannerDismissed, dismissBanner } = useAppContext()
  const versions = getVisibleVersions()
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!exportOpen) return
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportOpen])

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

      {/* Export toolbar */}
      <div className="audit-export-bar">
        <span className="audit-export-label">{versions.length} entries</span>
        <div className="audit-export-actions">
          {/* Export dropdown */}
          <div className="export-dropdown-wrap" ref={exportRef}>
            <button
              className="audit-export-btn"
              onClick={() => setExportOpen(o => !o)}
              title="Export activity log"
            >
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Export CSV
              <svg viewBox="0 0 10 6" fill="none" width="9" height="9">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {exportOpen && (
              <div className="export-dropdown">
                <button className="export-dropdown-item" onClick={() => { exportCSV(versions, 'by_section'); setExportOpen(false) }}>
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <rect x="1" y="2" width="12" height="2.5" rx="1" fill="currentColor" opacity=".3"/>
                    <rect x="3" y="6" width="10" height="1.5" rx=".75" fill="currentColor"/>
                    <rect x="3" y="9.5" width="10" height="1.5" rx=".75" fill="currentColor"/>
                  </svg>
                  Export by section
                </button>
                <button className="export-dropdown-item" onClick={() => { exportCSV(versions, 'chronological'); setExportOpen(false) }}>
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path d="M7 2v4l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  Export chronologically
                </button>
              </div>
            )}
          </div>

          <button
            className="audit-export-btn"
            onClick={() => window.print()}
            title="Print activity log"
          >
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <rect x="3" y="1.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M3 5.5H1.5A1 1 0 00.5 6.5v5a1 1 0 001 1H3M13 5.5h1.5a1 1 0 011 1v5a1 1 0 01-1 1H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <rect x="3" y="9.5" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5.5 11.5h5M5.5 13h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Filters — hide in error/empty scenarios or when locked */}
      {auditScenario === 'with-entries' && !isLocked && <Filters hideAuthorFilter={true} />}

      {/* Content */}
      <div className="audit-panel-content">
        {auditScenario === 'empty' && (
          <>
            {/* Page message — dismissible */}
            {!bannerDismissed && (
              <div className="audit-page-message">
                <div className="audit-page-message-icon">
                  <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                    <circle cx="10" cy="10" r="8" fill="var(--action-primary)"/>
                    <path d="M10 9v5M10 7h.01" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="audit-page-message-body">
                  <p className="audit-page-message-title"><strong>Welcome to your new Audit log</strong></p>
                  <p className="audit-page-message-text">We'll now automatically track <strong>data entry changes</strong> as you work. Tracking started on <strong>June 15, 2026</strong>, so updates made <strong>before this date won't appear.</strong></p>
                </div>
                <button className="audit-page-message-close" onClick={dismissBanner} aria-label="Dismiss">
                  <svg viewBox="0 0 16 16" fill="none" width="12" height="12"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            )}
            <div className="audit-empty-full">
              <svg viewBox="0 0 64 64" fill="none" width="64" height="64" style={{ marginBottom: 16 }}>
                <rect x="8" y="10" width="36" height="44" rx="4" stroke="#c3ced5" strokeWidth="2"/>
                <path d="M16 22h20M16 30h20M16 38h12" stroke="#c3ced5" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="48" cy="46" r="10" fill="#f0f4f6" stroke="#c3ced5" strokeWidth="2"/>
                <path d="M44 46l3 3 5-5" stroke="#c3ced5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="audit-empty-title">No history to show yet</h3>
              <p className="audit-empty-desc">Activities will appear here as soon as changes are made. This log tracks <strong>data entry updates from imports, APIs, and manual entries</strong> as you work on the return.</p>
            </div>
          </>
        )}

        {auditScenario === 'with-entries' && !isLocked && (
          <>
            {/* Page message — dismissible */}
            {!bannerDismissed && (
              <div className="audit-page-message">
                <div className="audit-page-message-icon">
                  <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                    <circle cx="10" cy="10" r="8" fill="var(--action-primary)"/>
                    <path d="M10 9v5M10 7h.01" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="audit-page-message-body">
                  <p className="audit-page-message-title"><strong>Welcome to your new Audit log</strong></p>
                  <p className="audit-page-message-text">We'll now automatically track <strong>data entry changes</strong> as you work. Tracking started on <strong>June 15, 2026</strong>, so updates made <strong>before this date won't appear.</strong></p>
                </div>
                <button className="audit-page-message-close" onClick={dismissBanner} aria-label="Dismiss">
                  <svg viewBox="0 0 16 16" fill="none" width="12" height="12"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            )}
            {versions.length > 0 ? (
              <SectionList versions={versions} />
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
          </>
        )}

        {auditScenario === 'error' && (
          <div className="audit-error-state">
            <div className="audit-error-icon">
              <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="#d93f3f"/>
                <path d="M12 9v4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="17" r="1" fill="#fff"/>
              </svg>
            </div>
            <h3 className="audit-error-title">We couldn't load the version history</h3>
            <p className="audit-error-desc">The service is temporarily down. Try refreshing the page or loading the history again.</p>
            <button className="audit-error-retry">Try again</button>
          </div>
        )}

        {isLocked && (
          <div className="audit-locked-state">
            <div className="audit-locked-icon">
              <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="audit-locked-title">Return is locked</h3>
            <p className="audit-locked-desc">This return is locked. Unlock it from Return actions to view activity or make changes.</p>
          </div>
        )}
      </div>
    </div>
  )
}
