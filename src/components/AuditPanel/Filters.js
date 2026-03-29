import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../index';
export default function Filters() {
    const { filters, setFilters, clearFilters, auditLog } = useAppContext();
    const [dateOpen, setDateOpen] = useState(false);
    const [authorOpen, setAuthorOpen] = useState(false);
    const [activityOpen, setActivityOpen] = useState(false);
    const dateRef = useRef(null);
    const authorRef = useRef(null);
    const activityRef = useRef(null);
    const authors = Array.from(new Set(auditLog.versions.map(v => v.author))).sort();
    const DATE_OPTIONS = [
        { label: 'All dates', value: '' },
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
        { label: 'This year', value: 'this_year' },
        { label: 'Last year', value: 'last_year' },
    ];
    const ACTIVITY_OPTIONS = [
        { label: 'All activity', value: '' },
        { label: 'Manual entry', value: 'manual_entry' },
        { label: 'Document import', value: 'document_import' },
        { label: 'API import', value: 'api_import' },
    ];
    // Close all dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dateRef.current && !dateRef.current.contains(e.target))
                setDateOpen(false);
            if (authorRef.current && !authorRef.current.contains(e.target))
                setAuthorOpen(false);
            if (activityRef.current && !activityRef.current.contains(e.target))
                setActivityOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    // ── Date pill logic ──────────────────────────────────────────────────────────
    const selectDate = (val) => {
        const DAY = 86400000;
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayMs = todayStart.getTime();
        let dateFrom;
        let dateTo;
        if (val === 'today') {
            dateFrom = todayMs;
        }
        else if (val === 'yesterday') {
            dateFrom = todayMs - DAY;
            dateTo = todayMs - 1;
        }
        else if (val === '7d') {
            dateFrom = todayMs - 7 * DAY;
            dateTo = todayMs - 2 * DAY - 1;
        }
        else if (val === '30d') {
            dateFrom = todayMs - 30 * DAY;
            dateTo = todayMs - 7 * DAY - 1;
        }
        else if (val === '90d') {
            dateFrom = todayMs - 90 * DAY;
            dateTo = todayMs - 30 * DAY - 1;
        }
        else if (val === 'this_year') {
            dateFrom = new Date(now.getFullYear(), 0, 1).getTime();
            dateTo = todayMs - 90 * DAY - 1;
        }
        else if (val === 'last_year') {
            dateFrom = new Date(now.getFullYear() - 1, 0, 1).getTime();
            dateTo = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999).getTime();
        }
        setFilters({ ...filters, dateFrom, dateTo });
        setDateOpen(false);
    };
    const activeDateLabel = (() => {
        if (!filters.dateFrom && !filters.dateTo)
            return null;
        const DAY = 86400000;
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayMs = todayStart.getTime();
        const df = filters.dateFrom;
        if (df >= todayMs)
            return 'Today';
        if (df >= todayMs - DAY)
            return 'Yesterday';
        if (df >= todayMs - 7 * DAY)
            return 'Last 7 days';
        if (df >= todayMs - 30 * DAY)
            return 'Last 30 days';
        if (df >= todayMs - 90 * DAY)
            return 'Last 90 days';
        if (new Date(df).getFullYear() === now.getFullYear())
            return 'This year';
        if (new Date(df).getFullYear() === now.getFullYear() - 1)
            return 'Last year';
        return null;
    })();
    // ── Author pill logic ────────────────────────────────────────────────────────
    const selectAuthor = (author) => {
        setFilters({ ...filters, author: author || undefined });
        setAuthorOpen(false);
    };
    // ── Activity type pill logic ─────────────────────────────────────────────────
    const selectActivity = (val) => {
        setFilters({ ...filters, changeType: val || undefined });
        setActivityOpen(false);
    };
    // ── Search logic ─────────────────────────────────────────────────────────────
    const handleSearch = (e) => {
        setFilters({ ...filters, searchQuery: e.target.value || undefined });
    };
    const hasFilters = filters.dateFrom || filters.dateTo || filters.author || filters.changeType;
    function Chevron() {
        return (_jsx("svg", { viewBox: "0 0 12 12", fill: "none", width: "10", height: "10", style: { flexShrink: 0 }, children: _jsx("path", { d: "M2 4l4 4 4-4", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }) }));
    }
    function Check() {
        return (_jsx("svg", { viewBox: "0 0 12 12", fill: "none", width: "10", height: "10", style: { marginRight: 4 }, children: _jsx("path", { d: "M2 6l3 3 5-5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }));
    }
    return (_jsxs("div", { className: "audit-filters", children: [_jsx("div", { className: "audit-search-wrap", children: _jsxs("div", { className: "audit-search-inner", children: [_jsxs("svg", { className: "audit-search-icon", viewBox: "0 0 14 14", fill: "none", width: "13", height: "13", children: [_jsx("circle", { cx: "6", cy: "6", r: "4", stroke: "currentColor", strokeWidth: "1.3" }), _jsx("path", { d: "M9.5 9.5l2.5 2.5", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" })] }), _jsx("input", { className: "audit-search-input", type: "text", placeholder: "Search activity\u2026", value: filters.searchQuery || '', onChange: handleSearch }), filters.searchQuery && (_jsx("button", { className: "audit-search-clear", onClick: () => setFilters({ ...filters, searchQuery: undefined }), title: "Clear search", children: _jsx("svg", { viewBox: "0 0 12 12", fill: "none", width: "9", height: "9", children: _jsx("path", { d: "M2 2l8 8M10 2L2 10", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" }) }) }))] }) }), _jsxs("div", { className: "audit-filter-row", children: [_jsxs("div", { className: "filter-pill-wrap", ref: dateRef, children: [_jsxs("button", { className: `filter-pill${activeDateLabel ? ' filter-pill--active' : ''}`, onClick: () => { setDateOpen(!dateOpen); setAuthorOpen(false); setActivityOpen(false); }, children: [_jsx("span", { children: activeDateLabel || 'Date' }), _jsx(Chevron, {})] }), dateOpen && (_jsx("div", { className: "filter-dropdown", children: DATE_OPTIONS.map(opt => {
                                    const isActive = activeDateLabel === opt.label || (!activeDateLabel && opt.value === '');
                                    return (_jsxs("button", { className: `filter-dropdown-item${isActive ? ' active' : ''}`, onClick: () => selectDate(opt.value), children: [isActive && _jsx(Check, {}), opt.label] }, opt.value));
                                }) }))] }), _jsxs("div", { className: "filter-pill-wrap", ref: authorRef, children: [_jsxs("button", { className: `filter-pill${filters.author ? ' filter-pill--active' : ''}`, onClick: () => { setAuthorOpen(!authorOpen); setDateOpen(false); setActivityOpen(false); }, children: [_jsx("span", { children: filters.author || 'Author' }), _jsx(Chevron, {})] }), authorOpen && (_jsxs("div", { className: "filter-dropdown", children: [_jsxs("button", { className: `filter-dropdown-item${!filters.author ? ' active' : ''}`, onClick: () => selectAuthor(''), children: [!filters.author && _jsx(Check, {}), "All authors"] }), authors.map(author => (_jsxs("button", { className: `filter-dropdown-item${filters.author === author ? ' active' : ''}`, onClick: () => selectAuthor(author), children: [filters.author === author && _jsx(Check, {}), author] }, author)))] }))] }), _jsxs("div", { className: "filter-pill-wrap", ref: activityRef, children: [_jsxs("button", { className: `filter-pill${filters.changeType ? ' filter-pill--active' : ''}`, onClick: () => { setActivityOpen(!activityOpen); setDateOpen(false); setAuthorOpen(false); }, children: [_jsx("span", { children: filters.changeType ? ACTIVITY_OPTIONS.find(o => o.value === filters.changeType)?.label : 'Activity' }), _jsx(Chevron, {})] }), activityOpen && (_jsx("div", { className: "filter-dropdown", children: ACTIVITY_OPTIONS.map(opt => {
                                    const isActive = (filters.changeType || '') === opt.value;
                                    return (_jsxs("button", { className: `filter-dropdown-item${isActive ? ' active' : ''}`, onClick: () => selectActivity(opt.value), children: [isActive && _jsx(Check, {}), opt.label] }, opt.value));
                                }) }))] }), hasFilters && (_jsx("button", { className: "filter-clear-btn", onClick: () => clearFilters(), title: "Clear all filters", children: _jsx("svg", { viewBox: "0 0 12 12", fill: "none", width: "9", height: "9", children: _jsx("path", { d: "M2 2l8 8M10 2L2 10", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" }) }) }))] })] }));
}
