
import type { CSSProperties } from 'react'
import { useAppContext } from '../../index'
import '../../styles/input-screens.css'

interface DispositionRow {
  id: string
  quantity: string
  description: string
  dateAcquired: string
  dateSold: string
  salePrice: number
  costBasis: number
  gainLoss: number
  termType: 'short' | 'long'
}

const LONG_TERM: DispositionRow[] = [
  { id: 'l1', quantity: '100', description: 'AAPL — Apple Inc.',    dateAcquired: '02/14/2022', dateSold: '11/08/2025', salePrice: 18750, costBasis: 12300, gainLoss:  6450, termType: 'long' },
  { id: 'l2', quantity: '50',  description: 'MSFT — Microsoft Corp.', dateAcquired: '06/01/2023', dateSold: '12/15/2025', salePrice: 19800, costBasis: 17500, gainLoss:  2300, termType: 'long' },
]

const SHORT_TERM: DispositionRow[] = [
  { id: 's1', quantity: '200', description: 'NVDA — NVIDIA Corp.', dateAcquired: '09/20/2025', dateSold: '12/28/2025', salePrice: 23600, costBasis: 21900, gainLoss:  1700, termType: 'short' },
  { id: 's2', quantity: '75',  description: 'TSLA — Tesla Inc.',   dateAcquired: '01/10/2025', dateSold: '10/04/2025', salePrice: 14250, costBasis: 18750, gainLoss: -4500, termType: 'short' },
]

function fmt(n: number) {
  if (n === 0) return '—'
  if (n < 0) return `(${Math.abs(n).toLocaleString()})`
  return n.toLocaleString()
}

export default function Dispositions() {
  const { highlightedFields, highlightColor, previewVersionId } = useAppContext()
  const isPreview = !!previewVersionId

  const cellHighlight = (fieldKey: string): CSSProperties => {
    if (!highlightedFields.includes(fieldKey) || !highlightColor) return {}
    return {
      background: `${highlightColor}1a`,
      borderColor: highlightColor,
      boxShadow: `inset 3px 0 0 ${highlightColor}`,
    }
  }

  const longTotal  = LONG_TERM.reduce((s, r)  => s + r.gainLoss, 0)
  const shortTotal = SHORT_TERM.reduce((s, r) => s + r.gainLoss, 0)
  const netTotal   = longTotal + shortTotal

  function DispositionTable({ rows, label }: { rows: DispositionRow[]; label: string }) {
    return (
      <div className="tax-table" style={{ marginBottom: 0 }}>
        <div className="tax-section-header">{label}</div>

        {/* Column header */}
        <div className="disp-col-header">
          <span className="disp-th disp-th--no">#</span>
          <span className="disp-th disp-th--desc">Description</span>
          <span className="disp-th disp-th--date">Date Acquired</span>
          <span className="disp-th disp-th--date">Date Sold</span>
          <span className="disp-th disp-th--num">Sale Price</span>
          <span className="disp-th disp-th--num">Cost Basis</span>
          <span className="disp-th disp-th--num">Gain / (Loss)</span>
        </div>

        {rows.map((row, i) => (
          <div key={row.id} className="disp-data-row tax-row">
            <span className="disp-td disp-td--no">{i + 1}.</span>

            <div className="disp-td disp-td--desc">
              <input
                className="tax-input"
                defaultValue={row.description}
                readOnly={isPreview}
                style={cellHighlight(`dispositions.${row.id}.description`)}
              />
            </div>

            <div className="disp-td disp-td--date">
              <input
                className="tax-input"
                defaultValue={row.dateAcquired}
                readOnly={isPreview}
                style={cellHighlight(`dispositions.${row.id}.dateAcquired`)}
              />
            </div>

            <div className="disp-td disp-td--date">
              <input
                className="tax-input"
                defaultValue={row.dateSold}
                readOnly={isPreview}
                style={cellHighlight(`dispositions.${row.id}.dateSold`)}
              />
            </div>

            <div className="disp-td disp-td--num">
              <input
                className="tax-input tax-input--right"
                defaultValue={row.salePrice.toLocaleString()}
                readOnly={isPreview}
                style={cellHighlight(`dispositions.${row.id}.salePrice`)}
              />
            </div>

            <div className="disp-td disp-td--num">
              <input
                className="tax-input tax-input--right"
                defaultValue={row.costBasis.toLocaleString()}
                readOnly={isPreview}
                style={cellHighlight(`dispositions.${row.id}.costBasis`)}
              />
            </div>

            <div className={`disp-td disp-td--num disp-td--computed${row.gainLoss < 0 ? ' disp-loss' : ''}`}>
              {fmt(row.gainLoss)}
            </div>
          </div>
        ))}

        {/* Add row */}
        {!isPreview && (
          <button className="disp-add-row">
            <svg viewBox="0 0 12 12" fill="none" width="11" height="11">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add row
          </button>
        )}

        {/* Subtotal */}
        <div className="disp-subtotal">
          <span className="disp-subtotal-label">Net {rows[0].termType === 'long' ? 'long' : 'short'}-term gain / (loss)</span>
          <span className={`disp-subtotal-value${(rows[0].termType === 'long' ? longTotal : shortTotal) < 0 ? ' disp-loss' : ''}`}>
            {fmt(rows[0].termType === 'long' ? longTotal : shortTotal)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="screen-title-row">
        <h1 className="screen-title">Dispositions (Schedule D, 4797)</h1>
      </div>

      <DispositionTable rows={LONG_TERM}  label="Long-Term Capital Gains & Losses (held > 1 year)" />

      <div style={{ height: 20 }} />

      <DispositionTable rows={SHORT_TERM} label="Short-Term Capital Gains & Losses (held ≤ 1 year)" />

      {/* Net total */}
      <div className="tax-table" style={{ marginTop: 20 }}>
        <div className="disp-net-total">
          <span className="disp-subtotal-label">Net capital gain / (loss) — Schedule D Line 16</span>
          <span className={`disp-net-value${netTotal < 0 ? ' disp-loss' : ''}`}>{fmt(netTotal)}</span>
        </div>
      </div>
    </div>
  )
}
