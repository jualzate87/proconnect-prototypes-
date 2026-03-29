import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../index';
import { getChangeTypeColor, SECTION_DISPLAY } from '../../lib/mock-data';
const CHANGE_TYPE_LABELS = {
    manual_entry: 'Manual',
    document_import: 'Import',
    api_import: 'API',
    revert: 'Restore',
    copy: 'Copy',
};
function getSectionSummary(fields) {
    const sections = {};
    for (const f of fields) {
        const s = f.split('.')[0];
        sections[s] = (sections[s] || 0) + 1;
    }
    return Object.entries(sections).map(([key, count]) => ({
        name: SECTION_DISPLAY[key] || key,
        count,
    }));
}
function formatTime(timestamp) {
    const DAY = 86400000;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const date = new Date(timestamp);
    if (timestamp >= todayStart.getTime()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (timestamp >= todayStart.getTime() - DAY) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
export default function VersionEntry({ version }) {
    const { auditLog, previewVersionId, openDuplicate, previewVersion, revertToVersion, renameVersion, setHighlight, clearHighlight, } = useAppContext();
    const isCurrent = version.id === auditLog.currentVersionId;
    const isPreviewing = previewVersionId === version.id;
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [renameVal, setRenameVal] = useState(version.label);
    const menuRef = useRef(null);
    const inputRef = useRef(null);
    // Close menu on outside click
    useEffect(() => {
        if (!showMenu)
            return;
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target))
                setShowMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMenu]);
    // Focus input when editing starts
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    const typeColor = getChangeTypeColor(version.changeType);
    const typeLabel = CHANGE_TYPE_LABELS[version.changeType] || version.changeType;
    const hasRelated = (version.relatedFields?.length ?? 0) > 0;
    const summary = hasRelated ? getSectionSummary(version.relatedFields) : [];
    // ── Highlight on hover ────────────────────────────────────────────────────
    const handleMouseEnter = () => {
        if (previewVersionId || isEditing)
            return;
        if (hasRelated)
            setHighlight(version.relatedFields, typeColor);
    };
    const handleMouseLeave = () => {
        if (previewVersionId)
            return;
        clearHighlight();
    };
    // ── Inline rename ─────────────────────────────────────────────────────────
    const startRename = () => {
        setRenameVal(version.label);
        setIsEditing(true);
        setShowMenu(false);
    };
    const commitRename = () => {
        const trimmed = renameVal.trim();
        if (trimmed && trimmed !== version.label) {
            renameVersion(version.id, trimmed);
        }
        setIsEditing(false);
    };
    const cancelRename = () => {
        setRenameVal(version.label);
        setIsEditing(false);
    };
    const handleRenameKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitRename();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            cancelRename();
        }
    };
    // ── Action menu handlers ──────────────────────────────────────────────────
    const handlePreview = () => { previewVersion(version.id); setShowMenu(false); };
    const handleRevert = () => { revertToVersion(version.id); setShowMenu(false); };
    const handleDuplicate = () => { openDuplicate(version.id); setShowMenu(false); };
    return (_jsxs("div", { className: [
            'version-entry',
            isCurrent ? 'version-entry--current' : '',
            isPreviewing ? 'version-entry--previewing' : '',
            isEditing ? 'version-entry--editing' : '',
        ].filter(Boolean).join(' '), onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, children: [_jsx("div", { className: "entry-dot", style: { background: typeColor } }), _jsxs("div", { className: "entry-body", children: [_jsxs("div", { className: "entry-top", children: [isEditing ? (_jsxs("div", { style: { flex: 1 }, children: [_jsx("input", { ref: inputRef, className: "entry-rename-input", value: renameVal, onChange: e => setRenameVal(e.target.value), onKeyDown: handleRenameKey, onBlur: commitRename }), _jsx("p", { className: "entry-rename-hint", children: "Enter to save \u00B7 Esc to cancel" })] })) : (_jsx("p", { className: "entry-description", children: version.description })), !isEditing && (_jsxs("div", { className: "entry-menu-wrap", ref: menuRef, children: [_jsx("button", { className: "version-menu-btn", onClick: () => setShowMenu(!showMenu), title: "Actions", children: _jsxs("svg", { viewBox: "0 0 16 16", fill: "none", width: "14", height: "14", children: [_jsx("circle", { cx: "8", cy: "3.5", r: "1.2", fill: "currentColor" }), _jsx("circle", { cx: "8", cy: "8", r: "1.2", fill: "currentColor" }), _jsx("circle", { cx: "8", cy: "12.5", r: "1.2", fill: "currentColor" })] }) }), showMenu && (_jsxs("div", { className: "action-menu", children: [_jsxs("button", { className: "action-menu-item", onClick: handlePreview, children: [_jsxs("svg", { viewBox: "0 0 14 14", fill: "none", width: "13", height: "13", children: [_jsx("ellipse", { cx: "7", cy: "7", rx: "5.5", ry: "3.5", stroke: "currentColor", strokeWidth: "1.3" }), _jsx("circle", { cx: "7", cy: "7", r: "1.5", fill: "currentColor" })] }), "Preview this version"] }), !isCurrent && (_jsxs("button", { className: "action-menu-item", onClick: handleRevert, children: [_jsxs("svg", { viewBox: "0 0 14 14", fill: "none", width: "13", height: "13", children: [_jsx("path", { d: "M3 7a4 4 0 104-4H4", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }), _jsx("path", { d: "M4 5L2 7l2 2", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" })] }), "Restore this version"] })), _jsxs("button", { className: "action-menu-item", onClick: handleDuplicate, children: [_jsxs("svg", { viewBox: "0 0 14 14", fill: "none", width: "13", height: "13", children: [_jsx("rect", { x: "1.5", y: "3.5", width: "8", height: "9", rx: "1", stroke: "currentColor", strokeWidth: "1.3" }), _jsx("path", { d: "M4.5 3.5V2.5a1 1 0 011-1h5a1 1 0 011 1v8a1 1 0 01-1 1H9.5", stroke: "currentColor", strokeWidth: "1.3" })] }), "Duplicate return"] }), _jsxs("button", { className: "action-menu-item", onClick: startRename, children: [_jsx("svg", { viewBox: "0 0 14 14", fill: "none", width: "13", height: "13", children: _jsx("path", { d: "M9.5 2.5l2 2-7 7H2.5v-2l7-7z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }) }), "Rename"] })] }))] }))] }), !isEditing && (_jsxs("div", { className: "entry-meta", children: [_jsxs("span", { className: "entry-type-badge", style: {
                                    background: typeColor + '18',
                                    color: typeColor,
                                    borderColor: typeColor + '40',
                                }, children: [typeLabel, version.apiSource ? ` · ${version.apiSource}` : ''] }), _jsx("span", { className: "entry-author", children: version.author }), _jsx("span", { className: "entry-sep", children: "\u00B7" }), _jsx("span", { className: "entry-time", children: formatTime(version.timestamp) })] })), !isEditing && summary.length > 0 && (_jsx("div", { className: "entry-section-summary", children: summary.map(s => (_jsxs("span", { className: "entry-section-chip", children: [s.name, " \u00B7 ", s.count, " ", s.count === 1 ? 'field' : 'fields'] }, s.name))) })), isCurrent && !isEditing && _jsx("div", { className: "entry-current-badge", children: "Current" })] })] }));
}
