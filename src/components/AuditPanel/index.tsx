
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
  const { getVisibleVersions, auditScenario, bannerDismissed, dismissBanner } = useAppContext()
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
        <h2 className="audit-panel-title">Audit log</h2>
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
      {auditScenario === 'with-entries' && <Filters hideAuthorFilter={true} />}

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
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 16 }}>
                <path d="M15.745 49.9902C15.4821 49.9902 15.2301 49.8858 15.0442 49.6999C14.8583 49.5141 14.7539 49.262 14.7539 48.9991V13.2063C14.7539 12.9434 14.8583 12.6913 15.0442 12.5055C15.2301 12.3196 15.4821 12.2152 15.745 12.2152H24.7192C24.9277 10.9861 25.5646 9.87049 26.517 9.06606C27.4693 8.26163 28.6757 7.82031 29.9224 7.82031C31.169 7.82031 32.3754 8.26163 33.3278 9.06606C34.2802 9.87049 34.9171 10.9861 35.1256 12.2152H44.1047C44.3676 12.2152 44.6197 12.3196 44.8055 12.5055C44.9914 12.6913 45.0958 12.9434 45.0958 13.2063V48.9991C45.0958 49.262 44.9914 49.5141 44.8055 49.6999C44.6197 49.8858 44.3676 49.9902 44.1047 49.9902H15.745Z" fill="white"/>
                <path d="M29.9213 8.82567C30.4914 8.83085 31.0548 8.94827 31.5795 9.17122C32.1042 9.39418 32.5798 9.7183 32.9792 10.1251C33.3786 10.5319 33.694 11.0133 33.9074 11.542C34.1207 12.0707 34.2278 12.6362 34.2226 13.2062H44.1036V48.9991H15.7439V13.2062H25.62C25.6148 12.6362 25.7219 12.0707 25.9352 11.542C26.1485 11.0133 26.4639 10.5319 26.8633 10.1251C27.2628 9.7183 27.7384 9.39418 28.2631 9.17122C28.7878 8.94827 29.3512 8.83085 29.9213 8.82567ZM29.9213 6.84351C28.5909 6.84942 27.2965 7.27648 26.2238 8.06344C25.1511 8.85039 24.3551 9.95683 23.95 11.2241H15.7439C15.2182 11.2241 14.714 11.4329 14.3423 11.8046C13.9706 12.1764 13.7617 12.6805 13.7617 13.2062V48.9991C13.7617 49.5248 13.9706 50.029 14.3423 50.4007C14.714 50.7724 15.2182 50.9813 15.7439 50.9813H44.1036C44.6293 50.9813 45.1335 50.7724 45.5052 50.4007C45.877 50.029 46.0858 49.5248 46.0858 48.9991V13.2062C46.0858 12.6805 45.877 12.1764 45.5052 11.8046C45.1335 11.4329 44.6293 11.2241 44.1036 11.2241H35.8925C35.4868 9.95723 34.6907 8.85123 33.6181 8.06438C32.5455 7.27753 31.2515 6.85018 29.9213 6.84351Z" fill="#205EA3"/>
                <g opacity="0.15" style={{mixBlendMode:'multiply'}}>
                  <path d="M43.5387 21.1201V47.9536H16.2988L43.5387 21.1201Z" fill="#5DABFF"/>
                </g>
                <path d="M21.6302 27.0169C22.6729 27.0169 23.5182 26.1805 23.5182 25.1487C23.5182 24.1169 22.6729 23.2805 21.6302 23.2805C20.5875 23.2805 19.7422 24.1169 19.7422 25.1487C19.7422 26.1805 20.5875 27.0169 21.6302 27.0169Z" fill="#3492EF"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M26.5508 25.1487C26.5508 24.8887 26.7615 24.678 27.0215 24.678H38.5131C38.7731 24.678 38.9839 24.8887 38.9839 25.1487C38.9839 25.4087 38.7731 25.6195 38.5131 25.6195H27.0215C26.7615 25.6195 26.5508 25.4087 26.5508 25.1487Z" fill="#5DABFF"/>
                <path d="M21.6302 35.0049C22.6729 35.0049 23.5182 34.1685 23.5182 33.1367C23.5182 32.105 22.6729 31.2686 21.6302 31.2686C20.5875 31.2686 19.7422 32.105 19.7422 33.1367C19.7422 34.1685 20.5875 35.0049 21.6302 35.0049Z" fill="#3492EF"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M26.5508 33.1368C26.5508 32.8768 26.7615 32.666 27.0215 32.666H38.5131C38.7731 32.666 38.9839 32.8768 38.9839 33.1368C38.9839 33.3968 38.7731 33.6075 38.5131 33.6075H27.0215C26.7615 33.6075 26.5508 33.3968 26.5508 33.1368Z" fill="#5DABFF"/>
                <path d="M21.6302 42.9932C22.6729 42.9932 23.5182 42.1568 23.5182 41.125C23.5182 40.0932 22.6729 39.2568 21.6302 39.2568C20.5875 39.2568 19.7422 40.0932 19.7422 41.125C19.7422 42.1568 20.5875 42.9932 21.6302 42.9932Z" fill="#3492EF"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M26.5508 41.1251C26.5508 40.8651 26.7615 40.6543 27.0215 40.6543H38.5131C38.7731 40.6543 38.9839 40.8651 38.9839 41.1251C38.9839 41.3851 38.7731 41.5958 38.5131 41.5958H27.0215C26.7615 41.5958 26.5508 41.3851 26.5508 41.1251Z" fill="#5DABFF"/>
                <path d="M29.9215 15.0893C30.9752 15.0893 31.8293 14.2463 31.8293 13.2063C31.8293 12.1663 30.9752 11.3232 29.9215 11.3232C28.8678 11.3232 28.0137 12.1663 28.0137 13.2063C28.0137 14.2463 28.8678 15.0893 29.9215 15.0893Z" fill="#205EA3"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M19.8131 11.8757C20.0744 11.8757 20.2863 12.0876 20.2863 12.349V17.3465H39.5529V12.349C39.5529 12.0876 39.7648 11.8757 40.0262 11.8757C40.2875 11.8757 40.4994 12.0876 40.4994 12.349V17.8197C40.4994 18.0811 40.2875 18.293 40.0262 18.293H19.8131C19.5517 18.293 19.3398 18.0811 19.3398 17.8197V12.349C19.3398 12.0876 19.5517 11.8757 19.8131 11.8757Z" fill="#205EA3"/>
                <path d="M51.5363 48.7812L45.1934 42.4531L47.1755 40.4709L53.5184 46.8039C53.6491 46.9338 53.7528 47.0882 53.8235 47.2583C53.8943 47.4284 53.9307 47.6108 53.9307 47.795C53.9307 47.9792 53.8943 48.1616 53.8235 48.3317C53.7528 48.5018 53.6491 48.6562 53.5184 48.7861C53.3886 48.917 53.234 49.0209 53.0637 49.0916C52.8934 49.1623 52.7107 49.1984 52.5263 49.198C52.3419 49.1975 52.1594 49.1604 51.9895 49.0889C51.8195 49.0173 51.6655 48.9127 51.5363 48.7812Z" fill="#3492EF"/>
                <path d="M40.8616 44.351C39.2766 44.3519 37.7269 43.8828 36.4085 43.003C35.0902 42.1231 34.0624 40.872 33.4551 39.4079C32.8479 37.9438 32.6885 36.3326 32.9971 34.7779C33.3057 33.2232 34.0685 31.795 35.1889 30.6739C36.3093 29.5528 37.7371 28.7891 39.2916 28.4795C40.8461 28.1699 42.4574 28.3283 43.9219 28.9347C45.3863 29.541 46.6381 30.568 47.5188 31.8858C48.3994 33.2037 48.8695 34.7531 48.8695 36.3381C48.8682 38.462 48.0243 40.4986 46.5229 42.0008C45.0216 43.5031 42.9855 44.3483 40.8616 44.351Z" fill="white"/>
                <path d="M40.8575 29.3213C42.2467 29.3203 43.605 29.7314 44.7605 30.5026C45.9159 31.2738 46.8167 32.3704 47.3488 33.6537C47.8809 34.9369 48.0203 36.3492 47.7496 37.7117C47.4788 39.0743 46.8099 40.3259 45.8276 41.3082C44.8453 42.2906 43.5937 42.9594 42.2311 43.2302C40.8686 43.501 39.4563 43.3615 38.173 42.8294C36.8897 42.2974 35.7931 41.3966 35.022 40.2411C34.2508 39.0856 33.8397 37.7273 33.8406 36.3381C33.8406 34.4771 34.5799 32.6924 35.8958 31.3765C37.2117 30.0605 38.9965 29.3213 40.8575 29.3213ZM40.8575 27.3391C39.0765 27.3391 37.3354 27.8673 35.8546 28.8569C34.3738 29.8465 33.2198 31.253 32.5384 32.8986C31.8571 34.5441 31.6791 36.3548 32.0269 38.1015C32.3747 39.8482 33.2327 41.4526 34.4925 42.7116C35.7522 43.9706 37.357 44.8278 39.1039 45.1746C40.8509 45.5215 42.6614 45.3425 44.3066 44.6602C45.9518 43.978 47.3576 42.8232 48.3464 41.3418C49.3352 39.8605 49.8624 38.1191 49.8614 36.3381C49.8575 33.9518 48.9075 31.6644 47.2196 29.9775C45.5317 28.2905 43.2438 27.3417 40.8575 27.3391Z" fill="#205EA3"/>
                <path opacity="0.15" d="M43.8314 30.8325C44.3238 31.7459 44.5793 32.7681 44.5748 33.8058C44.5695 35.464 43.9074 37.0526 42.7335 38.2238C41.5595 39.3949 39.9694 40.0532 38.3111 40.0545C37.2735 40.0591 36.2513 39.8035 35.3379 39.3112C35.8005 40.1708 36.4575 40.9103 37.2566 41.4709C38.0558 42.0314 38.9748 42.3974 39.9405 42.5397C40.9062 42.682 41.8918 42.5966 42.8186 42.2904C43.7455 41.9841 44.5879 41.4655 45.2787 40.7759C45.9696 40.0863 46.4897 39.2448 46.7975 38.3185C47.1054 37.3922 47.1925 36.4067 47.0519 35.4408C46.9113 34.4749 46.5469 33.5552 45.9877 32.755C45.4286 31.9549 44.6902 31.2966 43.8314 30.8325Z" fill="#5DABFF"/>
              </svg>
              <h3 className="audit-empty-title">No history to show yet</h3>
              <p className="audit-empty-desc">Activities will appear here as soon as changes are made. This log tracks <strong>data entry updates from imports, APIs, and manual entries</strong> as you work on the return.</p>
            </div>
          </>
        )}

        {auditScenario === 'with-entries' && (
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

      </div>
    </div>
  )
}
