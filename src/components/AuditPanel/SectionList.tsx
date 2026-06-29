import { useState } from 'react'
import { Version } from '../../types'
import { SECTION_DISPLAY, getChangeTypeColor } from '../../lib/mock-data'
import VersionEntry from './VersionEntry'

const PAGE_SIZE = 20

interface SectionListProps {
  versions: Version[]
}

interface SectionSummary {
  key: string
  displayName: string
  versions: Version[]
  lastModified: number
  lastAuthor: string
  changeCount: number
  typeBadges: string[]
}

function getSections(versions: Version[]): SectionSummary[] {
  const sectionMap: Record<string, Version[]> = {}

  for (const v of versions) {
    const fields = v.relatedFields ?? []
    const sectionKeys = [...new Set(fields.map(f => f.split('.')[0]))]

    if (sectionKeys.length === 0) {
      // Entries with no relatedFields (e.g. revert/undo) — bucket by 'other'
      const key = 'other'
      if (!sectionMap[key]) sectionMap[key] = []
      if (!sectionMap[key].includes(v)) sectionMap[key].push(v)
    } else {
      for (const key of sectionKeys) {
        if (!sectionMap[key]) sectionMap[key] = []
        sectionMap[key].push(v)
      }
    }
  }

  return Object.entries(sectionMap)
    .map(([key, sectionVersions]) => {
      const sorted = [...sectionVersions].sort((a, b) => b.timestamp - a.timestamp)
      const types = [...new Set(sorted.map(v => {
        const isUndo = v.changeType === 'revert' && v.label.startsWith('Undid:')
        return isUndo ? 'undo' : v.changeType
      }))]
      return {
        key,
        displayName: SECTION_DISPLAY[key] || key,
        versions: sorted,
        lastModified: sorted[0].timestamp,
        lastAuthor: sorted[0].author,
        changeCount: sorted.length,
        typeBadges: types,
      }
    })
    .sort((a, b) => b.lastModified - a.lastModified)
}

function formatRelativeDate(ts: number): string {
  const DAY = 86400000
  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const diff = todayStart.getTime() - ts

  if (ts >= todayStart.getTime()) return 'Today'
  if (diff < DAY)   return 'Yesterday'
  if (diff < 7  * DAY) return `${Math.floor(diff / DAY)}d ago`
  if (diff < 30 * DAY) return `${Math.floor(diff / (7 * DAY))}w ago`
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const TYPE_LABELS: Record<string, string> = {
  manual_entry:    'Manual',
  document_import: 'Import',
  api_import:      'API',
  revert:          'Restore',
  undo:            'Undo',
  copy:            'Copy',
}

interface SectionRowProps {
  section: SectionSummary
  onDrillIn: (key: string) => void
}

function SectionRow({ section, onDrillIn }: SectionRowProps) {
  return (
    <button className="section-row" onClick={() => onDrillIn(section.key)}>
      <div className="section-row-left">
        <span className="section-row-name">{section.displayName}</span>
        <div className="section-row-meta">
          <span className="section-row-count">
            {section.changeCount} {section.changeCount === 1 ? 'change' : 'changes'}
          </span>
          <span className="section-row-sep">·</span>
          <span className="section-row-author">{section.lastAuthor}</span>
          <span className="section-row-sep">·</span>
          <span className="section-row-date">{formatRelativeDate(section.lastModified)}</span>
        </div>
        <div className="section-row-badges">
          {section.typeBadges.map(type => {
            const isUndo = type === 'undo'
            const color = getChangeTypeColor(isUndo ? 'revert' : type, isUndo)
            return (
              <span
                key={type}
                className="entry-type-badge"
                style={{
                  background:  color,
                  color:       '#ffffff',
                  borderColor: 'transparent',
                }}
              >
                {TYPE_LABELS[type] || type}
              </span>
            )
          })}
        </div>
      </div>
      <svg viewBox="0 0 12 12" fill="none" width="12" height="12" className="section-row-chevron">
        <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

interface DrillDownProps {
  section: SectionSummary
  onBack: () => void
}

const TIME_GROUP_ORDER = [
  'Today', 'Yesterday', 'Last 7 days', 'Last 2 weeks', 'Last 30 days',
  'Last 90 days', 'This year', 'Last year', 'Older',
]

function getTimeGroup(timestamp: number): string {
  const DAY = 86400000
  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayMs = todayStart.getTime()
  if (timestamp >= todayMs)              return 'Today'
  if (timestamp >= todayMs - DAY)        return 'Yesterday'
  if (timestamp >= todayMs - 7  * DAY)  return 'Last 7 days'
  if (timestamp >= todayMs - 14 * DAY)  return 'Last 2 weeks'
  if (timestamp >= todayMs - 30 * DAY)  return 'Last 30 days'
  if (timestamp >= todayMs - 90 * DAY)  return 'Last 90 days'
  const entryYear = new Date(timestamp).getFullYear()
  const currentYear = now.getFullYear()
  if (entryYear === currentYear)     return 'This year'
  if (entryYear === currentYear - 1) return 'Last year'
  return 'Older'
}

function DrillDown({ section, onBack }: DrillDownProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visible = section.versions.slice(0, visibleCount)
  const hasMore = visibleCount < section.versions.length

  const groups: Record<string, Version[]> = {}
  for (const v of visible) {
    const g = getTimeGroup(v.timestamp)
    if (!groups[g]) groups[g] = []
    groups[g].push(v)
  }
  const activeGroups = TIME_GROUP_ORDER.filter(g => groups[g]?.length)

  return (
    <div className="section-drilldown">
      <button className="section-back-btn" onClick={onBack}>
        <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
          <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        All sections
      </button>
      <div className="section-drilldown-header">
        <span className="section-drilldown-title">{section.displayName}</span>
        <span className="section-drilldown-count">{section.changeCount} {section.changeCount === 1 ? 'change' : 'changes'}</span>
      </div>
      <div className="version-list">
        {activeGroups.map(groupName => (
          <div key={groupName} className="activity-group">
            <div className="activity-group-label">{groupName}</div>
            {groups[groupName].map(v => (
              <VersionEntry key={v.id} version={v} />
            ))}
          </div>
        ))}
        {hasMore && (
          <button
            className="version-list-show-older"
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
          >
            Show more
            <svg viewBox="0 0 10 6" fill="none" width="10" height="10">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default function SectionList({ versions }: SectionListProps) {
  const [activeSectionKey, setActiveSectionKey] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const sections = getSections(versions)
  const activeSection = activeSectionKey ? sections.find(s => s.key === activeSectionKey) : null

  if (activeSection) {
    return <DrillDown section={activeSection} onBack={() => setActiveSectionKey(null)} />
  }

  const visibleSections = sections.slice(0, visibleCount)
  const hasMore = visibleCount < sections.length

  return (
    <div className="section-list">
      {visibleSections.map(section => (
        <SectionRow key={section.key} section={section} onDrillIn={setActiveSectionKey} />
      ))}
      {hasMore && (
        <button
          className="version-list-show-older"
          onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
        >
          Show more
          <svg viewBox="0 0 10 6" fill="none" width="10" height="10">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  )
}
