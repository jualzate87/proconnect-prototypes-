import { createContext } from 'react'
import { TaxReturnData, AuditLog, FilterState, ScreenName, Version } from '../types'
import {
  createVersion,
  saveAuditLogToStorage,
  loadAuditLogFromStorage,
  saveTaxDataToStorage,
  loadTaxDataFromStorage,
  generateChangeDescription,
  generateVersionId,
} from './audit-utils'
import { initialTaxData, createInitialAuditLog, SCHEMA_VER, getChangeTypeColor, SECTION_DISPLAY } from './mock-data'

// ── Helper: derive the best screen to navigate to from related fields ─────────
function getScreenForFields(fields: string[]): ScreenName {
  const sections = new Set(fields.map(f => f.split('.')[0]))
  if (sections.has('income'))     return 'income'
  if (sections.has('interest'))   return 'interest'
  if (sections.has('investment')) return 'invest'
  if (sections.has('other'))      return 'others'
  return 'income'
}

export interface AppState {
  taxData: TaxReturnData
  auditLog: AuditLog
  currentScreen: ScreenName
  filters: FilterState
  previewVersionId: string | null
  renameVersionId: string | null
  duplicateReturnOpen: boolean
  duplicateVersionId: string | null
  isAuditPanelOpen: boolean
  highlightedFields: string[]
  highlightColor: string
  toast: string | null
  returnName: string
}

export interface AppActions {
  updateTaxData: (section: keyof TaxReturnData, data: any) => void
  setCurrentScreen: (screen: ScreenName) => void
  setAuditPanelOpen: (open: boolean) => void
  setToast: (message: string | null) => void
  renameVersion: (versionId: string, newLabel: string) => void
  duplicateVersion: (versionId: string, returnName: string) => void
  openDuplicate: (versionId: string) => void
  setDuplicateOpen: (open: boolean) => void
  previewVersion: (versionId: string | null) => void
  revertToVersion: (versionId: string) => void
  undoChange: (versionId: string) => void
  setRenameVersionId: (versionId: string | null) => void
  setFilters: (filters: FilterState) => void
  clearFilters: () => void
  setHighlight: (fields: string[], color: string) => void
  clearHighlight: () => void
  getVisibleVersions: () => Version[]
  getCurrentVersion: () => Version | undefined
  getVersionById: (versionId: string) => Version | undefined
}

export interface AppContextType extends AppState, AppActions {
  /** Snapshot data in preview mode; live taxData otherwise */
  displayTaxData: TaxReturnData
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export function initializeAppState(): AppState {
  // ── If this tab was opened as a return copy, bootstrap from the pending copy ──
  const isCopyTab = new URLSearchParams(window.location.search).has('copy')
  const pendingRaw = localStorage.getItem('proconnect_copy_pending')
  if (isCopyTab && pendingRaw) {
    try {
      const pending = JSON.parse(pendingRaw) as {
        returnName: string
        taxData: TaxReturnData
        auditLog: AuditLog
        timestamp: number
      }
      // Only consume if fresh (< 30 s old — guards against stale entries)
      if (Date.now() - pending.timestamp < 30000) {
        localStorage.removeItem('proconnect_copy_pending')
        document.title = `${pending.returnName} — Input`
        return {
          taxData: pending.taxData,
          auditLog: pending.auditLog,
          currentScreen: 'income',
          filters: {},
          previewVersionId: null,
          renameVersionId: null,
          duplicateReturnOpen: false,
          duplicateVersionId: null,
          isAuditPanelOpen: false,
          highlightedFields: [],
          highlightColor: '',
          toast: null,
          returnName: pending.returnName,
        }
      }
    } catch { /* ignore parse errors */ }
  }

  const savedLog  = loadAuditLogFromStorage()
  const savedData = loadTaxDataFromStorage()

  const isSchemaStale = !savedLog || (savedLog as any).schemaVersion !== SCHEMA_VER

  const taxData: TaxReturnData = isSchemaStale
    ? initialTaxData
    : (savedData
        ? { ...savedData, income: { ...initialTaxData.income, ...savedData.income } } as TaxReturnData
        : initialTaxData)

  const auditLog = isSchemaStale ? createInitialAuditLog() : savedLog!

  if (isSchemaStale) {
    saveTaxDataToStorage(taxData)
    saveAuditLogToStorage(auditLog)
  }

  return {
    taxData,
    auditLog,
    currentScreen: 'income',
    filters: {},
    previewVersionId: null,
    renameVersionId: null,
    duplicateReturnOpen: false,
    duplicateVersionId: null,
    isAuditPanelOpen: false,
    highlightedFields: [],
    highlightColor: '',
    toast: null,
    returnName: 'Jordan Wells',
  }
}

export function createAppStore(_initialState: AppState) {
  return {
    actions: {
      updateTaxData: (state: AppState, section: keyof TaxReturnData, data: any): AppState => {
        const oldData = state.taxData
        const newData = { ...state.taxData, [section]: data }

        const changes = createVersion(
          newData,
          oldData,
          generateChangeDescription(
            Object.entries(data).map(([key, value]) => ({
              field: `${section}.${key}`,
              oldValue: (oldData[section] as any)?.[key],
              newValue: value
            }))
          ),
          'manual_entry'
        )

        const newAuditLog = {
          ...state.auditLog,
          versions: [...state.auditLog.versions, changes],
          currentVersionId: changes.id,
          lastModified: Date.now(),
          schemaVersion: SCHEMA_VER,
        }

        saveTaxDataToStorage(newData)
        saveAuditLogToStorage(newAuditLog)

        return { ...state, taxData: newData, auditLog: newAuditLog }
      },

      setCurrentScreen: (state: AppState, screen: ScreenName): AppState => ({
        ...state, currentScreen: screen
      }),

      setAuditPanelOpen: (state: AppState, open: boolean): AppState => ({
        ...state, isAuditPanelOpen: open
      }),

      renameVersion: (state: AppState, versionId: string, newLabel: string): AppState => {
        const versions = state.auditLog.versions.map(v =>
          v.id === versionId ? { ...v, label: newLabel } : v
        )
        const newAuditLog = { ...state.auditLog, versions, lastModified: Date.now() }
        saveAuditLogToStorage(newAuditLog)
        return { ...state, auditLog: newAuditLog, renameVersionId: null }
      },

      openDuplicate: (state: AppState, versionId: string): AppState => ({
        ...state, duplicateReturnOpen: true, duplicateVersionId: versionId
      }),

      setDuplicateOpen: (state: AppState, open: boolean): AppState => ({
        ...state,
        duplicateReturnOpen: open,
        duplicateVersionId: open ? state.duplicateVersionId : null,
      }),

      duplicateVersion: (state: AppState, versionId: string, returnName: string): AppState => {
        const sourceVersion = state.auditLog.versions.find(v => v.id === versionId)
        if (!sourceVersion) return state

        const now = Date.now()

        // ── Build the new tab's fresh audit log (single entry) ──────────────────
        const copyEntry: Version = {
          id: generateVersionId(),
          timestamp: now,
          author: 'You',
          label: 'Return copy created',
          changeType: 'copy',
          description: `Return copy created from "${sourceVersion.label}"`,
          dataSnapshot: sourceVersion.dataSnapshot,
          changes: [],
        }
        const copyAuditLog: AuditLog = {
          versions: [copyEntry],
          currentVersionId: copyEntry.id,
          createdAt: now,
          lastModified: now,
          schemaVersion: SCHEMA_VER,
        }

        // ── Write pending copy for the new tab to pick up ──────────────────────
        localStorage.setItem('proconnect_copy_pending', JSON.stringify({
          returnName,
          taxData: sourceVersion.dataSnapshot,
          auditLog: copyAuditLog,
          timestamp: now,
        }))

        // ── Open the new tab ────────────────────────────────────────────────────
        const base = window.location.href.split('?')[0]
        window.open(`${base}?copy=1`, '_blank')

        // ── Log the copy in the ORIGINAL return's audit log ────────────────────
        const logEntry: Version = {
          id: generateVersionId(),
          timestamp: now,
          author: 'You',
          label: `Copy: ${returnName}`,
          changeType: 'copy',
          description: `Return copy "${returnName}" created`,
          dataSnapshot: state.taxData,
          changes: [],
        }

        const newAuditLog = {
          ...state.auditLog,
          versions: [...state.auditLog.versions, logEntry],
          lastModified: now,
          schemaVersion: SCHEMA_VER,
        }

        saveAuditLogToStorage(newAuditLog)

        return {
          ...state,
          auditLog: newAuditLog,
          duplicateReturnOpen: false,
          duplicateVersionId: null,
          toast: `"${returnName}" copy created successfully`,
        }
      },

      previewVersion: (state: AppState, versionId: string | null): AppState => {
        if (versionId === null) {
          // Exit preview — clear highlights, keep current screen
          return {
            ...state,
            previewVersionId: null,
            highlightedFields: [],
            highlightColor: '',
          }
        }
        const version = state.auditLog.versions.find(v => v.id === versionId)
        if (!version) return { ...state, previewVersionId: versionId }

        const fields = version.relatedFields || []
        const color  = getChangeTypeColor(version.changeType)
        const screen = getScreenForFields(fields)

        return {
          ...state,
          previewVersionId: versionId,
          currentScreen: screen,
          highlightedFields: fields,
          highlightColor: color,
        }
      },

      revertToVersion: (state: AppState, versionId: string): AppState => {
        const sourceVersion = state.auditLog.versions.find(v => v.id === versionId)
        if (!sourceVersion) return state

        const revertVersion = createVersion(
          sourceVersion.dataSnapshot,
          state.taxData,
          `Restored to "${sourceVersion.label}"`,
          'revert'
        )
        revertVersion.author = 'You'

        const newAuditLog = {
          ...state.auditLog,
          versions: [...state.auditLog.versions, revertVersion],
          currentVersionId: revertVersion.id,
          lastModified: Date.now(),
          schemaVersion: SCHEMA_VER,
        }

        saveTaxDataToStorage(sourceVersion.dataSnapshot)
        saveAuditLogToStorage(newAuditLog)

        return {
          ...state,
          taxData: sourceVersion.dataSnapshot,
          auditLog: newAuditLog,
          previewVersionId: null,  // exit preview after restore
          highlightedFields: [],
          highlightColor: '',
        }
      },

      undoChange: (state: AppState, versionId: string): AppState => {
        const version = state.auditLog.versions.find(v => v.id === versionId)
        if (!version?.changes?.length) return state

        // Surgically patch current taxData — only the fields from this version's changes
        let newData: TaxReturnData = { ...state.taxData }
        for (const change of version.changes) {
          const [section, field] = change.field.split('.')
          const sectionKey = section as keyof TaxReturnData
          newData = {
            ...newData,
            [sectionKey]: {
              ...(newData[sectionKey] as Record<string, unknown>),
              [field]: change.oldValue,
            },
          }
        }

        const undoEntry: Version = {
          id: generateVersionId(),
          timestamp: Date.now(),
          author: 'You',
          label: `Undid: ${version.label}`,
          changeType: 'revert',
          description: `Undid changes from "${version.label}"`,
          dataSnapshot: newData,
          changes: version.changes.map(c => ({ field: c.field, oldValue: c.newValue, newValue: c.oldValue })),
          relatedFields: version.relatedFields,
        }

        const newAuditLog = {
          ...state.auditLog,
          versions: [...state.auditLog.versions, undoEntry],
          currentVersionId: undoEntry.id,
          lastModified: Date.now(),
          schemaVersion: SCHEMA_VER,
        }

        saveTaxDataToStorage(newData)
        saveAuditLogToStorage(newAuditLog)

        return {
          ...state,
          taxData: newData,
          auditLog: newAuditLog,
          toast: `Undid "${version.label}"`,
        }
      },

      setRenameVersionId: (state: AppState, versionId: string | null): AppState => ({
        ...state, renameVersionId: versionId
      }),

      setFilters: (state: AppState, filters: FilterState): AppState => ({
        ...state, filters
      }),

      clearFilters: (state: AppState): AppState => ({
        ...state, filters: {}
      }),

      setToast: (state: AppState, message: string | null): AppState => ({
        ...state, toast: message
      }),

      setHighlight: (state: AppState, fields: string[], color: string): AppState => ({
        ...state, highlightedFields: fields, highlightColor: color
      }),

      clearHighlight: (state: AppState): AppState => ({
        ...state, highlightedFields: [], highlightColor: ''
      }),

      getVisibleVersions: (state: AppState): Version[] => {
        let visible = state.auditLog.versions

        if (state.filters.dateFrom) {
          visible = visible.filter(v => v.timestamp >= state.filters.dateFrom!)
        }
        if (state.filters.dateTo) {
          const end = state.filters.dateTo + 86400000
          visible = visible.filter(v => v.timestamp <= end)
        }
        if (state.filters.author) {
          visible = visible.filter(v => v.author === state.filters.author)
        }
        if (state.filters.changeType) {
          visible = visible.filter(v => v.changeType === state.filters.changeType)
        }
        if (state.filters.searchQuery) {
          const q = state.filters.searchQuery.toLowerCase()
          visible = visible.filter(v =>
            v.description.toLowerCase().includes(q) ||
            v.author.toLowerCase().includes(q) ||
            v.label.toLowerCase().includes(q) ||
            (v.apiSource || '').toLowerCase().includes(q) ||
            (v.relatedFields || []).some(f => {
              const section = f.split('.')[0]
              const name = SECTION_DISPLAY[section] || section
              return name.toLowerCase().includes(q)
            })
          )
        }

        return visible.sort((a, b) => b.timestamp - a.timestamp)
      },

      getCurrentVersion: (state: AppState): Version | undefined =>
        state.auditLog.versions.find(v => v.id === state.auditLog.currentVersionId),

      getVersionById: (state: AppState, versionId: string): Version | undefined =>
        state.auditLog.versions.find(v => v.id === versionId),
    }
  }
}
