import type { CSSProperties } from 'react'
import { useAppContext } from '../../index'
import '../../styles/input-screens.css'

export default function Others() {
  const { displayTaxData, updateTaxData, highlightedFields, highlightColor, previewVersionId } = useAppContext()
  const other = displayTaxData.other || {
    propertyAddress: '', propertyCity: '', propertyState: '',
    daysRented: 0, rentalIncome: 0, rentalExpenses: 0,
    k1PartnerName: '', passiveIncome: 0, notes: '',
  }

  const isPreview = !!previewVersionId

  const handleChange = (field: string, value: any) => {
    if (isPreview) return
    const numFields = ['daysRented', 'rentalIncome', 'rentalExpenses', 'passiveIncome']
    const parsed = numFields.includes(field) ? (isNaN(Number(value)) ? 0 : Number(value)) : value
    updateTaxData('other', { ...other, [field]: parsed })
  }

  const inputStyle = (fieldKey: string): CSSProperties => {
    const isHighlighted = highlightedFields.includes(`other.${fieldKey}`)
    if (!isHighlighted || !highlightColor) return {}
    return {
      background: `${highlightColor}1a`,
      borderColor: highlightColor,
      boxShadow: `inset 3px 0 0 ${highlightColor}`,
    }
  }

  const netRental = (other.rentalIncome || 0) - (other.rentalExpenses || 0)

  return (
    <div className="screen">
      <div className="screen-title-row">
        <h1 className="screen-title">Details: Rental, Royalty &amp; Passive Income (Schedule E)</h1>
      </div>

      <div className="tax-table">
        <div className="tax-section-header">Rental Property — Property A</div>

        <div className="tax-row">
          <div className="tax-label">Street address</div>
          <div className="tax-input-cell">
            <input type="text" value={other.propertyAddress} readOnly={isPreview}
              onChange={e => handleChange('propertyAddress', e.target.value)}
              style={inputStyle('propertyAddress')} placeholder="Street address"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">City / State</div>
          <div className="tax-input-cell tax-input-cell--split">
            <input type="text" value={other.propertyCity} readOnly={isPreview}
              onChange={e => handleChange('propertyCity', e.target.value)}
              placeholder="City" className="tax-input-city" style={inputStyle('propertyCity')}/>
            <input type="text" value={other.propertyState} readOnly={isPreview}
              onChange={e => handleChange('propertyState', e.target.value)}
              placeholder="ST" className="tax-input-state" style={inputStyle('propertyState')}/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">Type of property</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="Single Family Residential" readOnly={isPreview} placeholder="Property type"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">Days rented at fair market value</div>
          <div className="tax-input-cell">
            <input type="text" value={other.daysRented || ''} readOnly={isPreview}
              onChange={e => handleChange('daysRented', e.target.value)}
              style={inputStyle('daysRented')} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">Days of personal use</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="14" readOnly={isPreview} placeholder="0"/>
          </div>
        </div>

        <div className="tax-section-header">Income &amp; Expenses</div>

        <div className="tax-row">
          <div className="tax-label">(3) Rents received (gross)</div>
          <div className="tax-input-cell">
            <input type="text" value={other.rentalIncome || ''} readOnly={isPreview}
              onChange={e => handleChange('rentalIncome', e.target.value)}
              style={inputStyle('rentalIncome')} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(5) Advertising</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="180" readOnly={isPreview} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(9) Insurance</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="820" readOnly={isPreview} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(11) Mortgage interest paid</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="620" readOnly={isPreview} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(13) Repairs</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="300" readOnly={isPreview} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">Total rental expenses</div>
          <div className="tax-input-cell">
            <input type="text" value={other.rentalExpenses || ''} readOnly={isPreview}
              onChange={e => handleChange('rentalExpenses', e.target.value)}
              style={inputStyle('rentalExpenses')} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(26) Net rental income (loss)</div>
          <div className="tax-input-cell">
            <input type="text"
              value={other.rentalIncome ? `$${netRental.toLocaleString()}` : ''}
              readOnly placeholder="0"
              style={{color: 'var(--text-secondary)', fontStyle: 'italic'}}/>
          </div>
        </div>

        <div className="tax-section-header tax-section-header--import">
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12" style={{marginRight:5,verticalAlign:'middle'}}>
            <path d="M7 1v7M4.5 5.5L7 8l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1.5 10.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          K-1 / Partnership Income — imported via TaxDome API
        </div>

        <div className="tax-row">
          <div className="tax-label">Partnership / S-Corp name</div>
          <div className="tax-input-cell">
            <input type="text" value={other.k1PartnerName} readOnly={isPreview}
              onChange={e => handleChange('k1PartnerName', e.target.value)}
              style={inputStyle('k1PartnerName')} placeholder="Partner entity name"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">Entity EIN</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="47-8821093" readOnly={isPreview} placeholder="00-0000000"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(1) Ordinary business income (loss)</div>
          <div className="tax-input-cell">
            <input type="text" value={other.passiveIncome || ''} readOnly={isPreview}
              onChange={e => handleChange('passiveIncome', e.target.value)}
              style={inputStyle('passiveIncome')} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(5) Interest income</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="0" readOnly={isPreview} placeholder="0"/>
          </div>
        </div>

        <div className="tax-row">
          <div className="tax-label">(6a) Ordinary dividends</div>
          <div className="tax-input-cell">
            <input type="text" defaultValue="0" readOnly={isPreview} placeholder="0"/>
          </div>
        </div>

        <div className="tax-section-header">Notes</div>
        <div className="tax-row">
          <div className="tax-label">Notes</div>
          <div className="tax-input-cell">
            <textarea value={other.notes} readOnly={isPreview}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Add notes about rental or passive income…" rows={3}/>
          </div>
        </div>
      </div>
    </div>
  )
}
