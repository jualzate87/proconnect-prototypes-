
import { Version } from '../../types'
import { useAppContext } from '../../index'

interface ActionMenuProps {
  version: Version
  onClose: () => void
}

export default function ActionMenu({ version, onClose }: ActionMenuProps) {
  const {
    auditLog,
    setRenameVersionId,
    openDuplicate,
    previewVersion,
    revertToVersion
  } = useAppContext()

  const isCurrent = version.id === auditLog.currentVersionId

  const handleRename = () => {
    setRenameVersionId(version.id)
    onClose()
  }

  const handleDuplicate = () => {
    openDuplicate(version.id)
    onClose()
  }

  const handlePreview = () => {
    previewVersion(version.id)
    onClose()
  }

  const handleRevert = () => {
    if (confirm(`Are you sure you want to revert to "${version.label}"?`)) {
      revertToVersion(version.id)
      onClose()
    }
  }

  return (
    <div className="action-menu">
      <button className="action-menu-item" onClick={handleRename}>
        ✎ Rename
      </button>
      <button className="action-menu-item" onClick={handleDuplicate}>
        ⎘ Duplicate
      </button>
      <button className="action-menu-item" onClick={handlePreview}>
        ⊙ Preview
      </button>
      {!isCurrent && (
        <button className="action-menu-item danger" onClick={handleRevert}>
          ↶ Revert
        </button>
      )}
    </div>
  )
}
