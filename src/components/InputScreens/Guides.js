import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from '../../index';
import '../../styles/input-screens.css';
const AVAILABLE_GUIDES = [
    {
        id: 'retirement-planning',
        title: 'Retirement Planning',
        description: 'Strategies for maximizing retirement contributions and tax benefits'
    },
    {
        id: 'tax-optimization',
        title: 'Tax Optimization',
        description: 'Techniques to legally minimize your tax liability'
    },
    {
        id: 'estimated-payments',
        title: 'Estimated Tax Payments',
        description: 'When and how to make quarterly estimated tax payments'
    },
    {
        id: 'deductions',
        title: 'Itemized Deductions',
        description: 'Understand itemized vs. standard deductions'
    },
    {
        id: 'business-expenses',
        title: 'Business Expenses',
        description: 'What qualifies as a deductible business expense'
    },
    {
        id: 'capital-loss-carryover',
        title: 'Capital Loss Carryover',
        description: 'How to use capital losses to offset future gains'
    }
];
export default function Guides() {
    const { taxData, updateTaxData } = useAppContext();
    const guides = taxData.guides || { selectedGuides: [] };
    const handleToggleGuide = (guideId) => {
        const selected = guides.selectedGuides || [];
        const isSelected = selected.includes(guideId);
        const newSelected = isSelected
            ? selected.filter((id) => id !== guideId)
            : [...selected, guideId];
        updateTaxData('guides', {
            selectedGuides: newSelected
        });
    };
    return (_jsxs("div", { className: "screen", children: [_jsxs("div", { className: "screen-header", children: [_jsx("h1", { children: "Tax Guides" }), _jsx("p", { children: "Select guides that are relevant to your situation" })] }), _jsxs("div", { className: "form-section", children: [_jsx("h2", { children: "Available Resources" }), _jsx("div", { className: "guides-list", children: AVAILABLE_GUIDES.map((guide) => (_jsxs("label", { className: "guide-item", children: [_jsx("input", { type: "checkbox", checked: (guides.selectedGuides || []).includes(guide.id), onChange: () => handleToggleGuide(guide.id) }), _jsxs("div", { className: "guide-item-content", children: [_jsx("p", { className: "guide-item-title", children: guide.title }), _jsx("p", { className: "guide-item-desc", children: guide.description })] })] }, guide.id))) })] }), _jsxs("div", { className: "info-box", children: [_jsx("strong", { children: "Selected Guides: " }), guides.selectedGuides?.length || 0, " of ", AVAILABLE_GUIDES.length] })] }));
}
