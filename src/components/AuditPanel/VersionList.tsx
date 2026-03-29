
import { Version } from '../../types'
import VersionEntry from './VersionEntry'

interface ActivityListProps {
  versions: Version[]
}

const GROUP_ORDER = [
  'Today',
  'Yesterday',
  'Last 7 days',
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
  if (timestamp >= todayMs - 30 * DAY) return 'Last 30 days'
  if (timestamp >= todayMs - 90 * DAY) return 'Last 90 days'

  const entryYear = new Date(timestamp).getFullYear()
  const currentYear = now.getFullYear()
  if (entryYear === currentYear) return 'This year'
  if (entryYear === currentYear - 1) return 'Last year'
  return 'Older'
}

export default function ActivityList({ versions }: ActivityListProps) {
  // Group versions by time bucket
  const groups: Record<string, Version[]> = {}

  for (const v of versions) {
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
    </div>
  )
}
