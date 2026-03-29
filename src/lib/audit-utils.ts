import { Version, TaxReturnData, Change, AuditLog } from '../types'

export function generateVersionId(): string {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createDiff(oldData: TaxReturnData, newData: TaxReturnData): Change[] {
  const changes: Change[] = []

  // Deep comparison of all fields
  const allKeys = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData || {})
  ])

  for (const section of allKeys) {
    const oldSection = (oldData as any)[section] || {}
    const newSection = (newData as any)[section] || {}

    const sectionKeys = new Set([
      ...Object.keys(oldSection || {}),
      ...Object.keys(newSection || {})
    ])

    for (const key of sectionKeys) {
      const oldValue = oldSection?.[key]
      const newValue = newSection?.[key]

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: `${section}.${key}`,
          oldValue,
          newValue
        })
      }
    }
  }

  return changes
}

export function generateChangeDescription(changes: Change[]): string {
  if (changes.length === 0) return 'No changes'
  if (changes.length === 1) {
    const change = changes[0]
    const fieldName = change.field.split('.')[1]
    return `Updated ${fieldName}: ${change.oldValue} → ${change.newValue}`
  }
  return `Updated ${changes.length} fields`
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  const date = new Date(timestamp)
  return date.toLocaleDateString()
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

export function createVersion(
  data: TaxReturnData,
  oldData: TaxReturnData,
  description: string,
  changeType: 'manual_entry' | 'document_import' | 'api_import' | 'revert' | 'copy' = 'manual_entry',
  author: string = 'You'
): Version {
  const changes = createDiff(oldData, data)

  return {
    id: generateVersionId(),
    timestamp: Date.now(),
    author,
    label: `Version ${new Date().toLocaleString()}`,
    changeType,
    description,
    dataSnapshot: data,
    changes
  }
}

export function saveAuditLogToStorage(auditLog: AuditLog): void {
  localStorage.setItem('proconnect_audit_log', JSON.stringify(auditLog))
}

export function loadAuditLogFromStorage(): AuditLog | null {
  const stored = localStorage.getItem('proconnect_audit_log')
  return stored ? JSON.parse(stored) : null
}

export function saveTaxDataToStorage(data: TaxReturnData): void {
  localStorage.setItem('proconnect_tax_data', JSON.stringify(data))
}

export function loadTaxDataFromStorage(): TaxReturnData | null {
  const stored = localStorage.getItem('proconnect_tax_data')
  return stored ? JSON.parse(stored) : null
}
