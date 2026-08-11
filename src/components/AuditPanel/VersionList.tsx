
import { useState } from 'react'
import { Version } from '../../types'
import { groupVersionsByTime } from '../../lib/time-groups'
import VersionEntry from './VersionEntry'

const PAGE_SIZE = 10

interface ActivityListProps {
  versions: Version[]
}

export default function ActivityList({ versions }: ActivityListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visibleVersions = versions.slice(0, visibleCount)
  const hasMore = visibleCount < versions.length
  const timeGroups = groupVersionsByTime(visibleVersions)

  return (
    <div className="version-list">
      {timeGroups.map(group => (
        <div key={group.key} className="activity-group">
          <div className="activity-group-label">{group.label}</div>
          {group.items.map(version => (
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
