import type { CSSProperties } from 'react'
import { useAppContext } from '../../index'
import '../../styles/input-screens.css'

export default function Invest() {
  const { displayTaxData, updateTaxData, highlightedFields, highlightColor, previewVersionId } = useAppContext()
  const investment = displayTaxData.investment || { capitalGains: 0, shortTermGains: 0, stockSales: '', notes: '' }

  const isPreview = !!previewVersionId

  const handleChange = (field: string, value: any) => {
    if (isPreview) return
    const numFields = ['capitalGains', 'shortTermGains']
    const parsed = numFields.includes(field) ? (isNaN(Number(value)) ? 0 : Number(value)) : value
    updateTaxData('investment', { ...investment, [field]: parsed })
  }

  const inputStyle = (fieldKey: string): CSSProperties => {
    const isHighlighted = highlightedFields.includes(`investment.${fieldKey}`)
    if (!isHighlighted || !highlightColor) return {}
    return {
      background: `${highlightColor}1a`,
      borderColor: highlightColor,
      boxShadow: `inset 3px 0 0 ${highlightColor}`,
    }
  }

  return (
    <div className="screen">
      <div className="screen-title-row">
        <h1 className="screen-title">Details: Capital Gains and Losses (Schedule D)</h1>
      </div>

      <div className="tax-table">
        <div className="tax-section-header">Long-Term Capital Gains &amp; Losses (held &gt; 1 year)</div>

        <div className="tax-row">
          <div className="tax-label">(1a) Long-term capital gains or (losses)</div>
          <div className="tax-input-cell">
            <input type="text" value={investment.capitalGains || ''} readOnly={isPreview}
              onChange={e => handleChange('capitalGains', e.target.value)}
              style={inputStyle('capitalGains')} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(1b) Qualified dividends included in (1a)</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(2) Long-term cap. gain from installment sales</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(7) Net long-term gain or (loss)</div>
          <div className="tax-input-cell">
            <input type="text"
              value={investment.capitalGains ? `$${investment.capitalGains.toLocaleString()}` : ''}
              readOnly placeholder="0" style={{color: 'var(--text-secondary)', fontStyle: 'italic'}}/>
          </div>
        </div>

        <div className="tax-section-header">Short-Term Capital Gains &amp; Losses (held ≤ 1 year)</div>

        <div className="tax-row">
          <div className="tax-label">(2a) Short-term capital gains or (losses)</div>
          <div className="tax-input-cell">
            <input type="text" value={investment.shortTermGains || ''} readOnly={isPreview}
              onChange={e => handleChange('shortTermGains', e.target.value)}
              style={inputStyle('shortTermGains')} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(2b) Short-term gain from installment sales</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(7) Net short-term gain or (loss)</div>
          <div className="tax-input-cell">
            <input type="text"
              value={investment.shortTermGains ? `$${investment.shortTermGains.toLocaleString()}` : ''}
              readOnly placeholder="0" style={{color: 'var(--text-secondary)', fontStyle: 'italic'}}/>
          </div>
        </div>

        <div className="tax-section-header">Individual Transactions</div>

        <div className="tax-row">
          <div className="tax-label">Stocks / securities sold</div>
          <div className="tax-input-cell">
            <input type="text" value={investment.stockSales} readOnly={isPreview}
              onChange={e => handleChange('stockSales', e.target.value)}
              style={inputStyle('stockSales')} placeholder="e.g., AAPL 100sh · MSFT 50sh"/>
          </div>
        </div>

        {/* Static example transaction rows for realism */}
        <div className="tax-section-header" style={{fontSize: '11px', background: '#fafbfc', color: 'var(--text-tertiary)'}}>
          DESCRIPTION · DATE ACQUIRED · DATE SOLD · SALES PRICE · COST BASIS · GAIN / (LOSS)
        </div>

        <div className="tax-row invest-transaction-row">
          <div className="tax-label" style={{fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)'}}>
            AAPL — 100 shares
          </div>
          <div className="tax-input-cell invest-tx-cells">
            <input type="text" defaultValue="01/15/2023" readOnly={isPreview} className="invest-tx-date" placeholder="Acq."/>
            <input type="text" defaultValue="03/22/2025" readOnly={isPreview} className="invest-tx-date" placeholder="Sold"/>
            <input type="text" defaultValue="14,850" readOnly={isPreview} className="invest-tx-amt" placeholder="Sale $"/>
            <input type="text" defaultValue="9,200" readOnly={isPreview} className="invest-tx-amt" placeholder="Cost $"/>
            <input type="text" defaultValue="5,650" readOnly className="invest-tx-gain" placeholder="Gain"/>
          </div>
        </div>

        <div className="tax-row invest-transaction-row">
          <div className="tax-label" style={{fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)'}}>
            MSFT — 50 shares
          </div>
          <div className="tax-input-cell invest-tx-cells">
            <input type="text" defaultValue="07/08/2022" readOnly={isPreview} className="invest-tx-date" placeholder="Acq."/>
            <input type="text" defaultValue="11/30/2025" readOnly={isPreview} className="invest-tx-date" placeholder="Sold"/>
            <input type="text" defaultValue="10,200" readOnly={isPreview} className="invest-tx-amt" placeholder="Sale $"/>
            <input type="text" defaultValue="7,652" readOnly={isPreview} className="invest-tx-amt" placeholder="Cost $"/>
            <input type="text" defaultValue="2,548" readOnly className="invest-tx-gain" placeholder="Gain"/>
          </div>
        </div>

        <div className="tax-section-header">Notes</div>
        <div className="tax-row">
          <div className="tax-label">Notes</div>
          <div className="tax-input-cell">
            <textarea value={investment.notes} readOnly={isPreview}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Add notes about investment activity…" rows={3}/>
          </div>
        </div>
      </div>
    </div>
  )
}
