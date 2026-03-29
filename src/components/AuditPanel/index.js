import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from '../../index';
import ActivityList from './VersionList';
import Filters from './Filters';
import '../../styles/audit-panel.css';
export default function AuditPanel({ onClose }) {
    const { getVisibleVersions } = useAppContext();
    const versions = getVisibleVersions();
    return (_jsxs("div", { className: "audit-panel", children: [_jsxs("div", { className: "audit-panel-header", children: [_jsx("h2", { className: "audit-panel-title", children: "Activity log" }), _jsx("button", { className: "audit-close-btn", onClick: onClose, title: "Close panel", children: _jsx("svg", { viewBox: "0 0 16 16", fill: "none", width: "14", height: "14", children: _jsx("path", { d: "M3 3l10 10M13 3L3 13", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }) }) })] }), _jsx(Filters, {}), _jsx("div", { className: "audit-panel-content", children: versions.length > 0 ? (_jsx(ActivityList, { versions: versions })) : (_jsxs("div", { className: "empty-state", children: [_jsxs("svg", { viewBox: "0 0 40 40", fill: "none", width: "36", height: "36", style: { marginBottom: 10 }, children: [_jsx("circle", { cx: "20", cy: "20", r: "15", stroke: "#d4d7dc", strokeWidth: "1.5" }), _jsx("path", { d: "M20 13v7l4 4", stroke: "#d4d7dc", strokeWidth: "1.5", strokeLinecap: "round" })] }), _jsx("h3", { children: "No activity found" }), _jsx("p", { children: "Try adjusting your filters" })] })) })] }));
}
