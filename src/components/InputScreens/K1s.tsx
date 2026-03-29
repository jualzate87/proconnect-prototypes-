
import { useAppContext } from '../../index'
import '../../styles/input-screens.css'

export default function K1s() {
  const { highlightedFields, highlightColor } = useAppContext()

  function rowClass(fields: string[]) {
    const hit = fields.some(f => highlightedFields.includes(f))
    return hit ? 'tax-row tax-row--highlighted' : 'tax-row'
  }
  function highlightStyle(fields: string[]): React.CSSProperties {
    return fields.some(f => highlightedFields.includes(f))
      ? { background: highlightColor + '18', borderLeft: `3px solid ${highlightColor}` }
      : {}
  }

  return (
    <div className="screen">
      <div className="screen-title-row">
        <h1 className="screen-title">Passthrough K-1s</h1>
      </div>

      {/* ── Partnership / S-Corp K-1 ── */}
      <div className="tax-table">
        <div className="tax-section-header tax-section-header--import">
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13" style={{ marginRight: 6, flexShrink: 0 }}>
            <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Partnership K-1 (Form 1065) — Ridgeline Partners LLC
          <span className="import-source-badge" style={{ marginLeft: 8 }}>Alfred API</span>
        </div>

        <div className={rowClass(['k1s.p1.partnerName'])} style={highlightStyle(['k1s.p1.partnerName'])}>
          <div className="tax-label">Partnership / entity name</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="Ridgeline Partners LLC" />
          </div>
        </div>
        <div className={rowClass(['k1s.p1.ein'])} style={highlightStyle(['k1s.p1.ein'])}>
          <div className="tax-label">Employer identification number (EIN)</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="82-3947201" />
          </div>
        </div>
        <div className={rowClass(['k1s.p1.ownershipPct'])} style={highlightStyle(['k1s.p1.ownershipPct'])}>
          <div className="tax-label">Partner's ownership percentage</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="12.5" />
          </div>
        </div>

        <div className="tax-section-header" style={{ background: 'transparent', fontWeight: 500, fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 0, marginTop: 4 }}>
          Income / (Loss) Items
        </div>

        <div className={rowClass(['k1s.p1.ordinaryIncome'])} style={highlightStyle(['k1s.p1.ordinaryIncome'])}>
          <div className="tax-label">(1) Ordinary business income / (loss)</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="34,820" />
          </div>
        </div>
        <div className={rowClass(['k1s.p1.rentalIncome'])} style={highlightStyle(['k1s.p1.rentalIncome'])}>
          <div className="tax-label">(2) Net rental real estate income / (loss)</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="6,450" />
          </div>
        </div>
        <div className={rowClass(['k1s.p1.guaranteedPayments'])} style={highlightStyle(['k1s.p1.guaranteedPayments'])}>
          <div className="tax-label">(4) Guaranteed payments</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="0" />
          </div>
        </div>
        <div className={rowClass(['k1s.p1.interestIncome'])} style={highlightStyle(['k1s.p1.interestIncome'])}>
          <div className="tax-label">(5) Interest income</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="1,240" />
          </div>
        </div>
        <div className={rowClass(['k1s.p1.ordinaryDividends'])} style={highlightStyle(['k1s.p1.ordinaryDividends'])}>
          <div className="tax-label">(6a) Ordinary dividends</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="880" />
          </div>
        </div>
        <div className={rowClass(['k1s.p1.capitalGains'])} style={highlightStyle(['k1s.p1.capitalGains'])}>
          <div className="tax-label">(9a) Net long-term capital gain / (loss)</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="4,100" />
          </div>
        </div>
        <div className={rowClass(['k1s.p1.section179'])} style={highlightStyle(['k1s.p1.section179'])}>
          <div className="tax-label">(11) Section 179 deduction</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="0" />
          </div>
        </div>

        <div className="tax-section-header" style={{ background: 'transparent', fontWeight: 500, fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 0, marginTop: 4 }}>
          Deductions &amp; Credits
        </div>

        <div className={rowClass(['k1s.p1.charitableContrib'])} style={highlightStyle(['k1s.p1.charitableContrib'])}>
          <div className="tax-label">(13) Charitable contributions</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="500" />
          </div>
        </div>
        <div className={rowClass(['k1s.p1.selfEmployTax'])} style={highlightStyle(['k1s.p1.selfEmployTax'])}>
          <div className="tax-label">(14) Self-employment earnings</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="34,820" />
          </div>
        </div>
      </div>

      {/* ── S-Corp K-1 ── */}
      <div className="tax-table" style={{ marginTop: 24 }}>
        <div className="tax-section-header">
          S-Corporation K-1 (Form 1120-S) — Cascade Digital Solutions Inc.
        </div>

        <div className={rowClass(['k1s.s1.corpName'])} style={highlightStyle(['k1s.s1.corpName'])}>
          <div className="tax-label">Corporation name</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="Cascade Digital Solutions Inc." />
          </div>
        </div>
        <div className={rowClass(['k1s.s1.ein'])} style={highlightStyle(['k1s.s1.ein'])}>
          <div className="tax-label">Employer identification number (EIN)</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="91-7053284" />
          </div>
        </div>
        <div className={rowClass(['k1s.s1.stockPct'])} style={highlightStyle(['k1s.s1.stockPct'])}>
          <div className="tax-label">Shareholder's stock percentage</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="25.0" />
          </div>
        </div>

        <div className={rowClass(['k1s.s1.ordinaryIncome'])} style={highlightStyle(['k1s.s1.ordinaryIncome'])}>
          <div className="tax-label">(1) Ordinary business income / (loss)</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="48,600" />
          </div>
        </div>
        <div className={rowClass(['k1s.s1.dividends'])} style={highlightStyle(['k1s.s1.dividends'])}>
          <div className="tax-label">(5) Dividends</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="1,250" />
          </div>
        </div>
        <div className={rowClass(['k1s.s1.section179'])} style={highlightStyle(['k1s.s1.section179'])}>
          <div className="tax-label">(11) Section 179 deduction</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="3,800" />
          </div>
        </div>
        <div className={rowClass(['k1s.s1.otherDeductions'])} style={highlightStyle(['k1s.s1.otherDeductions'])}>
          <div className="tax-label">(12) Other deductions</div>
          <div className="tax-input-cell">
            <input className="tax-input" defaultValue="920" />
          </div>
        </div>

        <div className="tax-row" style={{ paddingTop: 8 }}>
          <div className="tax-label">Notes</div>
          <div className="tax-input-cell">
            <textarea className="tax-input tax-input--textarea" placeholder="Add preparer notes…" rows={2} />
          </div>
        </div>
      </div>
    </div>
  )
}
