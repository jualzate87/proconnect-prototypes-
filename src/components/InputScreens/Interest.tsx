import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useAppContext } from '../../index'
import '../../styles/input-screens.css'

type PayerTab = 'p1' | 'p2'

export default function Interest() {
  const { displayTaxData, updateTaxData, highlightedFields, highlightColor, previewVersionId } = useAppContext()
  const [activeTab, setActiveTab] = useState<PayerTab>('p1')

  const interest = displayTaxData.interest || {
    p1Name: '', p1EIN: '', p1Interest: 0, p1FedTax: 0,
    p2Name: '', p2EIN: '', p2Interest: 0, p2FedTax: 0,
    dividendIncome: 0, qualifiedDividends: 0,
    interestIncome: 0, sources: '', notes: '',
  }

  const isPreview = !!previewVersionId

  const handleChange = (field: string, value: any) => {
    if (isPreview) return
    const numFields = ['p1Interest', 'p1FedTax', 'p2Interest', 'p2FedTax', 'dividendIncome', 'qualifiedDividends', 'interestIncome']
    const parsed = numFields.includes(field) ? (isNaN(Number(value)) ? 0 : Number(value)) : value
    updateTaxData('interest', { ...interest, [field]: parsed })
  }

  const inputStyle = (fieldKey: string): CSSProperties => {
    const isHighlighted = highlightedFields.includes(`interest.${fieldKey}`)
    if (!isHighlighted || !highlightColor) return {}
    return {
      background: `${highlightColor}1a`,
      borderColor: highlightColor,
      boxShadow: `inset 3px 0 0 ${highlightColor}`,
    }
  }

  const p1Label = interest.p1Name || 'First Federal Savings'
  const p2Label = interest.p2Name || 'Citi Bank'

  return (
    <div className="screen">
      <div className="screen-title-row">
        <h1 className="screen-title">Details: Interest & Dividend Income (1099-INT / 1099-DIV)</h1>
      </div>

      {/* Payer tabs */}
      <div className="employer-tabs">
        <button
          className={`employer-tab ${activeTab === 'p1' ? 'employer-tab--active' : ''}`}
          onClick={() => setActiveTab('p1')}
        >
          {p1Label}
          <span className="employer-tab-close" onClick={e => e.stopPropagation()}>×</span>
        </button>
        <button
          className={`employer-tab ${activeTab === 'p2' ? 'employer-tab--active' : ''}`}
          onClick={() => setActiveTab('p2')}
        >
          {p2Label}
          <span className="employer-tab-close" onClick={e => e.stopPropagation()}>×</span>
        </button>
        <button className="employer-tab-add" title="Add payer">+</button>
        <button className="view-all-btn">View All ▾</button>
      </div>

      {/* ── Payer 1 — First Federal Savings ── */}
      {activeTab === 'p1' && (
        <div className="tax-table">
          <div className="tax-section-header tax-section-header--import">
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12" style={{marginRight:5,verticalAlign:'middle'}}>
              <path d="M7 1v7M4.5 5.5L7 8l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.5 10.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Payer Information — imported via TaxDome API
          </div>

          <div className="tax-row">
            <div className="tax-label">(b) Payer identification number (EIN)</div>
            <div className="tax-input-cell">
              <input type="text" value={interest.p1EIN} readOnly={isPreview}
                onChange={e => handleChange('p1EIN', e.target.value)}
                style={inputStyle('p1EIN')} placeholder="00-0000000"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(c) Name of payer</div>
            <div className="tax-input-cell">
              <input type="text" value={interest.p1Name} readOnly={isPreview}
                onChange={e => handleChange('p1Name', e.target.value)}
                style={inputStyle('p1Name')} placeholder="Payer name"/>
            </div>
          </div>

          <div className="tax-section-header">1099-INT — Interest Income</div>

          <div className="tax-row">
            <div className="tax-label">(1) Interest income</div>
            <div className="tax-input-cell">
              <input type="text" value={interest.p1Interest || ''} readOnly={isPreview}
                onChange={e => handleChange('p1Interest', e.target.value)}
                style={inputStyle('p1Interest')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(2) Early withdrawal penalty</div>
            <div className="tax-input-cell">
              <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(3) Interest on U.S. savings bonds / T-bills</div>
            <div className="tax-input-cell">
              <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(4) Federal income tax withheld</div>
            <div className="tax-input-cell">
              <input type="text" value={interest.p1FedTax || ''} readOnly={isPreview}
                onChange={e => handleChange('p1FedTax', e.target.value)}
                style={inputStyle('p1FedTax')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(8) Tax-exempt interest</div>
            <div className="tax-input-cell">
              <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(10) Market discount</div>
            <div className="tax-input-cell">
              <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
            </div>
          </div>

          <div className="tax-section-header">1099-DIV — Dividend Income</div>

          <div className="tax-row">
            <div className="tax-label">(1a) Total ordinary dividends</div>
            <div className="tax-input-cell">
              <input type="text" value={interest.dividendIncome || ''} readOnly={isPreview}
                onChange={e => handleChange('dividendIncome', e.target.value)}
                style={inputStyle('dividendIncome')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(1b) Qualified dividends</div>
            <div className="tax-input-cell">
              <input type="text" value={interest.qualifiedDividends || ''} readOnly={isPreview}
                onChange={e => handleChange('qualifiedDividends', e.target.value)}
                style={inputStyle('qualifiedDividends')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(2a) Total capital gain distributions</div>
            <div className="tax-input-cell">
              <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(4) Federal income tax withheld</div>
            <div className="tax-input-cell">
              <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
            </div>
          </div>

          <div className="tax-section-header">Notes</div>
          <div className="tax-row">
            <div className="tax-label">Notes</div>
            <div className="tax-input-cell">
              <textarea value={interest.notes} readOnly={isPreview}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="Add notes about interest and dividend income…" rows={3}/>
            </div>
          </div>
        </div>
      )}

      {/* ── Payer 2 — Citi Bank ── */}
      {activeTab === 'p2' && (
        <div className="tax-table">
          <div className="tax-section-header tax-section-header--import">
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12" style={{marginRight:5,verticalAlign:'middle'}}>
              <rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1.5 5.5h11" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            Payer Information — imported from 1099-INT document
          </div>

          <div className="tax-row">
            <div className="tax-label">(b) Payer identification number (EIN)</div>
            <div className="tax-input-cell">
              <input type="text" value={interest.p2EIN} readOnly={isPreview}
                onChange={e => handleChange('p2EIN', e.target.value)}
                style={inputStyle('p2EIN')} placeholder="00-0000000"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(c) Name of payer</div>
            <div className="tax-input-cell">
              <input type="text" value={interest.p2Name} readOnly={isPreview}
                onChange={e => handleChange('p2Name', e.target.value)}
                style={inputStyle('p2Name')} placeholder="Payer name"/>
            </div>
          </div>

          <div className="tax-section-header">1099-INT — Interest Income</div>

          <div className="tax-row">
            <div className="tax-label">(1) Interest income</div>
            <div className="tax-input-cell">
              <input type="text" value={interest.p2Interest || ''} readOnly={isPreview}
                onChange={e => handleChange('p2Interest', e.target.value)}
                style={inputStyle('p2Interest')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(2) Early withdrawal penalty</div>
            <div className="tax-input-cell">
              <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(3) Interest on U.S. savings bonds / T-bills</div>
            <div className="tax-input-cell">
              <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(4) Federal income tax withheld</div>
            <div className="tax-input-cell">
              <input type="text" value={interest.p2FedTax || ''} readOnly={isPreview}
                onChange={e => handleChange('p2FedTax', e.target.value)}
                style={inputStyle('p2FedTax')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(8) Tax-exempt interest</div>
            <div className="tax-input-cell">
              <input type="text" defaultValue="" readOnly={isPreview} placeholder="0"/>
            </div>
          </div>

          <div className="tax-section-header">Notes</div>
          <div className="tax-row">
            <div className="tax-label">Notes</div>
            <div className="tax-input-cell">
              <textarea defaultValue="" readOnly={isPreview}
                placeholder="Add notes about this payer…" rows={2}/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
