import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  onClose: () => void
}

interface FieldDef {
  id: string
  label: string
  value: string
  seriesId: string
  code: string
  prefix: number
  tsj: string
  type: string
  section: string
  suffix: string
  maxLength?: number
}

interface SectionDef {
  label: string
  fields: FieldDef[]
}

interface FormDef {
  id: string
  label: string
  title: string
  seriesId: string
  seriesBadge: number
  tabs?: string[]
  sections: SectionDef[]
  defaultFieldId: string
}

interface Annotation {
  num: number
  label: string
  description: string
  example?: string
  detailKey: keyof FieldDef | 'seriesLabel'
  target: 'page-title' | 'tabs' | 'field'
  position: 'left' | 'right'
  hint?: string  // short label shown in detail bar
}

// ─── Form definitions ───────────────────────────────────────────────────────

const FORMS: FormDef[] = [
  {
    id: 'wages',
    label: 'Wages and salaries',
    title: 'Details: Wages, Salaries, Tips (W-2)',
    seriesId: '11',
    seriesBadge: 11,
    tabs: ['Bing Equipment', 'Tech Circle'],
    defaultFieldId: 'w2-wages',
    sections: [
      {
        label: 'Employer Information (MANDATORY for e-file)',
        fields: [
          { id: 'w2-ein',      label: '(b) Employer identification number', value: '12-3456789',        seriesId: '11', code: '807', prefix: 1, tsj: '0 · Taxpayer', type: 'String',   section: 'Employer Information', suffix: '1000', maxLength: 10 },
          { id: 'w2-name',     label: '(c) Name of employer',               value: 'Bing Equipment',    seriesId: '11', code: '808', prefix: 1, tsj: '0 · Taxpayer', type: 'String',   section: 'Employer Information', suffix: '1000', maxLength: 35 },
          { id: 'w2-street',   label: 'Street address',                     value: '3833 Soundtech Ct', seriesId: '11', code: '809', prefix: 1, tsj: '0 · Taxpayer', type: 'String',   section: 'Employer Information', suffix: '1000', maxLength: 35 },
          { id: 'w2-city',     label: 'City / State / ZIP code',            value: 'Kentwood, CA 93004',seriesId: '11', code: '810', prefix: 1, tsj: '0 · Taxpayer', type: 'String',   section: 'Employer Information', suffix: '1000', maxLength: 35 },
        ],
      },
      {
        label: 'Wages',
        fields: [
          { id: 'w2-wages',    label: '(1) Wages, tips, etc.',              value: '60,000',  seriesId: '11', code: '800', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Wages', suffix: '1000, 1001, 1002…' },
          { id: 'w2-fedtax',   label: '(2) Federal income tax withheld',    value: '10,000',  seriesId: '11', code: '801', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Wages', suffix: '1000, 1001, 1002…' },
          { id: 'w2-sswages',  label: '(3) Social security wages',          value: '60,000',  seriesId: '11', code: '802', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Wages', suffix: '1000, 1001, 1002…' },
          { id: 'w2-sstax',    label: '(4) Social security tax withheld',   value: '3,720',   seriesId: '11', code: '803', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Wages', suffix: '1000, 1001, 1002…' },
          { id: 'w2-medwages', label: '(5) Medicare wages and tips',        value: '60,000',  seriesId: '11', code: '804', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Wages', suffix: '1000, 1001, 1002…' },
          { id: 'w2-medtax',   label: '(6) Medicare tax withheld',          value: '870',     seriesId: '11', code: '805', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Wages', suffix: '1000, 1001, 1002…' },
        ],
      },
    ],
  },
  {
    id: 'interest',
    label: 'Interest Income (1099-INT-OID)',
    title: 'Details: Interest Income (1099-INT)',
    seriesId: '14',
    seriesBadge: 14,
    tabs: ['First National Bank', 'City Credit Union'],
    defaultFieldId: 'int-interest',
    sections: [
      {
        label: 'Payer Information',
        fields: [
          { id: 'int-payer',   label: 'Name of payer',                      value: 'First National Bank', seriesId: '14', code: '1500', prefix: 1, tsj: '0 · Taxpayer', type: 'String',   section: 'Payer Information', suffix: '1000', maxLength: 35 },
          { id: 'int-ein',     label: "Payer's federal identification no.", value: '98-7654321',           seriesId: '14', code: '1501', prefix: 1, tsj: '0 · Taxpayer', type: 'String',   section: 'Payer Information', suffix: '1000', maxLength: 9 },
        ],
      },
      {
        label: 'Income',
        fields: [
          { id: 'int-interest', label: '(1) Interest income',                    value: '1,240',  seriesId: '14', code: '1502', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Income', suffix: '1000, 1001, 1002…' },
          { id: 'int-early',    label: '(2) Early withdrawal penalty',           value: '0',      seriesId: '14', code: '1503', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Income', suffix: '1000' },
          { id: 'int-us',       label: '(3) Interest on U.S. Savings Bonds',     value: '0',      seriesId: '14', code: '1504', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Income', suffix: '1000' },
          { id: 'int-fedtax',   label: '(4) Federal income tax withheld',        value: '248',    seriesId: '14', code: '1505', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Income', suffix: '1000' },
          { id: 'int-invest',   label: '(8) Tax-exempt interest',                value: '0',      seriesId: '14', code: '1506', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Income', suffix: '1000' },
          { id: 'int-foreign',  label: '(6) Foreign tax paid',                   value: '0',      seriesId: '14', code: '1507', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Income', suffix: '1000' },
        ],
      },
    ],
  },
  {
    id: 'dividends',
    label: 'Dividend Income (1099-DIV)',
    title: 'Details: Dividend Income (1099-DIV)',
    seriesId: '15',
    seriesBadge: 15,
    tabs: ['Vanguard Funds'],
    defaultFieldId: 'div-ordinary',
    sections: [
      {
        label: 'Payer Information',
        fields: [
          { id: 'div-payer',   label: 'Name of payer',                      value: 'Vanguard Funds',  seriesId: '15', code: '1600', prefix: 1, tsj: '0 · Taxpayer', type: 'String',   section: 'Payer Information', suffix: '1000', maxLength: 35 },
          { id: 'div-ein',     label: "Payer's federal identification no.", value: '23-1744206',      seriesId: '15', code: '1601', prefix: 1, tsj: '0 · Taxpayer', type: 'String',   section: 'Payer Information', suffix: '1000', maxLength: 9 },
        ],
      },
      {
        label: 'Dividends & Distributions',
        fields: [
          { id: 'div-ordinary',  label: '(1a) Total ordinary dividends',         value: '3,480',  seriesId: '15', code: '1602', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Dividends & Distributions', suffix: '1000, 1001, 1002…' },
          { id: 'div-qualified', label: '(1b) Qualified dividends',              value: '2,950',  seriesId: '15', code: '1603', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Dividends & Distributions', suffix: '1000, 1001, 1002…' },
          { id: 'div-cap',       label: '(2a) Total capital gain distributions', value: '820',    seriesId: '15', code: '1604', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Dividends & Distributions', suffix: '1000, 1001, 1002…' },
          { id: 'div-fedtax',    label: '(4) Federal income tax withheld',       value: '696',    seriesId: '15', code: '1605', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Dividends & Distributions', suffix: '1000' },
          { id: 'div-exempt',    label: '(12) Exempt-interest dividends',        value: '0',      seriesId: '15', code: '1606', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Dividends & Distributions', suffix: '1000' },
          { id: 'div-foreign',   label: '(6) Foreign tax paid',                  value: '0',      seriesId: '15', code: '1607', prefix: 1, tsj: '0 · Taxpayer', type: 'Currency', section: 'Dividends & Distributions', suffix: '1000' },
        ],
      },
    ],
  },
]

// Annotation 1 (Series) is on the LEFT; 2–7 on the RIGHT
const ANNOTATIONS: Annotation[] = [
  {
    num: 1,
    label: 'Series',
    description: 'All fields on this page share the same series number. Series groups every field on this form together in the API.',
    example: 'Wages & Salaries (W-2) = Series 11',
    detailKey: 'seriesLabel',
    target: 'page-title',
    position: 'left',
  },
  {
    num: 2,
    label: 'Prefix',
    description: 'The instance number when a taxpayer has multiple copies of the same form (e.g. two W-2s from different employers).',
    example: 'Bing Equipment = prefix 1 · Tech Circle = prefix 2',
    detailKey: 'prefix',
    target: 'tabs',
    position: 'right',
  },
  {
    num: 3,
    label: 'Code',
    description: 'The unique numeric ID that identifies this specific field in the API.',
    detailKey: 'code',
    target: 'field',
    position: 'right',
  },
  {
    num: 4,
    label: 'TSJ',
    description: '0 = Taxpayer, 1 = Spouse. Tells the API which filer this field belongs to on a joint return.',
    example: 'Wages field for taxpayer = TSJ 0 · Same field for spouse = TSJ 1',
    detailKey: 'tsj',
    target: 'field',
    position: 'right',
  },
  {
    num: 5,
    label: 'Type',
    description: "The data format the API expects: String (text), Currency (dollar amount), Boolean (true/false), Date, or Enum (must be one of the listed values).",
    detailKey: 'type',
    target: 'field',
    position: 'right',
  },
  {
    num: 6,
    label: 'Suffix',
    description: 'Always 1000 for a single value. When a field supports multiple sub-values (e.g. wages split across states), each row gets its own suffix: 1000, 1001, 1002… The API aggregates them into one total.',
    example: 'Wages: CA allocation = suffix 1000 · NY allocation = suffix 1001',
    detailKey: 'suffix',
    target: 'field',
    position: 'right',
  },
  {
    num: 7,
    label: 'Char limit',
    description: 'Maximum number of characters the API accepts for this field. Only applies to String fields. Sending more characters will cause a validation error.',
    detailKey: 'maxLength',
    target: 'field',
    position: 'right',
  },
]

// Series badge numbers per nav item (null = no badge / not a numbered series)
const NAV_SECTIONS = [
  { label: 'General', type: 'section' as const },
  { label: 'Income', type: 'section' as const },
  { id: 'wages',     label: 'Wages and salaries',              type: 'item' as const, interactive: true,  series: 11 },
  { id: 'interest',  label: 'Interest Income (1099-INT-OID)',  type: 'item' as const, interactive: true,  series: 14 },
  { id: 'dividends', label: 'Dividend Income (1099-DIV)',      type: 'item' as const, interactive: true,  series: 15 },
  { label: 'Net operating loss',               type: 'item' as const, interactive: false, series: 16 },
  { label: 'Rental and royalty income',        type: 'item' as const, interactive: false, series: 17 },
  { label: 'Business income',                  type: 'item' as const, interactive: false, series: 18 },
  { label: 'Dispositions (Schedule D, 4797)',  type: 'item' as const, interactive: false, series: null },
  { label: '› Passthrough K-1s',               type: 'item' as const, interactive: false, series: null },
  { label: 'Deductions', type: 'section' as const },
  { label: 'Credits',  type: 'item' as const, interactive: false, series: null },
  { label: 'Taxes',    type: 'item' as const, interactive: false, series: null },
  { label: 'Other',    type: 'item' as const, interactive: false, series: null },
]

export default function TaxMappingGuide({ onClose }: Props) {
  const [activeFormId, setActiveFormId] = useState<string>('wages')
  const [activeTab, setActiveTab] = useState(0)
  const [hoveredAnnotation, setHoveredAnnotation] = useState<number | null>(null)

  const form = FORMS.find(f => f.id === activeFormId)!
  const allFields = form.sections.flatMap(s => s.fields)
  const defaultField = allFields.find(f => f.id === form.defaultFieldId)!

  const [selectedField, setSelectedField] = useState<FieldDef>(defaultField)

  function switchForm(formId: string) {
    const newForm = FORMS.find(f => f.id === formId)!
    const newFields = newForm.sections.flatMap(s => s.fields)
    activeNavItemRef.current = null
    setActiveFormId(formId)
    setActiveTab(0)
    setSelectedField(newFields.find(f => f.id === newForm.defaultFieldId)!)
    forceUpdate(n => n + 1)
  }

  const fieldRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const annotationRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const pageTitleRef = useRef<HTMLDivElement | null>(null)
  const activeNavItemRef = useRef<HTMLDivElement | null>(null)
  const tabsRowRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [, forceUpdate] = useState(0)

  const prefix = activeTab + 1

  useEffect(() => {
    const ro = new ResizeObserver(() => forceUpdate(n => n + 1))
    if (bodyRef.current) ro.observe(bodyRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    forceUpdate(n => n + 1)
  }, [activeFormId, selectedField?.id, activeTab])

  // Connector from left-side Series card → active nav item (where the series badge lives)
  function getConnectorPathLeft(ann: Annotation): string | null {
    const annotationEl = annotationRefs.current[ann.num]
    const container = bodyRef.current
    if (!annotationEl || !container) return null

    const containerRect = container.getBoundingClientRect()
    const annRect = annotationEl.getBoundingClientRect()

    // Start from right edge of Series card
    const x1 = annRect.right - containerRect.left
    const y1 = annRect.top + annRect.height / 2 - containerRect.top

    // Target: active nav item (prefer) or page title as fallback
    const targetEl: HTMLElement | null = activeNavItemRef.current ?? pageTitleRef.current
    if (!targetEl) return null
    const tgtRect = targetEl.getBoundingClientRect()

    const x2 = tgtRect.left - containerRect.left
    const y2 = tgtRect.top + tgtRect.height / 2 - containerRect.top

    const midX = x1 + (x2 - x1) * 0.5
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
  }

  // Connector from right-side annotation → field/tab (Prefix, Code, TSJ, Type)
  function getConnectorPathRight(ann: Annotation): string | null {
    const annotationEl = annotationRefs.current[ann.num]
    const container = bodyRef.current
    if (!annotationEl || !container) return null

    const containerRect = container.getBoundingClientRect()
    const annRect = annotationEl.getBoundingClientRect()

    // Connector starts from left edge of annotation card
    const x2 = annRect.left - containerRect.left
    const y2 = annRect.top + annRect.height / 2 - containerRect.top

    let sourceEl: HTMLElement | null = null
    if (ann.target === 'tabs') {
      sourceEl = form.tabs ? tabsRowRef.current : pageTitleRef.current
    } else {
      sourceEl = selectedField ? fieldRefs.current[selectedField.id] ?? null : null
    }

    if (!sourceEl) return null
    const srcRect = sourceEl.getBoundingClientRect()

    const x1 = srcRect.right - containerRect.left
    const y1 = srcRect.top + srcRect.height / 2 - containerRect.top

    const midX = x1 + (x2 - x1) * 0.5
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
  }

  function getDetailValue(field: FieldDef, key: Annotation['detailKey']): string {
    if (key === 'seriesLabel') return `Series ${field.seriesId}`
    if (key === 'maxLength') return field.maxLength ? `${field.maxLength} chars` : 'No limit'
    return String(field[key as keyof FieldDef])
  }

  function getApiNotation(field: FieldDef): string {
    const val = field.value.replace(/,/g, '')
    return `${field.seriesId}.${field.prefix}.${field.code}.${field.tsj.split(' ')[0]}.${field.suffix.split(',')[0].trim()} = ${field.type}(${val})`
  }

  function handleFieldClick(field: FieldDef, displayValue: string) {
    setSelectedField({ ...field, prefix, value: displayValue })
    forceUpdate(n => n + 1)
  }

  const tabs = form.tabs ?? []

  const leftAnnotations = ANNOTATIONS.filter(a => a.position === 'left')
  const rightAnnotations = ANNOTATIONS.filter(a => a.position === 'right')

  return createPortal(
    <div className="tmg-trowser">
      {/* Header — centered title + X close */}
      <div className="tmg-trowser-header tmg-trowser-header--centered">
        <div className="tmg-trowser-header-spacer" />
        <div className="tmg-trowser-title-center">
          <h2 className="tmg-trowser-title">How to read mapping sheets?</h2>
        </div>
        <div className="tmg-trowser-header-right">
          <button className="tmg-trowser-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Instruction row — centered */}
      <div className="tmg-instruction-row tmg-instruction-row--centered">
        <p className="tmg-instruction-text">
          Each field in ProConnect maps to the API using a combination of <strong>Series</strong>, <strong>Prefix</strong>, <strong>Code</strong>, <strong>TSJ</strong>, and <strong>Type</strong>.
          Click a nav item or field to explore.
        </p>
      </div>

      {/* Body: [Series LEFT] [screen] [annotations RIGHT] */}
      <div className="tmg-trowser-body" ref={bodyRef}>

        {/* SVG connector overlay — always visible, dim at rest / bright on hover */}
        <svg className="tmg-connector-svg" aria-hidden="true">
          {leftAnnotations.map(ann => {
            const path = getConnectorPathLeft(ann)
            if (!path) return null
            const isHovered = hoveredAnnotation === ann.num
            return (
              <path
                key={ann.num}
                d={path}
                className={`tmg-connector-path tmg-connector-path--always ${isHovered ? 'tmg-connector-path--active' : ''}`}
                fill="none"
              />
            )
          })}
          {rightAnnotations.map(ann => {
            const path = getConnectorPathRight(ann)
            if (!path) return null
            const isHovered = hoveredAnnotation === ann.num
            return (
              <path
                key={ann.num}
                d={path}
                className={`tmg-connector-path tmg-connector-path--always ${isHovered ? 'tmg-connector-path--active' : ''}`}
                fill="none"
              />
            )
          })}
        </svg>

        {/* LEFT: Series annotation card */}
        <div className="tmg-annotations tmg-annotations--left">
          {leftAnnotations.map(ann => (
            <div
              key={ann.num}
              ref={el => { annotationRefs.current[ann.num] = el }}
              className={`tmg-ann-card tmg-ann-card--series ${hoveredAnnotation === ann.num ? 'tmg-ann-card--hover' : ''}`}
              onMouseEnter={() => setHoveredAnnotation(ann.num)}
              onMouseLeave={() => setHoveredAnnotation(null)}
            >
              <div className="tmg-ann-card-top">
                <span className="tmg-ann-num">{ann.num}</span>
                <span className="tmg-ann-label">{ann.label}</span>
                {selectedField && (
                  <span className="tmg-ann-value">{getDetailValue(selectedField, ann.detailKey)}</span>
                )}
              </div>
              <div className="tmg-ann-desc">{ann.description}</div>
              {ann.example && <div className="tmg-ann-example">{ann.example}</div>}
            </div>
          ))}
        </div>

        {/* ProConnect screen mockup */}
        <div className="tmg-screen-wrap">
          <div className="tmg-pc-screen">
            <div className="tmg-pc-body">

              {/* Left nav with series badges */}
              <div className="tmg-pc-nav">
                {NAV_SECTIONS.map((item, i) => {
                  if (item.type === 'section') {
                    return <div key={i} className="tmg-pc-nav-section">{item.label}</div>
                  }
                  const isActive = 'id' in item && item.id === activeFormId
                  const isInteractive = item.interactive
                  return (
                    <div
                      key={i}
                      ref={isActive ? activeNavItemRef : undefined}
                      className={`tmg-pc-nav-item ${isActive ? 'tmg-pc-nav-item--active' : ''} ${!isInteractive ? 'tmg-pc-nav-item--disabled' : ''}`}
                      onClick={() => isInteractive && 'id' in item && item.id && switchForm(item.id)}
                      title={!isInteractive ? 'Not available in this example' : undefined}
                    >
                      <span className="tmg-pc-nav-item-label">{item.label}</span>
                      {'series' in item && item.series != null && (
                        <span className={`tmg-pc-nav-badge ${isActive ? 'tmg-pc-nav-badge--active' : ''}`}>{item.series}</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Content */}
              <div className="tmg-pc-content">
                {/* Page title — SERIES target */}
                <div className="tmg-pc-title" ref={pageTitleRef}>
                  {form.title}
                  <span className="tmg-pc-title-series">Series {form.seriesId}</span>
                </div>

                {/* Tabs — PREFIX target */}
                {tabs.length > 0 && (
                  <div className="tmg-pc-tabs" ref={tabsRowRef}>
                    {tabs.map((name, i) => (
                      <button
                        key={i}
                        className={`tmg-pc-tab ${activeTab === i ? 'tmg-pc-tab--active' : ''}`}
                        onClick={() => {
                          setActiveTab(i)
                          setSelectedField(prev => ({ ...prev, prefix: i + 1 }))
                          forceUpdate(n => n + 1)
                        }}
                      >
                        {name} ×
                      </button>
                    ))}
                    <button className="tmg-pc-tab-add">+ View All ▾</button>
                  </div>
                )}

                {/* Fields */}
                <div className="tmg-pc-fields">
                  {form.sections.map(sec => (
                    <div key={sec.label}>
                      <div className="tmg-pc-section-header">{sec.label}</div>
                      {sec.fields.map(field => {
                        const isSelected = selectedField?.id === field.id
                        const displayValue = (activeFormId === 'wages' && field.id === 'w2-name')
                          ? (tabs[activeTab] ?? field.value)
                          : field.value
                        return (
                          <button
                            key={field.id}
                            ref={el => { fieldRefs.current[field.id] = el }}
                            className={`tmg-pc-field-row ${isSelected ? 'tmg-pc-field-row--selected' : ''}`}
                            onClick={() => handleFieldClick(field, displayValue)}
                          >
                            <span className="tmg-pc-field-label">{field.label}</span>
                            <span className="tmg-pc-field-input">{displayValue}</span>
                            {isSelected && (
                              <span className="tmg-pc-field-notation">{getApiNotation({ ...field, prefix, value: displayValue })}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT: Prefix, Code, TSJ, Type annotation cards */}
        <div className="tmg-annotations tmg-annotations--right">
          <div className="tmg-annotations-title">Mapping concepts</div>
          {rightAnnotations.map(ann => (
            <div
              key={ann.num}
              ref={el => { annotationRefs.current[ann.num] = el }}
              className={`tmg-ann-card ${hoveredAnnotation === ann.num ? 'tmg-ann-card--hover' : ''}`}
              onMouseEnter={() => setHoveredAnnotation(ann.num)}
              onMouseLeave={() => setHoveredAnnotation(null)}
            >
              <div className="tmg-ann-card-top">
                <span className="tmg-ann-num">{ann.num}</span>
                <span className="tmg-ann-label">{ann.label}</span>
                {selectedField && (
                  <span className="tmg-ann-value">{getDetailValue(selectedField, ann.detailKey)}</span>
                )}
              </div>
              <div className="tmg-ann-desc">{ann.description}</div>
              {ann.example && <div className="tmg-ann-example">{ann.example}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom detail bar */}
      <div className="tmg-detail-bar">
        {selectedField ? (
          <div className="tmg-detail-inner">
            <div className="tmg-detail-notation-row">
              <span className="tmg-detail-notation-label">API notation</span>
              <code className="tmg-detail-notation">{getApiNotation(selectedField)}</code>
              <button
                className="tmg-detail-copy-btn"
                onClick={() => navigator.clipboard.writeText(getApiNotation(selectedField))}
                title="Copy to clipboard"
              >
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M11 5V4a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 2 4v7A1.5 1.5 0 0 0 3.5 12.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Copy
              </button>
            </div>
            <div className="tmg-detail-pills">
              {ANNOTATIONS.map(ann => (
                <div
                  key={ann.num}
                  className={`tmg-detail-pill ${hoveredAnnotation === ann.num ? 'tmg-detail-pill--hover' : ''}`}
                  onMouseEnter={() => setHoveredAnnotation(ann.num)}
                  onMouseLeave={() => setHoveredAnnotation(null)}
                >
                  <span className="tmg-detail-pill-num">{ann.num}</span>
                  <span className="tmg-detail-pill-label">{ann.label}</span>
                  <span className="tmg-detail-pill-value">{getDetailValue(selectedField, ann.detailKey)}</span>
                </div>
              ))}
              <div className="tmg-detail-pill">
                <span className="tmg-detail-pill-label">Value</span>
                <span className="tmg-detail-pill-value tmg-detail-pill-value--strong">{selectedField.value}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="tmg-detail-empty">Select a field above to see its API notation</div>
        )}
      </div>
    </div>,
    document.body
  )
}
