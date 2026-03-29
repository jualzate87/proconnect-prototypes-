import { createContext } from 'react';
import { createVersion, saveAuditLogToStorage, loadAuditLogFromStorage, saveTaxDataToStorage, loadTaxDataFromStorage, generateChangeDescription, generateVersionId, } from './audit-utils';
import { initialTaxData, createInitialAuditLog, SCHEMA_VER, getChangeTypeColor, SECTION_DISPLAY } from './mock-data';
// ── Helper: derive the best screen to navigate to from related fields ─────────
function getScreenForFields(fields) {
    const sections = new Set(fields.map(f => f.split('.')[0]));
    if (sections.has('income'))
        return 'income';
    if (sections.has('interest'))
        return 'interest';
    if (sections.has('investment'))
        return 'invest';
    if (sections.has('other'))
        return 'others';
    return 'income';
}
export const AppContext = createContext(undefined);
export function initializeAppState() {
    // ── If this tab was opened as a return copy, bootstrap from the pending copy ──
    const isCopyTab = new URLSearchParams(window.location.search).has('copy');
    const pendingRaw = localStorage.getItem('proconnect_copy_pending');
    if (isCopyTab && pendingRaw) {
        try {
            const pending = JSON.parse(pendingRaw);
            // Only consume if fresh (< 30 s old — guards against stale entries)
            if (Date.now() - pending.timestamp < 30000) {
                localStorage.removeItem('proconnect_copy_pending');
                document.title = `${pending.returnName} — Input`;
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
                };
            }
        }
        catch { /* ignore parse errors */ }
    }
    const savedLog = loadAuditLogFromStorage();
    const savedData = loadTaxDataFromStorage();
    const isSchemaStale = !savedLog || savedLog.schemaVersion !== SCHEMA_VER;
    const taxData = isSchemaStale
        ? initialTaxData
        : (savedData
            ? { ...savedData, income: { ...initialTaxData.income, ...savedData.income } }
            : initialTaxData);
    const auditLog = isSchemaStale ? createInitialAuditLog() : savedLog;
    if (isSchemaStale) {
        saveTaxDataToStorage(taxData);
        saveAuditLogToStorage(auditLog);
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
    };
}
export function createAppStore(_initialState) {
    return {
        actions: {
            updateTaxData: (state, section, data) => {
                const oldData = state.taxData;
                const newData = { ...state.taxData, [section]: data };
                const changes = createVersion(newData, oldData, generateChangeDescription(Object.entries(data).map(([key, value]) => ({
                    field: `${section}.${key}`,
                    oldValue: oldData[section]?.[key],
                    newValue: value
                }))), 'manual_entry');
                const newAuditLog = {
                    ...state.auditLog,
                    versions: [...state.auditLog.versions, changes],
                    currentVersionId: changes.id,
                    lastModified: Date.now(),
                    schemaVersion: SCHEMA_VER,
                };
                saveTaxDataToStorage(newData);
                saveAuditLogToStorage(newAuditLog);
                return { ...state, taxData: newData, auditLog: newAuditLog };
            },
            setCurrentScreen: (state, screen) => ({
                ...state, currentScreen: screen
            }),
            setAuditPanelOpen: (state, open) => ({
                ...state, isAuditPanelOpen: open
            }),
            renameVersion: (state, versionId, newLabel) => {
                const versions = state.auditLog.versions.map(v => v.id === versionId ? { ...v, label: newLabel } : v);
                const newAuditLog = { ...state.auditLog, versions, lastModified: Date.now() };
                saveAuditLogToStorage(newAuditLog);
                return { ...state, auditLog: newAuditLog, renameVersionId: null };
            },
            openDuplicate: (state, versionId) => ({
                ...state, duplicateReturnOpen: true, duplicateVersionId: versionId
            }),
            setDuplicateOpen: (state, open) => ({
                ...state,
                duplicateReturnOpen: open,
                duplicateVersionId: open ? state.duplicateVersionId : null,
            }),
            duplicateVersion: (state, versionId, returnName) => {
                const sourceVersion = state.auditLog.versions.find(v => v.id === versionId);
                if (!sourceVersion)
                    return state;
                const now = Date.now();
                // ── Build the new tab's fresh audit log (single entry) ──────────────────
                const copyEntry = {
                    id: generateVersionId(),
                    timestamp: now,
                    author: 'You',
                    label: 'Return copy created',
                    changeType: 'copy',
                    description: `Return copy created from "${sourceVersion.label}"`,
                    dataSnapshot: sourceVersion.dataSnapshot,
                    changes: [],
                };
                const copyAuditLog = {
                    versions: [copyEntry],
                    currentVersionId: copyEntry.id,
                    createdAt: now,
                    lastModified: now,
                    schemaVersion: SCHEMA_VER,
                };
                // ── Write pending copy for the new tab to pick up ──────────────────────
                localStorage.setItem('proconnect_copy_pending', JSON.stringify({
                    returnName,
                    taxData: sourceVersion.dataSnapshot,
                    auditLog: copyAuditLog,
                    timestamp: now,
                }));
                // ── Open the new tab ────────────────────────────────────────────────────
                const base = window.location.href.split('?')[0];
                window.open(`${base}?copy=1`, '_blank');
                // ── Log the copy in the ORIGINAL return's audit log ────────────────────
                const logEntry = {
                    id: generateVersionId(),
                    timestamp: now,
                    author: 'You',
                    label: `Copy: ${returnName}`,
                    changeType: 'copy',
                    description: `Return copy "${returnName}" created`,
                    dataSnapshot: state.taxData,
                    changes: [],
                };
                const newAuditLog = {
                    ...state.auditLog,
                    versions: [...state.auditLog.versions, logEntry],
                    lastModified: now,
                    schemaVersion: SCHEMA_VER,
                };
                saveAuditLogToStorage(newAuditLog);
                return {
                    ...state,
                    auditLog: newAuditLog,
                    duplicateReturnOpen: false,
                    duplicateVersionId: null,
                    toast: `"${returnName}" copy created successfully`,
                };
            },
            previewVersion: (state, versionId) => {
                if (versionId === null) {
                    // Exit preview — clear highlights, keep current screen
                    return {
                        ...state,
                        previewVersionId: null,
                        highlightedFields: [],
                        highlightColor: '',
                    };
                }
                const version = state.auditLog.versions.find(v => v.id === versionId);
                if (!version)
                    return { ...state, previewVersionId: versionId };
                const fields = version.relatedFields || [];
                const color = getChangeTypeColor(version.changeType);
                const screen = getScreenForFields(fields);
                return {
                    ...state,
                    previewVersionId: versionId,
                    currentScreen: screen,
                    highlightedFields: fields,
                    highlightColor: color,
                };
            },
            revertToVersion: (state, versionId) => {
                const sourceVersion = state.auditLog.versions.find(v => v.id === versionId);
                if (!sourceVersion)
                    return state;
                const revertVersion = createVersion(sourceVersion.dataSnapshot, state.taxData, `Restored to "${sourceVersion.label}"`, 'revert');
                revertVersion.author = 'You';
                const newAuditLog = {
                    ...state.auditLog,
                    versions: [...state.auditLog.versions, revertVersion],
                    currentVersionId: revertVersion.id,
                    lastModified: Date.now(),
                    schemaVersion: SCHEMA_VER,
                };
                saveTaxDataToStorage(sourceVersion.dataSnapshot);
                saveAuditLogToStorage(newAuditLog);
                return {
                    ...state,
                    taxData: sourceVersion.dataSnapshot,
                    auditLog: newAuditLog,
                    previewVersionId: null, // exit preview after restore
                    highlightedFields: [],
                    highlightColor: '',
                };
            },
            setRenameVersionId: (state, versionId) => ({
                ...state, renameVersionId: versionId
            }),
            setFilters: (state, filters) => ({
                ...state, filters
            }),
            clearFilters: (state) => ({
                ...state, filters: {}
            }),
            setToast: (state, message) => ({
                ...state, toast: message
            }),
            setHighlight: (state, fields, color) => ({
                ...state, highlightedFields: fields, highlightColor: color
            }),
            clearHighlight: (state) => ({
                ...state, highlightedFields: [], highlightColor: ''
            }),
            getVisibleVersions: (state) => {
                let visible = state.auditLog.versions;
                if (state.filters.dateFrom) {
                    visible = visible.filter(v => v.timestamp >= state.filters.dateFrom);
                }
                if (state.filters.dateTo) {
                    const end = state.filters.dateTo + 86400000;
                    visible = visible.filter(v => v.timestamp <= end);
                }
                if (state.filters.author) {
                    visible = visible.filter(v => v.author === state.filters.author);
                }
                if (state.filters.changeType) {
                    visible = visible.filter(v => v.changeType === state.filters.changeType);
                }
                if (state.filters.searchQuery) {
                    const q = state.filters.searchQuery.toLowerCase();
                    visible = visible.filter(v => v.description.toLowerCase().includes(q) ||
                        v.author.toLowerCase().includes(q) ||
                        v.label.toLowerCase().includes(q) ||
                        (v.apiSource || '').toLowerCase().includes(q) ||
                        (v.relatedFields || []).some(f => {
                            const section = f.split('.')[0];
                            const name = SECTION_DISPLAY[section] || section;
                            return name.toLowerCase().includes(q);
                        }));
                }
                return visible.sort((a, b) => b.timestamp - a.timestamp);
            },
            getCurrentVersion: (state) => state.auditLog.versions.find(v => v.id === state.auditLog.currentVersionId),
            getVersionById: (state, versionId) => state.auditLog.versions.find(v => v.id === versionId),
        }
    };
}
