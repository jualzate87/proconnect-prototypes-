import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAppContext } from '../index';
import './DuplicateModal.css';
export default function DuplicateModal() {
    const { duplicateReturnOpen, duplicateVersionId, duplicateVersion, setDuplicateOpen, getVersionById, } = useAppContext();
    const [name, setName] = useState('');
    const [creating, setCreating] = useState(false);
    if (!duplicateReturnOpen || !duplicateVersionId)
        return null;
    const sourceVersion = getVersionById(duplicateVersionId);
    const handleCreate = () => {
        if (!name.trim())
            return;
        setCreating(true);
        setTimeout(() => {
            duplicateVersion(duplicateVersionId, name.trim());
            // Modal closes via state (duplicateReturnOpen → false); toast fires via store
            setName('');
            setCreating(false);
        }, 500);
    };
    const handleCancel = () => {
        setDuplicateOpen(false);
        setName('');
    };
    return (_jsx("div", { className: "modal-overlay", onClick: e => { if (e.target === e.currentTarget)
            handleCancel(); }, children: _jsxs("div", { className: "modal duplicate-modal", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { children: "Duplicate return" }), sourceVersion && (_jsxs("p", { className: "duplicate-modal-source", children: ["Copying from: ", _jsx("strong", { children: sourceVersion.label })] }))] }), _jsxs("div", { className: "modal-body", children: [_jsx("label", { className: "duplicate-modal-label", htmlFor: "dup-name", children: "Return name" }), _jsx("input", { id: "dup-name", type: "text", className: "duplicate-modal-input", value: name, onChange: e => setName(e.target.value), placeholder: "e.g., Jordan Wells 2025 \u2014 Copy", autoFocus: true, onKeyDown: e => e.key === 'Enter' && handleCreate(), disabled: creating }), _jsx("p", { className: "duplicate-modal-hint", children: "A new browser tab will open with the copied return and a fresh activity log." })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "modal-btn", onClick: handleCancel, disabled: creating, children: "Cancel" }), _jsx("button", { className: "modal-btn primary", onClick: handleCreate, disabled: !name.trim() || creating, children: creating ? 'Creating…' : 'Create copy' })] })] }) }));
}
