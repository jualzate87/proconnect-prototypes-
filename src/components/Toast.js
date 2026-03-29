import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useAppContext } from '../index';
import './Toast.css';
export default function Toast() {
    const { toast, setToast } = useAppContext();
    useEffect(() => {
        if (!toast)
            return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast, setToast]);
    if (!toast)
        return null;
    return (_jsxs("div", { className: "toast toast--success", role: "status", "aria-live": "polite", children: [_jsxs("svg", { viewBox: "0 0 16 16", fill: "none", width: "15", height: "15", className: "toast-icon", children: [_jsx("circle", { cx: "8", cy: "8", r: "7", fill: "#16a34a", opacity: "0.15" }), _jsx("path", { d: "M4.5 8l2.5 2.5 4.5-4.5", stroke: "#16a34a", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" })] }), _jsx("span", { className: "toast-msg", children: toast }), _jsx("button", { className: "toast-close", onClick: () => setToast(null), "aria-label": "Dismiss", children: _jsx("svg", { viewBox: "0 0 12 12", fill: "none", width: "10", height: "10", children: _jsx("path", { d: "M2 2l8 8M10 2L2 10", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }) }) })] }));
}
