import { useState } from 'react'
import { useAppContext } from '../index'
import './DuplicateModal.css'

export default function DuplicateModal() {
  const {
    duplicateReturnOpen,
    duplicateVersionId,
    duplicateVersion,
    setDuplicateOpen,
    getVersionById,
  } = useAppContext()

  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  if (!duplicateReturnOpen || !duplicateVersionId) return null

  const sourceVersion = getVersionById(duplicateVersionId)

  const handleCreate = () => {
    if (!name.trim()) return
    setCreating(true)
    setTimeout(() => {
      duplicateVersion(duplicateVersionId, name.trim())
      // Modal closes via state (duplicateReturnOpen → false); toast fires via store
      setName('')
      setCreating(false)
    }, 500)
  }

  const handleCancel = () => {
    setDuplicateOpen(false)
    setName('')
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) handleCancel() }}>
      <div className="modal duplicate-modal">
        <div className="modal-header">
          <h2>Duplicate return</h2>
          {sourceVersion && (
            <p className="duplicate-modal-source">
              Copying from: <strong>{sourceVersion.label}</strong>
            </p>
          )}
        </div>

        <div className="modal-body">
          <label className="duplicate-modal-label" htmlFor="dup-name">
            Return name
          </label>
          <input
            id="dup-name"
            type="text"
            className="duplicate-modal-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Jordan Wells 2025 — Copy"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            disabled={creating}
          />
          <p className="duplicate-modal-hint">
            A new browser tab will open with the copied return and a fresh activity log.
          </p>
        </div>

        <div className="modal-footer">
          <button className="modal-btn" onClick={handleCancel} disabled={creating}>
            Cancel
          </button>
          <button
            className="modal-btn primary"
            onClick={handleCreate}
            disabled={!name.trim() || creating}
          >
            {creating ? 'Creating…' : 'Create copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
