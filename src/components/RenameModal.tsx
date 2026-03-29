import { useState, useEffect } from 'react'
import { useAppContext } from '../index'

export default function RenameModal() {
  const { renameVersionId, getVersionById, renameVersion, setRenameVersionId } = useAppContext()
  const [newLabel, setNewLabel] = useState('')

  const version = renameVersionId ? getVersionById(renameVersionId) : null

  useEffect(() => {
    if (version) {
      setNewLabel(version.label)
    }
  }, [version])

  if (!version || !renameVersionId) return null

  const handleSave = () => {
    if (newLabel.trim()) {
      renameVersion(renameVersionId, newLabel.trim())
      setRenameVersionId(null)
    }
  }

  const handleCancel = () => {
    setRenameVersionId(null)
  }

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rename Version</h2>
        </div>

        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label htmlFor="newLabel">Version Label</label>
            <input
              id="newLabel"
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter a new name for this version"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="modal-btn primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
