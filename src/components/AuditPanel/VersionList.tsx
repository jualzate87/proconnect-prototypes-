
import { useState } from 'react'
import { Version } from '../../types'
import VersionEntry from './VersionEntry'

const PAGE_SIZE = 10

interface ActivityListProps {
  versions: Version[]
}

const GROUP_ORDER = [
  'Today',
  'Yesterday',
  'Last 7 days',
  'Last 2 weeks',
  'Last 30 days',
  'Last 90 days',
  'This year',
  'Last year',
]

function getTimeGroup(timestamp: number): string {
  const DAY = 86400000

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayMs = todayStart.getTime()
  const yesterdayMs = todayMs - DAY

  if (timestamp >= todayMs) return 'Today'
  if (timestamp >= yesterdayMs) return 'Yesterday'
  if (timestamp >= todayMs - 7 * DAY) return 'Last 7 days'
  if (timestamp >= todayMs - 14 * DAY) return 'Last 2 weeks'
  if (timestamp >= todayMs - 30 * DAY) return 'Last 30 days'
  if (timestamp >= todayMs - 90 * DAY) return 'Last 90 days'

  const entryYear = new Date(timestamp).getFullYear()
  const currentYear = now.getFullYear()
  if (entryYear === currentYear) return 'This year'
  if (entryYear === currentYear - 1) return 'Last year'
  return 'Older'
}

export default function ActivityList({ versions }: ActivityListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visibleVersions = versions.slice(0, visibleCount)
  const hasMore = visibleCount < versions.length

  // Group visible versions by time bucket
  const groups: Record<string, Version[]> = {}
  for (const v of visibleVersions) {
    const group = getTimeGroup(v.timestamp)
    if (!groups[group]) groups[group] = []
    groups[group].push(v)
  }

  const activeGroups = GROUP_ORDER.filter(g => groups[g]?.length)

  return (
    <div className="version-list">
      {activeGroups.map(groupName => (
        <div key={groupName} className="activity-group">
          <div className="activity-group-label">{groupName}</div>
          {groups[groupName].map(version => (
            <VersionEntry key={version.id} version={version} />
          ))}
        </div>
      ))}
      {hasMore && (
        <button
          className="version-list-show-older"
          onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
        >
          Show older
          <svg viewBox="0 0 10 6" fill="none" width="10" height="10">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  )
}
