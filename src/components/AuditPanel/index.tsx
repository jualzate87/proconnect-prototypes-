
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
  const { getVisibleVersions } = useAppContext()
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

      {/* Filters */}
      <Filters />

      {/* Section list — always section view at first level */}
      <div className="audit-panel-content">
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
      </div>
    </div>
  )
}
