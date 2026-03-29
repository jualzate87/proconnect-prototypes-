import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useAppContext } from '../../index'
import '../../styles/input-screens.css'

type TabId = 'bing' | 'techcircle'

export default function Income() {
  const { displayTaxData, updateTaxData, highlightedFields, highlightColor, previewVersionId } = useAppContext()
  const [activeTab, setActiveTab] = useState<TabId>('bing')

  const income = displayTaxData.income || {
    employerId: '', employerName: '', streetAddress: '',
    city: '', state: '', zip: '',
    w2Wages: 0, fedTaxWithheld: 0, ssWages: 0, ssTaxWithheld: 0,
    medicareWages: 0, medicareTax: 0, seIncome: 0, notes: '',
    tcEmployerId: '', tcEmployerName: '', tcStreetAddress: '',
    tcCity: '', tcState: '', tcZip: '',
    tcW2Wages: 0, tcFedTaxWithheld: 0, tcSsWages: 0, tcSsTaxWithheld: 0,
    tcMedicareWages: 0, tcMedicareTax: 0,
  }

  const isPreview = !!previewVersionId

  const handleChange = (field: string, value: any) => {
    if (isPreview) return
    const numFields = [
      'w2Wages','fedTaxWithheld','ssWages','ssTaxWithheld','medicareWages','medicareTax','seIncome',
      'tcW2Wages','tcFedTaxWithheld','tcSsWages','tcSsTaxWithheld','tcMedicareWages','tcMedicareTax',
    ]
    const parsed = numFields.includes(field) ? (isNaN(Number(value)) ? 0 : Number(value)) : value
    updateTaxData('income', { ...income, [field]: parsed })
  }

  // Apply highlight color directly to the input element
  const inputStyle = (fieldKey: string): CSSProperties => {
    const isHighlighted = highlightedFields.includes(`income.${fieldKey}`)
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
        <h1 className="screen-title">Details: Wages, Salaries, Tips (W-2)</h1>
      </div>

      {/* Employer tabs */}
      <div className="employer-tabs">
        <button
          className={`employer-tab ${activeTab === 'bing' ? 'employer-tab--active' : ''}`}
          onClick={() => setActiveTab('bing')}
        >
          {income.employerName || 'Bing Equipment'}
          <span className="employer-tab-close" onClick={e => e.stopPropagation()}>×</span>
        </button>
        <button
          className={`employer-tab ${activeTab === 'techcircle' ? 'employer-tab--active' : ''}`}
          onClick={() => setActiveTab('techcircle')}
        >
          {income.tcEmployerName || 'Tech Circle Inc'}
          <span className="employer-tab-close" onClick={e => e.stopPropagation()}>×</span>
        </button>
        <button className="employer-tab-add" title="Add employer">+</button>
        <button className="view-all-btn">View All ▾</button>
      </div>

      {/* ── Bing Equipment Tab ── */}
      {activeTab === 'bing' && (
        <div className="tax-table">
          <div className="tax-section-header">Employer Information (MANDATORY for e-file)</div>

          <div className="tax-row">
            <div className="tax-label">(b) Employer identification number</div>
            <div className="tax-input-cell">
              <input type="text" value={income.employerId} readOnly={isPreview}
                onChange={e => handleChange('employerId', e.target.value)}
                style={inputStyle('employerId')} placeholder="00-0000000"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(c) Name of employer</div>
            <div className="tax-input-cell">
              <input type="text" value={income.employerName} readOnly={isPreview}
                onChange={e => handleChange('employerName', e.target.value)}
                style={inputStyle('employerName')} placeholder="Employer name"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">Street address</div>
            <div className="tax-input-cell">
              <input type="text" value={income.streetAddress} readOnly={isPreview}
                onChange={e => handleChange('streetAddress', e.target.value)}
                style={inputStyle('streetAddress')} placeholder="Street address"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">City / State / ZIP code</div>
            <div className="tax-input-cell tax-input-cell--split">
              <input type="text" value={income.city} readOnly={isPreview}
                onChange={e => handleChange('city', e.target.value)}
                placeholder="City" className="tax-input-city" style={inputStyle('city')}/>
              <input type="text" value={income.state} readOnly={isPreview}
                onChange={e => handleChange('state', e.target.value)}
                placeholder="ST" className="tax-input-state" style={inputStyle('state')}/>
              <input type="text" value={income.zip} readOnly={isPreview}
                onChange={e => handleChange('zip', e.target.value)}
                placeholder="ZIP" className="tax-input-zip" style={inputStyle('zip')}/>
            </div>
          </div>

          <div className="tax-section-header">Wages</div>

          <div className="tax-row">
            <div className="tax-label">(1) Wages, tips, other compensation</div>
            <div className="tax-input-cell">
              <input type="text" value={income.w2Wages || ''} readOnly={isPreview}
                onChange={e => handleChange('w2Wages', e.target.value)}
                style={inputStyle('w2Wages')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(2) Federal income tax withheld</div>
            <div className="tax-input-cell">
              <input type="text" value={income.fedTaxWithheld || ''} readOnly={isPreview}
                onChange={e => handleChange('fedTaxWithheld', e.target.value)}
                style={inputStyle('fedTaxWithheld')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(3) Social security wages</div>
            <div className="tax-input-cell">
              <input type="text" value={income.ssWages || ''} readOnly={isPreview}
                onChange={e => handleChange('ssWages', e.target.value)}
                style={inputStyle('ssWages')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(4) Social security tax withheld</div>
            <div className="tax-input-cell">
              <input type="text" value={income.ssTaxWithheld || ''} readOnly={isPreview}
                onChange={e => handleChange('ssTaxWithheld', e.target.value)}
                style={inputStyle('ssTaxWithheld')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(5) Medicare wages and tips</div>
            <div className="tax-input-cell">
              <input type="text" value={income.medicareWages || ''} readOnly={isPreview}
                onChange={e => handleChange('medicareWages', e.target.value)}
                style={inputStyle('medicareWages')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(6) Medicare tax withheld</div>
            <div className="tax-input-cell">
              <input type="text" value={income.medicareTax || ''} readOnly={isPreview}
                onChange={e => handleChange('medicareTax', e.target.value)}
                style={inputStyle('medicareTax')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-section-header">Self-Employment Income (Schedule SE)</div>

          <div className="tax-row">
            <div className="tax-label">Net self-employment income</div>
            <div className="tax-input-cell">
              <input type="text" value={income.seIncome || ''} readOnly={isPreview}
                onChange={e => handleChange('seIncome', e.target.value)}
                style={inputStyle('seIncome')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-section-header">Notes</div>
          <div className="tax-row">
            <div className="tax-label">Notes</div>
            <div className="tax-input-cell">
              <textarea value={income.notes} readOnly={isPreview}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="Add preparer notes…" rows={3}/>
            </div>
          </div>
        </div>
      )}

      {/* ── Tech Circle Tab ── */}
      {activeTab === 'techcircle' && (
        <div className="tax-table">
          <div className="tax-section-header tax-section-header--import">
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12" style={{marginRight:5,verticalAlign:'middle'}}>
              <path d="M7 1v7M4.5 5.5L7 8l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.5 10.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Employer Information — imported via OCR document scan
          </div>

          <div className="tax-row">
            <div className="tax-label">(b) Employer identification number</div>
            <div className="tax-input-cell">
              <input type="text" value={income.tcEmployerId} readOnly={isPreview}
                onChange={e => handleChange('tcEmployerId', e.target.value)}
                style={inputStyle('tcEmployerId')} placeholder="00-0000000"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(c) Name of employer</div>
            <div className="tax-input-cell">
              <input type="text" value={income.tcEmployerName} readOnly={isPreview}
                onChange={e => handleChange('tcEmployerName', e.target.value)}
                style={inputStyle('tcEmployerName')} placeholder="Employer name"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">Street address</div>
            <div className="tax-input-cell">
              <input type="text" value={income.tcStreetAddress} readOnly={isPreview}
                onChange={e => handleChange('tcStreetAddress', e.target.value)}
                style={inputStyle('tcStreetAddress')} placeholder="Street address"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">City / State / ZIP code</div>
            <div className="tax-input-cell tax-input-cell--split">
              <input type="text" value={income.tcCity} readOnly={isPreview}
                onChange={e => handleChange('tcCity', e.target.value)}
                placeholder="City" className="tax-input-city" style={inputStyle('tcCity')}/>
              <input type="text" value={income.tcState} readOnly={isPreview}
                onChange={e => handleChange('tcState', e.target.value)}
                placeholder="ST" className="tax-input-state" style={inputStyle('tcState')}/>
              <input type="text" value={income.tcZip} readOnly={isPreview}
                onChange={e => handleChange('tcZip', e.target.value)}
                placeholder="ZIP" className="tax-input-zip" style={inputStyle('tcZip')}/>
            </div>
          </div>

          <div className="tax-section-header">Wages</div>

          <div className="tax-row">
            <div className="tax-label">(1) Wages, tips, other compensation</div>
            <div className="tax-input-cell">
              <input type="text" value={income.tcW2Wages || ''} readOnly={isPreview}
                onChange={e => handleChange('tcW2Wages', e.target.value)}
                style={inputStyle('tcW2Wages')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(2) Federal income tax withheld</div>
            <div className="tax-input-cell">
              <input type="text" value={income.tcFedTaxWithheld || ''} readOnly={isPreview}
                onChange={e => handleChange('tcFedTaxWithheld', e.target.value)}
                style={inputStyle('tcFedTaxWithheld')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(3) Social security wages</div>
            <div className="tax-input-cell">
              <input type="text" value={income.tcSsWages || ''} readOnly={isPreview}
                onChange={e => handleChange('tcSsWages', e.target.value)}
                style={inputStyle('tcSsWages')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(4) Social security tax withheld</div>
            <div className="tax-input-cell">
              <input type="text" value={income.tcSsTaxWithheld || ''} readOnly={isPreview}
                onChange={e => handleChange('tcSsTaxWithheld', e.target.value)}
                style={inputStyle('tcSsTaxWithheld')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(5) Medicare wages and tips</div>
            <div className="tax-input-cell">
              <input type="text" value={income.tcMedicareWages || ''} readOnly={isPreview}
                onChange={e => handleChange('tcMedicareWages', e.target.value)}
                style={inputStyle('tcMedicareWages')} placeholder="0"/>
            </div>
          </div>

          <div className="tax-row">
            <div className="tax-label">(6) Medicare tax withheld</div>
            <div className="tax-input-cell">
              <input type="text" value={income.tcMedicareTax || ''} readOnly={isPreview}
                onChange={e => handleChange('tcMedicareTax', e.target.value)}
                style={inputStyle('tcMedicareTax')} placeholder="0"/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
