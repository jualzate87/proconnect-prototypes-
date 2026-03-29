import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from '../index';
import './PreviewBanner.css';
function formatTimestamp(ts) {
    return new Date(ts).toLocaleDateString([], {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}
export default function PreviewBanner() {
    const { previewVersionId, getVersionById, previewVersion, revertToVersion } = useAppContext();
    if (!previewVersionId)
        return null;
    const version = getVersionById(previewVersionId);
    if (!version)
        return null;
    const handleRestore = () => {
        revertToVersion(previewVersionId);
    };
    const handleExit = () => {
        previewVersion(null);
    };
    return (_jsxs("div", { className: "preview-banner", children: [_jsxs("div", { className: "preview-banner-left", children: [_jsxs("svg", { viewBox: "0 0 18 18", fill: "none", width: "15", height: "15", children: [_jsx("ellipse", { cx: "9", cy: "9", rx: "7", ry: "4.5", stroke: "currentColor", strokeWidth: "1.4" }), _jsx("circle", { cx: "9", cy: "9", r: "2.5", fill: "currentColor" })] }), _jsx("span", { className: "preview-banner-label", children: "Previewing:" }), _jsx("strong", { className: "preview-banner-version", children: version.label }), _jsxs("span", { className: "preview-banner-meta", children: ["\u00B7 ", formatTimestamp(version.timestamp), " \u00B7 ", version.author] })] }), _jsxs("div", { className: "preview-banner-right", children: [_jsxs("span", { className: "preview-banner-hint", children: [_jsxs("svg", { viewBox: "0 0 14 14", fill: "none", width: "11", height: "11", children: [_jsx("rect", { x: "2", y: "6", width: "10", height: "7", rx: "1.5", stroke: "currentColor", strokeWidth: "1.2" }), _jsx("path", { d: "M4.5 6V4.5a2.5 2.5 0 015 0V6", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })] }), "Read-only \u00B7 highlighted fields changed in this version"] }), _jsxs("button", { className: "preview-restore-btn", onClick: handleRestore, children: [_jsxs("svg", { viewBox: "0 0 14 14", fill: "none", width: "12", height: "12", children: [_jsx("path", { d: "M3 7a4 4 0 104-4H4", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" }), _jsx("path", { d: "M4 5L2 7l2 2", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round" })] }), "Restore this version"] }), _jsx("button", { className: "preview-exit-btn", onClick: handleExit, children: "Exit preview" })] })] }));
}
