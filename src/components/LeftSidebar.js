import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAppContext } from '../index';
import './LeftSidebar.css';
const NAVIGATION = [
    { id: 'general', label: 'General' },
    {
        id: 'income',
        label: 'Income',
        items: [
            { id: 'income', label: 'Wages and salaries' },
            { id: 'interest', label: 'Interest Income (1099-INT-OID)' },
            { id: 'invest', label: 'Dividend Income (1099-DIV)' },
            { id: 'others', label: 'Net operating loss' },
            { id: 'others', label: 'Rental and royalty income' },
            { id: 'others', label: 'Business income' },
            { id: 'dispositions', label: 'Dispositions (Schedule D, 4797)' },
            { id: 'k1s', label: 'Passthrough K-1s', expandable: true },
        ]
    },
    { id: 'deductions', label: 'Deductions' },
    { id: 'credits', label: 'Credits' },
    { id: 'taxes', label: 'Taxes' },
    { id: 'other', label: 'Other' },
    { id: 'misc', label: 'Miscellaneous Forms' },
    {
        id: 'manual',
        label: 'Manual Entry Forms',
        items: [
            { id: 'guides', label: 'Tax Guides & References' },
        ]
    },
];
export default function LeftSidebar() {
    const { currentScreen, setCurrentScreen } = useAppContext();
    const [activeView, setActiveView] = useState('all');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(new Set(['income']));
    const toggleSection = (id) => {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const handleItemClick = (screenId) => {
        setCurrentScreen(screenId);
        // Expand the parent section if needed
        for (const section of NAVIGATION) {
            if (section.items?.some(i => i.id === screenId)) {
                setExpanded(prev => new Set([...prev, section.id]));
            }
        }
    };
    const filteredNav = search
        ? NAVIGATION.map(s => ({
            ...s,
            items: s.items?.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
        })).filter(s => s.label.toLowerCase().includes(search.toLowerCase()) || (s.items && s.items.length > 0))
        : NAVIGATION;
    return (_jsxs("aside", { className: "left-sidebar", children: [_jsxs("div", { className: "sidebar-views", children: [_jsx("span", { className: "sidebar-views-label", children: "Views" }), _jsxs("div", { className: "sidebar-views-tabs", children: [_jsx("button", { className: `sidebar-view-tab ${activeView === 'all' ? 'active' : ''}`, onClick: () => setActiveView('all'), children: "All" }), _jsx("button", { className: `sidebar-view-tab ${activeView === 'inuse' ? 'active' : ''}`, onClick: () => setActiveView('inuse'), children: "In use" })] }), _jsx("button", { className: "sidebar-icon-btn", title: "Table settings", children: _jsx("svg", { viewBox: "0 0 20 20", fill: "none", width: "16", height: "16", children: _jsx("path", { d: "M4 5h12M4 10h12M4 15h12", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }) }) })] }), _jsxs("div", { className: "sidebar-search", children: [_jsxs("svg", { viewBox: "0 0 20 20", fill: "none", width: "14", height: "14", className: "sidebar-search-icon", children: [_jsx("circle", { cx: "9", cy: "9", r: "5.5", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M13.5 13.5L17 17", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })] }), _jsx("input", { type: "text", placeholder: "Search", value: search, onChange: e => setSearch(e.target.value), className: "sidebar-search-input" })] }), _jsxs("div", { className: "sidebar-toc-header", children: [_jsx("span", { children: "Table of content" }), _jsx("button", { className: "sidebar-icon-btn", children: _jsx("svg", { viewBox: "0 0 20 20", fill: "none", width: "14", height: "14", children: _jsx("path", { d: "M4 5h12M4 10h12M4 15h12", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }) }) })] }), _jsx("nav", { className: "sidebar-nav", children: filteredNav.map(section => {
                    const isOpen = expanded.has(section.id);
                    const hasItems = section.items && section.items.length > 0;
                    return (_jsxs("div", { className: "sidebar-section", children: [_jsxs("button", { className: `sidebar-section-header ${hasItems ? '' : 'sidebar-section-header--leaf'}`, onClick: () => hasItems ? toggleSection(section.id) : undefined, children: [hasItems && (_jsx("svg", { viewBox: "0 0 20 20", fill: "none", width: "14", height: "14", className: `sidebar-chevron ${isOpen ? 'sidebar-chevron--open' : ''}`, children: _jsx("path", { d: "M7 8l3 3 3-3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })), !hasItems && _jsx("span", { className: "sidebar-section-spacer" }), _jsx("span", { className: "sidebar-section-label", children: section.label })] }), hasItems && isOpen && (_jsx("div", { className: "sidebar-items", children: section.items.map((item, idx) => (_jsxs("button", { className: `sidebar-item ${currentScreen === item.id ? 'sidebar-item--active' : ''}`, onClick: () => handleItemClick(item.id), children: [item.expandable && (_jsx("svg", { viewBox: "0 0 14 14", fill: "none", width: "12", height: "12", style: { marginRight: 4, flexShrink: 0 }, children: _jsx("path", { d: "M5 3l4 4-4 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })), item.label] }, `${item.id}-${idx}`))) }))] }, section.id));
                }) })] }));
}
