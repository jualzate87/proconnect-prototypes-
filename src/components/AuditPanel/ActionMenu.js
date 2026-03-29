import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from '../../index';
export default function ActionMenu({ version, onClose }) {
    const { auditLog, setRenameVersionId, openDuplicate, previewVersion, revertToVersion } = useAppContext();
    const isCurrent = version.id === auditLog.currentVersionId;
    const handleRename = () => {
        setRenameVersionId(version.id);
        onClose();
    };
    const handleDuplicate = () => {
        openDuplicate(version.id);
        onClose();
    };
    const handlePreview = () => {
        previewVersion(version.id);
        onClose();
    };
    const handleRevert = () => {
        if (confirm(`Are you sure you want to revert to "${version.label}"?`)) {
            revertToVersion(version.id);
            onClose();
        }
    };
    return (_jsxs("div", { className: "action-menu", children: [_jsx("button", { className: "action-menu-item", onClick: handleRename, children: "\u270E Rename" }), _jsx("button", { className: "action-menu-item", onClick: handleDuplicate, children: "\u2398 Duplicate" }), _jsx("button", { className: "action-menu-item", onClick: handlePreview, children: "\u2299 Preview" }), !isCurrent && (_jsx("button", { className: "action-menu-item danger", onClick: handleRevert, children: "\u21B6 Revert" }))] }));
}
