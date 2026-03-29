import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppContext } from '../../index';
import '../../styles/input-screens.css';
const LONG_TERM = [
    { id: 'l1', quantity: '100', description: 'AAPL — Apple Inc.', dateAcquired: '02/14/2022', dateSold: '11/08/2025', salePrice: 18750, costBasis: 12300, gainLoss: 6450, termType: 'long' },
    { id: 'l2', quantity: '50', description: 'MSFT — Microsoft Corp.', dateAcquired: '06/01/2023', dateSold: '12/15/2025', salePrice: 19800, costBasis: 17500, gainLoss: 2300, termType: 'long' },
];
const SHORT_TERM = [
    { id: 's1', quantity: '200', description: 'NVDA — NVIDIA Corp.', dateAcquired: '09/20/2025', dateSold: '12/28/2025', salePrice: 23600, costBasis: 21900, gainLoss: 1700, termType: 'short' },
    { id: 's2', quantity: '75', description: 'TSLA — Tesla Inc.', dateAcquired: '01/10/2025', dateSold: '10/04/2025', salePrice: 14250, costBasis: 18750, gainLoss: -4500, termType: 'short' },
];
function fmt(n) {
    if (n === 0)
        return '—';
    if (n < 0)
        return `(${Math.abs(n).toLocaleString()})`;
    return n.toLocaleString();
}
export default function Dispositions() {
    const { highlightedFields, highlightColor, previewVersionId } = useAppContext();
    const isPreview = !!previewVersionId;
    const cellHighlight = (fieldKey) => {
        if (!highlightedFields.includes(fieldKey) || !highlightColor)
            return {};
        return {
            background: `${highlightColor}1a`,
            borderColor: highlightColor,
            boxShadow: `inset 3px 0 0 ${highlightColor}`,
        };
    };
    const longTotal = LONG_TERM.reduce((s, r) => s + r.gainLoss, 0);
    const shortTotal = SHORT_TERM.reduce((s, r) => s + r.gainLoss, 0);
    const netTotal = longTotal + shortTotal;
    function DispositionTable({ rows, label }) {
        return (_jsxs("div", { className: "tax-table", style: { marginBottom: 0 }, children: [_jsx("div", { className: "tax-section-header", children: label }), _jsxs("div", { className: "disp-col-header", children: [_jsx("span", { className: "disp-th disp-th--no", children: "#" }), _jsx("span", { className: "disp-th disp-th--desc", children: "Description" }), _jsx("span", { className: "disp-th disp-th--date", children: "Date Acquired" }), _jsx("span", { className: "disp-th disp-th--date", children: "Date Sold" }), _jsx("span", { className: "disp-th disp-th--num", children: "Sale Price" }), _jsx("span", { className: "disp-th disp-th--num", children: "Cost Basis" }), _jsx("span", { className: "disp-th disp-th--num", children: "Gain / (Loss)" })] }), rows.map((row, i) => (_jsxs("div", { className: "disp-data-row tax-row", children: [_jsxs("span", { className: "disp-td disp-td--no", children: [i + 1, "."] }), _jsx("div", { className: "disp-td disp-td--desc", children: _jsx("input", { className: "tax-input", defaultValue: row.description, readOnly: isPreview, style: cellHighlight(`dispositions.${row.id}.description`) }) }), _jsx("div", { className: "disp-td disp-td--date", children: _jsx("input", { className: "tax-input", defaultValue: row.dateAcquired, readOnly: isPreview, style: cellHighlight(`dispositions.${row.id}.dateAcquired`) }) }), _jsx("div", { className: "disp-td disp-td--date", children: _jsx("input", { className: "tax-input", defaultValue: row.dateSold, readOnly: isPreview, style: cellHighlight(`dispositions.${row.id}.dateSold`) }) }), _jsx("div", { className: "disp-td disp-td--num", children: _jsx("input", { className: "tax-input tax-input--right", defaultValue: row.salePrice.toLocaleString(), readOnly: isPreview, style: cellHighlight(`dispositions.${row.id}.salePrice`) }) }), _jsx("div", { className: "disp-td disp-td--num", children: _jsx("input", { className: "tax-input tax-input--right", defaultValue: row.costBasis.toLocaleString(), readOnly: isPreview, style: cellHighlight(`dispositions.${row.id}.costBasis`) }) }), _jsx("div", { className: `disp-td disp-td--num disp-td--computed${row.gainLoss < 0 ? ' disp-loss' : ''}`, children: fmt(row.gainLoss) })] }, row.id))), !isPreview && (_jsxs("button", { className: "disp-add-row", children: [_jsx("svg", { viewBox: "0 0 12 12", fill: "none", width: "11", height: "11", children: _jsx("path", { d: "M6 2v8M2 6h8", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }) }), "Add row"] })), _jsxs("div", { className: "disp-subtotal", children: [_jsxs("span", { className: "disp-subtotal-label", children: ["Net ", rows[0].termType === 'long' ? 'long' : 'short', "-term gain / (loss)"] }), _jsx("span", { className: `disp-subtotal-value${(rows[0].termType === 'long' ? longTotal : shortTotal) < 0 ? ' disp-loss' : ''}`, children: fmt(rows[0].termType === 'long' ? longTotal : shortTotal) })] })] }));
    }
    return (_jsxs("div", { className: "screen", children: [_jsx("div", { className: "screen-title-row", children: _jsx("h1", { className: "screen-title", children: "Dispositions (Schedule D, 4797)" }) }), _jsx(DispositionTable, { rows: LONG_TERM, label: "Long-Term Capital Gains & Losses (held > 1 year)" }), _jsx("div", { style: { height: 20 } }), _jsx(DispositionTable, { rows: SHORT_TERM, label: "Short-Term Capital Gains & Losses (held \u2264 1 year)" }), _jsx("div", { className: "tax-table", style: { marginTop: 20 }, children: _jsxs("div", { className: "disp-net-total", children: [_jsx("span", { className: "disp-subtotal-label", children: "Net capital gain / (loss) \u2014 Schedule D Line 16" }), _jsx("span", { className: `disp-net-value${netTotal < 0 ? ' disp-loss' : ''}`, children: fmt(netTotal) })] }) })] }));
}
