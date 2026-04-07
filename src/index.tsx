import React, { useState, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import { AppContext, AppContextType, initializeAppState, createAppStore } from './lib/store'
import AppLayout from './components/AppLayout'
import './index.css'

function App() {
  const initialState = initializeAppState()
  const store = createAppStore(initialState)
  const [state, setState] = useState(initialState)

  // Compute display data: show snapshot in preview mode, live data otherwise
  const displayTaxData = state.previewVersionId
    ? (state.auditLog.versions.find(v => v.id === state.previewVersionId)?.dataSnapshot ?? state.taxData)
    : state.taxData

  const contextValue: AppContextType = {
    ...state,
    displayTaxData,

    updateTaxData: (section, data) => {
      setState(prev => store.actions.updateTaxData(prev, section, data))
    },
    setCurrentScreen: (screen) => {
      setState(prev => store.actions.setCurrentScreen(prev, screen))
    },
    setAuditPanelOpen: (open) => {
      setState(prev => store.actions.setAuditPanelOpen(prev, open))
    },
    renameVersion: (versionId, newLabel) => {
      setState(prev => store.actions.renameVersion(prev, versionId, newLabel))
    },
    openDuplicate: (versionId) => {
      setState(prev => store.actions.openDuplicate(prev, versionId))
    },
    setDuplicateOpen: (open) => {
      setState(prev => store.actions.setDuplicateOpen(prev, open))
    },
    duplicateVersion: (versionId, returnName) => {
      setState(prev => store.actions.duplicateVersion(prev, versionId, returnName))
    },
    previewVersion: (versionId) => {
      setState(prev => store.actions.previewVersion(prev, versionId))
    },
    revertToVersion: (versionId) => {
      setState(prev => store.actions.revertToVersion(prev, versionId))
    },
    undoChange: (versionId) => {
      setState(prev => store.actions.undoChange(prev, versionId))
    },
    setRenameVersionId: (versionId) => {
      setState(prev => store.actions.setRenameVersionId(prev, versionId))
    },
    setFilters: (filters) => {
      setState(prev => store.actions.setFilters(prev, filters))
    },
    clearFilters: () => {
      setState(prev => store.actions.clearFilters(prev))
    },
    setHighlight: (fields, color) => {
      setState(prev => store.actions.setHighlight(prev, fields, color))
    },
    clearHighlight: () => {
      setState(prev => store.actions.clearHighlight(prev))
    },
    setToast: (message) => {
      setState(prev => store.actions.setToast(prev, message))
    },
    getVisibleVersions: () => store.actions.getVisibleVersions(state),
    getCurrentVersion: () => store.actions.getCurrentVersion(state),
    getVersionById: (versionId) => store.actions.getVersionById(state, versionId),
  }

  return (
    <AppContext.Provider value={contextValue}>
      <AppLayout />
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppContext.Provider')
  return context
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
