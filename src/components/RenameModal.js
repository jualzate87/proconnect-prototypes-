import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAppContext } from '../index';
export default function RenameModal() {
    const { renameVersionId, getVersionById, renameVersion, setRenameVersionId } = useAppContext();
    const [newLabel, setNewLabel] = useState('');
    const version = renameVersionId ? getVersionById(renameVersionId) : null;
    useEffect(() => {
        if (version) {
            setNewLabel(version.label);
        }
    }, [version]);
    if (!version || !renameVersionId)
        return null;
    const handleSave = () => {
        if (newLabel.trim()) {
            renameVersion(renameVersionId, newLabel.trim());
            setRenameVersionId(null);
        }
    };
    const handleCancel = () => {
        setRenameVersionId(null);
    };
    return (_jsx("div", { className: "modal-overlay", onClick: handleCancel, children: _jsxs("div", { className: "modal", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "modal-header", children: _jsx("h2", { children: "Rename Version" }) }), _jsx("div", { className: "modal-body", children: _jsxs("div", { className: "form-group", style: { marginBottom: '0' }, children: [_jsx("label", { htmlFor: "newLabel", children: "Version Label" }), _jsx("input", { id: "newLabel", type: "text", value: newLabel, onChange: (e) => setNewLabel(e.target.value), placeholder: "Enter a new name for this version", autoFocus: true, onKeyDown: (e) => {
                                    if (e.key === 'Enter')
                                        handleSave();
                                    if (e.key === 'Escape')
                                        handleCancel();
                                } })] }) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "modal-btn", onClick: handleCancel, children: "Cancel" }), _jsx("button", { className: "modal-btn primary", onClick: handleSave, children: "Save" })] })] }) }));
}
